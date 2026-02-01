<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Chapter;
use App\Models\ChapterPage;
use App\Models\Series;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class AdminChapterController extends Controller
{
    /**
     * Create a new chapter
     */
    public function store(Request $request): JsonResponse
    {
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

