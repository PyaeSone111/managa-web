<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\StartSeriesBulkImportJob;
use App\Models\MangaType;
use App\Models\Series;
use App\Models\SeriesImportBatch;
use App\Services\CacheInvalidator;
use App\Services\SeriesImportService;
use App\Support\ImportUrlValidator;
use App\Support\QueueGuard;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class AdminSeriesController extends Controller
{
    /**
     * Store an image file to Cloudflare R2 and return the public URL.
     */
    protected function storeImageToR2(Request $request, string $key, string $folder): ?string
    {
        if (!$request->hasFile($key)) {
            return null;
        }
        $file = $request->file($key);
        $disk = Storage::disk(config('filesystems.cloud', 'r2'));
        $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        $storedPath = $disk->putFileAs('uploads/' . $folder, $file, $filename, 'public');
        $url = $disk->url($storedPath);
        if (!empty(env('R2_PUBLIC_URL'))) {
            $url = rtrim(env('R2_PUBLIC_URL'), '/') . '/' . $storedPath;
        }
        return $url;
    }

    /**
     * Shared validation rules for series relation payloads.
     */
    protected function seriesRelationRules(): array
    {
        return [
            'release_date' => 'nullable|date',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'exists:categories,id',
            'tag_ids' => 'nullable|array',
            'tag_ids.*' => 'exists:tags,id',
            'type_ids' => 'nullable|array',
            'type_ids.*' => 'exists:manga_types,id',
            'author_ids' => 'nullable|array',
            'author_ids.*.id' => 'required|exists:authors,id',
            'author_ids.*.role' => 'nullable|string|in:author,artist,both',
            'alt_names' => 'nullable|array',
            'alt_names.*.name' => 'required|string|max:500',
            'alt_names.*.language' => 'nullable|string|max:10',
        ];
    }

    /**
     * Eager-load all series relations for admin responses.
     */
    protected function loadSeriesRelations(Series $series): Series
    {
        return $series->load([
            'categories',
            'tags',
            'mangaTypes',
            'authors',
            'altNames',
        ]);
    }

    /**
     * Clear public API caches for a series (show + every list/dashboard/ranking group).
     */
    protected function clearSeriesCache(Series $series, ?string $previousSlug = null): void
    {
        app(CacheInvalidator::class)->invalidateSeries($series, $previousSlug);
    }

    /**
     * Sync pivot / related records sent from the admin form.
     */
    protected function syncSeriesRelations(Series $series, Request $request, array $validated): void
    {
        $payload = $request->all();

        if (array_key_exists('category_ids', $payload)) {
            $series->categories()->sync($validated['category_ids'] ?? []);
        }

        if (array_key_exists('tag_ids', $payload)) {
            $series->tags()->sync($validated['tag_ids'] ?? []);
        }

        if (array_key_exists('type_ids', $payload)) {
            $series->mangaTypes()->sync($validated['type_ids'] ?? []);
        }

        if (array_key_exists('author_ids', $payload)) {
            $sync = [];
            foreach ($validated['author_ids'] ?? [] as $entry) {
                $authorId = is_array($entry) ? ($entry['id'] ?? null) : $entry;
                if ($authorId) {
                    $sync[$authorId] = [
                        'role' => is_array($entry) ? ($entry['role'] ?? 'author') : 'author',
                    ];
                }
            }
            $series->authors()->sync($sync);
        }

        if (array_key_exists('alt_names', $payload)) {
            $series->altNames()->delete();
            foreach ($validated['alt_names'] ?? [] as $alt) {
                $series->altNames()->create([
                    'name' => $alt['name'],
                    'language' => $alt['language'] ?? null,
                ]);
            }
        }
    }

    /**
     * Strip relation keys before persisting scalar series columns.
     */
    protected function extractScalarAttributes(array $validated): array
    {
        unset(
            $validated['category_ids'],
            $validated['tag_ids'],
            $validated['type_ids'],
            $validated['author_ids'],
            $validated['alt_names'],
            $validated['cover_image'],
            $validated['thumbnail_image']
        );

        return $validated;
    }

    /**
     * List series for admin (no cache, includes inactive).
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->input('per_page', 20), 1000);
        $types = $request->input('types');
        $search = $request->input('search');

        $query = Series::query()
            ->with(['categories:id,name,slug', 'mangaTypes:id,name,slug', 'authors:id,name,slug'])
            ->orderByDesc('updated_at');

        if ($types) {
            $typeIds = array_filter(explode(',', (string) $types));
            if (!empty($typeIds)) {
                $query->whereHas('mangaTypes', fn ($q) => $q->whereIn('manga_types.id', $typeIds));
            }
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('author', 'like', "%{$search}%");
            });
        }

        $result = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $result->items(),
            'pagination' => [
                'current_page' => $result->currentPage(),
                'last_page' => $result->lastPage(),
                'per_page' => $result->perPage(),
                'total' => $result->total(),
            ],
        ])->header('Cache-Control', 'no-store, no-cache, must-revalidate');
    }

    /**
     * Get series details for admin edit (no cache).
     */
    public function show($id): JsonResponse
    {
        $series = Series::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $this->loadSeriesRelations($series),
        ])->header('Cache-Control', 'no-store, no-cache, must-revalidate');
    }

    /**
     * Create a new series
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate(array_merge([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:series,slug',
            'description' => 'nullable|string',
            'thumbnail_url' => 'nullable|url',
            'cover_url' => 'nullable|url',
            'thumbnail_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:10240',
            'cover_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:10240',
            'type' => ['required', Rule::in(['manga', 'manhwa', 'manhua'])],
            'status' => ['required', Rule::in(['ongoing', 'completed', 'hiatus', 'cancelled'])],
            'author' => 'nullable|string|max:255',
            'artist' => 'nullable|string|max:255',
            'year' => 'nullable|integer|min:1900|max:' . date('Y'),
            'is_featured' => 'nullable|boolean',
        ], $this->seriesRelationRules()));

        $coverUrl = $this->storeImageToR2($request, 'cover_image', 'cover');
        if ($coverUrl !== null) {
            $validated['cover_url'] = $coverUrl;
        }
        $thumbUrl = $this->storeImageToR2($request, 'thumbnail_image', 'thumbnail');
        if ($thumbUrl !== null) {
            $validated['thumbnail_url'] = $thumbUrl;
        }

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
            $counter = 1;
            $originalSlug = $validated['slug'];
            while (Series::where('slug', $validated['slug'])->exists()) {
                $validated['slug'] = $originalSlug . '-' . $counter;
                $counter++;
            }
        }

        $series = Series::create($this->extractScalarAttributes($validated));
        $this->syncSeriesRelations($series, $request, $validated);
        $this->clearSeriesCache($series);

        return response()->json([
            'success' => true,
            'data' => $this->loadSeriesRelations($series),
            'message' => 'Series created successfully'
        ], 201);
    }

    /**
     * Update a series
     */
    public function update(Request $request, $id): JsonResponse
    {
        $series = Series::findOrFail($id);
        $previousSlug = $series->slug;

        $validated = $request->validate(array_merge([
            'title' => 'sometimes|string|max:255',
            'slug' => ['sometimes', 'string', 'max:255', Rule::unique('series', 'slug')->ignore($id)],
            'description' => 'nullable|string',
            'thumbnail_url' => 'nullable|url',
            'cover_url' => 'nullable|url',
            'thumbnail_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:10240',
            'cover_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:10240',
            'type' => ['sometimes', Rule::in(['manga', 'manhwa', 'manhua'])],
            'status' => ['sometimes', Rule::in(['ongoing', 'completed', 'hiatus', 'cancelled'])],
            'author' => 'nullable|string|max:255',
            'artist' => 'nullable|string|max:255',
            'year' => 'nullable|integer|min:1900|max:' . date('Y'),
            'is_featured' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
        ], $this->seriesRelationRules()));

        $coverUrl = $this->storeImageToR2($request, 'cover_image', 'cover');
        if ($coverUrl !== null) {
            $validated['cover_url'] = $coverUrl;
        }
        $thumbUrl = $this->storeImageToR2($request, 'thumbnail_image', 'thumbnail');
        if ($thumbUrl !== null) {
            $validated['thumbnail_url'] = $thumbUrl;
        }

        $series->update($this->extractScalarAttributes($validated));
        $this->syncSeriesRelations($series, $request, $validated);
        $series->refresh();
        $this->clearSeriesCache($series, $previousSlug);

        return response()->json([
            'success' => true,
            'data' => $this->loadSeriesRelations($series),
            'message' => 'Series updated successfully'
        ]);
    }

    /**
     * Delete a series
     */
    public function destroy($id): JsonResponse
    {
        $series = Series::findOrFail($id);
        $this->clearSeriesCache($series);
        $series->delete();

        return response()->json([
            'success' => true,
            'message' => 'Series deleted successfully'
        ]);
    }

    /**
     * Bulk import series with chapters from MediaFire folders.
     * Each row is queued as a background job to avoid HTTP timeouts.
     */
    public function bulkImport(Request $request, SeriesImportService $importService): JsonResponse
    {
        if ($response = QueueGuard::ensureAsyncQueue()) {
            return $response;
        }

        $normalizedRows = collect($request->input('rows', []))->map(function ($row) use ($importService) {
            $imageUrl = $importService->normalizeExternalUrl($row['image_url'] ?? null);
            $typeIds = array_values(array_filter(array_map('intval', $row['type_ids'] ?? [])));

            return array_merge($row, [
                'type_ids' => $typeIds,
                'type' => $this->resolveImportLegacyType($row['type'] ?? null, $typeIds),
                'status' => $this->normalizeImportStatus($row['status'] ?? null),
                'image_url' => $imageUrl,
            ]);
        })->all();

        $request->merge(['rows' => $normalizedRows]);

        $validated = $request->validate([
            'rows' => 'required|array|min:1|max:100',
            'rows.*.title' => 'required|string|max:255',
            'rows.*.description' => 'nullable|string',
            'rows.*.authors' => 'nullable|string|max:500',
            'rows.*.image_url' => ['nullable', 'string', 'max:2000', function ($attribute, $value, $fail) {
                if (!ImportUrlValidator::isValidImageUrl($value)) {
                    $fail('The image URL must be a valid URL (MediaFire view links like mediafire.com/view/.../file are supported).');
                }
            }],
            'rows.*.mediafire_folder_url' => 'required|url',
            'rows.*.pages_per_chapter' => 'nullable|integer|min:1|max:500',
            'rows.*.type_ids' => 'required|array|min:1',
            'rows.*.type_ids.*' => 'integer|exists:manga_types,id',
            'rows.*.type' => 'nullable|string|in:manga,manhwa,manhua',
            'rows.*.status' => 'required|string|in:ongoing,completed,hiatus,cancelled',
            'rows.*.row_number' => 'nullable|integer',
            'is_published' => 'nullable|boolean',
        ]);

        $isPublished = $validated['is_published'] ?? true;

        $batch = SeriesImportBatch::create([
            'user_id' => $request->user()?->id,
            'status' => SeriesImportBatch::STATUS_PENDING,
            'total_rows' => count($validated['rows']),
            'rows' => $validated['rows'],
            'is_published' => $isPublished,
            'results' => [],
        ]);

        StartSeriesBulkImportJob::dispatch($batch->id)->onConnection('database');

        return response()->json([
            'success' => true,
            'data' => array_merge($batch->toStatusPayload(), [
                'message' => 'Import queued. Processing in background — refresh progress below.',
            ]),
        ], 202);
    }

    /**
     * Poll bulk import batch progress.
     */
    public function bulkImportStatus(int $batchId): JsonResponse
    {
        $batch = SeriesImportBatch::findOrFail($batchId);

        return response()->json([
            'success' => true,
            'data' => $batch->toStatusPayload(),
        ]);
    }

    private function resolveImportLegacyType(?string $type, array $typeIds): string
    {
        $value = strtolower(trim((string) $type));
        if (in_array($value, ['manga', 'manhwa', 'manhua'], true)) {
            return $value;
        }

        if (!empty($typeIds)) {
            $mangaType = MangaType::find($typeIds[0]);
            if ($mangaType) {
                $slug = strtolower($mangaType->slug);
                if (in_array($slug, ['manga', 'manhwa', 'manhua'], true)) {
                    return $slug;
                }
            }
        }

        return 'manga';
    }

    private function normalizeImportType(?string $type): string
    {
        $value = strtolower(trim((string) $type));

        return in_array($value, ['manga', 'manhwa', 'manhua'], true) ? $value : 'manga';
    }

    private function normalizeImportStatus(?string $status): string
    {
        $value = strtolower(trim((string) $status));

        return in_array($value, ['ongoing', 'completed', 'hiatus', 'cancelled'], true) ? $value : 'ongoing';
    }
}
