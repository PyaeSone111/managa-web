<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chapter;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ChapterController extends Controller
{
    /**
     * Get chapter details with pages by ID
     */
    public function show($id): JsonResponse
    {
        $chapter = Chapter::with(['series', 'pages' => function ($query) {
            $query->orderBy('page_number', 'asc');
        }])
        ->where('is_published', true)
        ->findOrFail($id);

        // Increment views
        $chapter->increment('views');

        return response()->json([
            'success' => true,
            'data' => $chapter
        ]);
    }

    /**
     * Get chapter by series slug and chapter number
     */
    public function showBySeriesAndNumber($series, $chapterNumber): JsonResponse
    {
        // Find series by slug or ID
        $seriesModel = \App\Models\Series::where(function ($query) use ($series) {
            $query->where('slug', $series)
                  ->orWhere('id', $series);
        })->firstOrFail();

        // Convert chapter number to float for comparison (handles decimals like 1.5)
        $chapterNumberFloat = (float) $chapterNumber;
        
        // Find chapter by series ID and chapter number
        $chapter = Chapter::with(['series', 'pages' => function ($query) {
            $query->orderBy('page_number', 'asc');
        }])
        ->where('series_id', $seriesModel->id)
        ->where('chapter_number', $chapterNumberFloat)
        ->where('is_published', true)
        ->firstOrFail();
        
        // Ensure pages are sorted by page_number
        $chapter->pages = $chapter->pages->sortBy('page_number')->values();

        // Increment views
        $chapter->increment('views');

        return response()->json([
            'success' => true,
            'data' => $chapter
        ]);
    }
}

