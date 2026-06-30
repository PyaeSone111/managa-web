<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Chapter;
use App\Models\ChapterPage;
use App\Models\Series;
use App\Services\MediaFireService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class AdminChapterController extends Controller
{
    /**
     * Normalize image URL so it passes 'url' validation (e.g. encode spaces in path).
     */
    private function normalizePageImageUrls(array $pages): array
    {
        return array_map(function ($page) {
            if (!empty($page['image_url']) && is_string($page['image_url'])) {
                $page['image_url'] = $this->encodeUrlPath($page['image_url']);
            }
            return $page;
        }, $pages);
    }

    private function encodeUrlPath(string $url): string
    {
        $parsed = parse_url($url);
        if (!isset($parsed['path'])) {
            return $url;
        }
        $segments = array_map('rawurlencode', explode('/', trim($parsed['path'], '/')));
        $path = '/' . implode('/', $segments);
        $scheme = $parsed['scheme'] ?? 'https';
        $host = $parsed['host'] ?? '';
        $port = isset($parsed['port']) ? ':' . $parsed['port'] : '';
        $query = isset($parsed['query']) ? '?' . $parsed['query'] : '';
        $fragment = isset($parsed['fragment']) ? '#' . $parsed['fragment'] : '';
        return $scheme . '://' . $host . $port . $path . $query . $fragment;
    }

    /**
     * Get chapter details for admin edit (includes unpublished + original_filename).
     */
    public function show($id): JsonResponse
    {
        $chapter = Chapter::with([
            'series:id,title,slug',
            'pages' => fn ($q) => $q->orderBy('page_number', 'asc'),
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $chapter,
        ]);
    }

    /**
     * Create a new chapter
     */
    public function store(Request $request): JsonResponse
    {
        if ($request->has('pages') && is_array($request->pages)) {
            $request->merge(['pages' => $this->normalizePageImageUrls($request->pages)]);
        }

        $validated = $request->validate([
            'series_id' => 'required|exists:series,id',
            'chapter_number' => 'required|numeric|min:0',
            'title' => 'nullable|string|max:255',
            'slug' => 'nullable|string|max:255|unique:chapters,slug',
            'is_published' => 'nullable|boolean',
            'published_at' => 'nullable|date',
            'pages' => 'required|array|min:1',
            'pages.*.page_number' => 'required|integer|min:1',
            'pages.*.image_url' => 'required|url',
            'pages.*.original_filename' => 'nullable|string|max:255',
            'pages.*.width' => 'nullable|integer',
            'pages.*.height' => 'nullable|integer',
            'pages.*.file_size' => 'nullable|integer',
        ]);

        $series = Series::findOrFail($validated['series_id']);

        // Check for duplicate chapter number
        if (Chapter::where('series_id', $validated['series_id'])
            ->where('chapter_number', $validated['chapter_number'])
            ->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Chapter number already exists for this series'
            ], 422);
        }

        // Generate slug if not provided
        if (empty($validated['slug'])) {
            $seriesSlug = $series->slug;
            $chapterNum = $validated['chapter_number'];
            $validated['slug'] = Str::slug("{$seriesSlug}-chapter-{$chapterNum}");
            
            $counter = 1;
            $originalSlug = $validated['slug'];
            while (Chapter::where('slug', $validated['slug'])->exists()) {
                $validated['slug'] = $originalSlug . '-' . $counter;
                $counter++;
            }
        }

        $pages = $validated['pages'];
        unset($validated['pages']);

        DB::beginTransaction();
        try {
            $chapter = Chapter::create($validated);
            
            $pageCount = 0;
            foreach ($pages as $pageData) {
                ChapterPage::create([
                    'chapter_id' => $chapter->id,
                    'page_number' => $pageData['page_number'],
                    'image_url' => $pageData['image_url'],
                    'original_filename' => $pageData['original_filename'] ?? null,
                    'width' => $pageData['width'] ?? null,
                    'height' => $pageData['height'] ?? null,
                    'file_size' => $pageData['file_size'] ?? null,
                ]);
                $pageCount++;
            }

            $chapter->update(['page_count' => $pageCount]);
            $series->increment('total_chapters');

            DB::commit();

            $chapter->load(['series', 'pages']);

            return response()->json([
                'success' => true,
                'data' => $chapter,
                'message' => 'Chapter created successfully'
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create chapter: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a chapter
     */
    public function update(Request $request, $id): JsonResponse
    {
        $chapter = Chapter::findOrFail($id);

        if ($request->has('pages') && is_array($request->pages)) {
            $request->merge(['pages' => $this->normalizePageImageUrls($request->pages)]);
        }

        $validated = $request->validate([
            'chapter_number' => 'sometimes|numeric|min:0',
            'title' => 'nullable|string|max:255',
            'slug' => ['sometimes', 'string', 'max:255', \Illuminate\Validation\Rule::unique('chapters', 'slug')->ignore($id)],
            'is_published' => 'nullable|boolean',
            'published_at' => 'nullable|date',
            'pages' => 'sometimes|array|min:1',
            'pages.*.page_number' => 'required|integer|min:1',
            'pages.*.image_url' => 'required|url',
            'pages.*.original_filename' => 'nullable|string|max:255',
            'pages.*.width' => 'nullable|integer',
            'pages.*.height' => 'nullable|integer',
            'pages.*.file_size' => 'nullable|integer',
        ]);

        // Check for duplicate chapter number if changed
        if (isset($validated['chapter_number']) && 
            $validated['chapter_number'] != $chapter->chapter_number) {
            if (Chapter::where('series_id', $chapter->series_id)
                ->where('chapter_number', $validated['chapter_number'])
                ->where('id', '!=', $id)
                ->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Chapter number already exists for this series'
                ], 422);
            }
        }

        $pages = $validated['pages'] ?? null;
        unset($validated['pages']);

        DB::beginTransaction();
        try {
            $chapter->update($validated);

            if ($pages !== null) {
                // Delete existing pages
                $chapter->pages()->delete();
                
                // Create new pages
                $pageCount = 0;
                foreach ($pages as $pageData) {
                    ChapterPage::create([
                        'chapter_id' => $chapter->id,
                        'page_number' => $pageData['page_number'],
                        'image_url' => $pageData['image_url'],
                        'original_filename' => $pageData['original_filename'] ?? null,
                        'width' => $pageData['width'] ?? null,
                        'height' => $pageData['height'] ?? null,
                        'file_size' => $pageData['file_size'] ?? null,
                    ]);
                    $pageCount++;
                }

                $chapter->update(['page_count' => $pageCount]);
            }

            DB::commit();

            $chapter->load(['series', 'pages']);

            return response()->json([
                'success' => true,
                'data' => $chapter,
                'message' => 'Chapter updated successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update chapter: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk import chapters from Excel rows (MediaFire folder URLs).
     */
    public function bulkImport(Request $request, MediaFireService $mediaFireService): JsonResponse
    {
        $validated = $request->validate([
            'rows' => 'required|array|min:1|max:100',
            'rows.*.series_id' => 'required|integer|exists:series,id',
            'rows.*.chapter_number' => 'required|numeric|min:0',
            'rows.*.title' => 'nullable|string|max:255',
            'rows.*.mediafire_folder_url' => 'required|url',
            'rows.*.row_number' => 'nullable|integer',
            'is_published' => 'nullable|boolean',
        ]);

        $isPublished = $validated['is_published'] ?? true;
        $results = [];
        $imported = 0;
        $skipped = 0;
        $failed = 0;

        foreach ($validated['rows'] as $index => $row) {
            $rowNum = $row['row_number'] ?? ($index + 2);

            if (!str_contains($row['mediafire_folder_url'], 'mediafire.com')) {
                $failed++;
                $results[] = [
                    'row' => $rowNum,
                    'status' => 'failed',
                    'message' => 'Invalid MediaFire folder URL',
                ];
                continue;
            }

            $series = Series::find($row['series_id']);
            if (!$series) {
                $failed++;
                $results[] = [
                    'row' => $rowNum,
                    'status' => 'failed',
                    'message' => 'Manga ID not found',
                ];
                continue;
            }

            if (Chapter::where('series_id', $row['series_id'])
                ->where('chapter_number', $row['chapter_number'])
                ->exists()) {
                $skipped++;
                $results[] = [
                    'row' => $rowNum,
                    'status' => 'skipped',
                    'message' => 'Chapter number already exists for this series',
                ];
                continue;
            }

            try {
                $images = $mediaFireService->getFolderImages($row['mediafire_folder_url']);
            } catch (\Exception $e) {
                $failed++;
                $results[] = [
                    'row' => $rowNum,
                    'status' => 'failed',
                    'message' => $e->getMessage(),
                ];
                continue;
            }

            $seriesSlug = $series->slug;
            $chapterNum = $row['chapter_number'];
            $slug = Str::slug("{$seriesSlug}-chapter-{$chapterNum}");
            $counter = 1;
            $originalSlug = $slug;
            while (Chapter::where('slug', $slug)->exists()) {
                $slug = $originalSlug . '-' . $counter;
                $counter++;
            }

            $pages = [];
            foreach ($images as $i => $image) {
                $pages[] = [
                    'page_number' => $i + 1,
                    'image_url' => $this->encodeUrlPath($image['image_url']),
                    'original_filename' => $image['original_filename'],
                ];
            }

            DB::beginTransaction();
            try {
                $chapter = Chapter::create([
                    'series_id' => $row['series_id'],
                    'chapter_number' => $row['chapter_number'],
                    'title' => $row['title'] ?? null,
                    'slug' => $slug,
                    'is_published' => $isPublished,
                    'published_at' => now(),
                ]);

                foreach ($pages as $pageData) {
                    ChapterPage::create([
                        'chapter_id' => $chapter->id,
                        'page_number' => $pageData['page_number'],
                        'image_url' => $pageData['image_url'],
                        'original_filename' => $pageData['original_filename'],
                    ]);
                }

                $chapter->update(['page_count' => count($pages)]);
                $series->increment('total_chapters');

                DB::commit();

                $imported++;
                $results[] = [
                    'row' => $rowNum,
                    'status' => 'success',
                    'chapter_id' => $chapter->id,
                    'page_count' => count($pages),
                ];
            } catch (\Exception $e) {
                DB::rollBack();
                $failed++;
                $results[] = [
                    'row' => $rowNum,
                    'status' => 'failed',
                    'message' => 'Failed to create chapter: ' . $e->getMessage(),
                ];
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'imported' => $imported,
                'skipped' => $skipped,
                'failed' => $failed,
                'results' => $results,
            ],
            'message' => "Import complete: {$imported} imported, {$skipped} skipped, {$failed} failed",
        ]);
    }

    /**
     * Delete a chapter
     */
    public function destroy($id): JsonResponse
    {
        $chapter = Chapter::findOrFail($id);
        $series = $chapter->series;

        DB::beginTransaction();
        try {
            $chapter->pages()->delete();
            $chapter->delete();
            $series->decrement('total_chapters');

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Chapter deleted successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete chapter: ' . $e->getMessage()
            ], 500);
        }
    }
}

