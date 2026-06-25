<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Series;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;
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
     * Clear public API caches for a series (by id and slug).
     */
    protected function clearSeriesCache(Series $series, ?string $previousSlug = null): void
    {
        Cache::forget("series:show:{$series->id}");
        Cache::forget("series:show:{$series->slug}");

        if ($previousSlug && $previousSlug !== $series->slug) {
            Cache::forget("series:show:{$previousSlug}");
        }
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
}
