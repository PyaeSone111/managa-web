<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Author;
use App\Support\ImportUrlValidator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class AdminAuthorController extends Controller
{
    /**
     * Clear public API authors list cache (AuthorController uses exact keys, not wildcards).
     */
    protected static function clearAuthorsListCache(): void
    {
        $searchHash = md5('');
        foreach ([1, 2, 3, 4, 5] as $page) {
            foreach ([20, 50, 100] as $perPage) {
                Cache::forget("authors:list:v2:{$page}:{$perPage}:{$searchHash}");
            }
        }
    }

    /**
     * List all authors (admin view).
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:1000',
            'search' => 'nullable|string|max:100',
        ]);

        $perPage = min($request->input('per_page', 20), 1000);

        $query = Author::withCount('series');

        if ($request->has('search')) {
            $query->where('name', 'ILIKE', '%' . $request->search . '%');
        }

        $authors = $query->orderBy('name')->paginate($perPage);

        return response()->json([
            'data' => $authors->items(),
            'meta' => [
                'current_page' => $authors->currentPage(),
                'per_page' => $authors->perPage(),
                'total' => $authors->total(),
                'total_pages' => $authors->lastPage(),
            ],
        ])->header('Cache-Control', 'no-store, no-cache, must-revalidate');
    }

    /**
     * Get an author for admin edit.
     */
    public function show(int $id): JsonResponse
    {
        $author = Author::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $author,
        ])->header('Cache-Control', 'no-store, no-cache, must-revalidate');
    }

    /**
     * Create a new author.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:authors,slug',
            'bio' => 'nullable|string',
            'image_url' => 'nullable|url|max:1000',
        ]);

        $author = Author::create([
            'name' => $request->name,
            'slug' => $request->slug ?? Str::slug($request->name),
            'bio' => $request->bio,
            'image_url' => $request->image_url,
        ]);

        self::clearAuthorsListCache();

        return response()->json([
            'message' => 'Author created successfully',
            'data' => $author,
        ], 201);
    }

    /**
     * Update an author.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $author = Author::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|string|max:255|unique:authors,slug,' . $id,
            'bio' => 'nullable|string',
            'image_url' => 'nullable|url|max:1000',
        ]);

        $author->update($request->only(['name', 'slug', 'bio', 'image_url']));

        Cache::forget("author:{$id}:v2");
        self::clearAuthorsListCache();

        return response()->json([
            'message' => 'Author updated successfully',
            'data' => $author,
        ]);
    }

    /**
     * Bulk import authors from Excel rows (sync).
     */
    public function bulkImport(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'rows' => 'required|array|min:1|max:500',
            'rows.*.name' => 'required|string|max:255',
            'rows.*.slug' => 'nullable|string|max:255',
            'rows.*.bio' => 'nullable|string',
            'rows.*.image_url' => 'nullable|string|max:1000',
            'rows.*.row_number' => 'nullable|integer',
        ]);

        $imported = 0;
        $skipped = 0;
        $failed = 0;
        $results = [];

        foreach ($validated['rows'] as $index => $row) {
            $rowNumber = $row['row_number'] ?? ($index + 1);
            $name = trim((string) ($row['name'] ?? ''));

            if ($name === '') {
                $failed++;
                $results[] = [
                    'row' => $rowNumber,
                    'status' => 'failed',
                    'message' => 'Name is required',
                ];
                continue;
            }

            $imageUrl = isset($row['image_url']) ? trim((string) $row['image_url']) : '';
            if ($imageUrl !== '' && ! ImportUrlValidator::isValidImageUrl($imageUrl)) {
                $failed++;
                $results[] = [
                    'row' => $rowNumber,
                    'status' => 'failed',
                    'message' => 'Invalid image URL',
                ];
                continue;
            }

            $existing = Author::where('name', $name)->first();
            if ($existing) {
                $skipped++;
                $results[] = [
                    'row' => $rowNumber,
                    'status' => 'skipped',
                    'message' => "Author already exists (ID {$existing->id})",
                    'author_id' => $existing->id,
                ];
                continue;
            }

            $slugInput = isset($row['slug']) ? trim((string) $row['slug']) : '';
            $slug = $slugInput !== '' ? Str::slug($slugInput) : Str::slug($name);
            if ($slug === '') {
                $slug = 'author-' . substr(md5($name), 0, 12);
            }

            if (Author::where('slug', $slug)->exists()) {
                $baseSlug = $slug;
                $counter = 1;
                while (Author::where('slug', $slug)->exists()) {
                    $slug = $baseSlug . '-' . $counter;
                    $counter++;
                }
            }

            try {
                $author = Author::create([
                    'name' => $name,
                    'slug' => $slug,
                    'bio' => isset($row['bio']) ? trim((string) $row['bio']) ?: null : null,
                    'image_url' => $imageUrl !== '' ? $imageUrl : null,
                ]);

                $imported++;
                $results[] = [
                    'row' => $rowNumber,
                    'status' => 'success',
                    'message' => "Created author \"{$author->name}\"",
                    'author_id' => $author->id,
                ];
            } catch (\Throwable $e) {
                $failed++;
                $results[] = [
                    'row' => $rowNumber,
                    'status' => 'failed',
                    'message' => $e->getMessage(),
                ];
            }
        }

        if ($imported > 0) {
            self::clearAuthorsListCache();
        }

        return response()->json([
            'success' => true,
            'data' => [
                'imported' => $imported,
                'skipped' => $skipped,
                'failed' => $failed,
                'results' => $results,
            ],
        ]);
    }

    /**
     * Delete an author.
     */
    public function destroy(int $id): JsonResponse
    {
        $author = Author::findOrFail($id);

        // Check if author has series
        if ($author->series()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete author with associated series',
            ], 422);
        }

        $author->delete();

        Cache::forget("author:{$id}:v2");
        self::clearAuthorsListCache();

        return response()->json([
            'message' => 'Author deleted successfully',
        ]);
    }
}
