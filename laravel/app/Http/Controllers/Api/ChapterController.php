<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chapter;
use App\Models\Series;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class ChapterController extends Controller
{
    /**
     * Get chapter details with pages by ID (cached)
     */
    public function show($id): JsonResponse
    {
        $cacheKey = "chapter:{$id}:v2";

        $chapter = Cache::remember($cacheKey, 600, function () use ($id) {
            return Chapter::query()
                ->with([
                    'series:id,title,slug,cover_url,thumbnail_url',
                    'pages' => fn($q) => $q->select(['id', 'chapter_id', 'page_number', 'image_url'])
                        ->orderBy('page_number', 'asc')
                ])
                ->select(['id', 'series_id', 'chapter_number', 'title', 'published_at', 'views'])
                ->where('is_published', true)
                ->findOrFail($id);
        });

        Chapter::find($id)?->incrementViews();

        return response()->json([
            'success' => true,
            'data' => $chapter
        ]);
    }

    /**
     * Get chapter pages only (for lazy loading)
     */
    public function pages($id): JsonResponse
    {
        $cacheKey = "chapter:{$id}:pages";

        $pages = Cache::remember($cacheKey, 3600, function () use ($id) {
            $chapter = Chapter::select('id')
                ->where('is_published', true)
                ->findOrFail($id);

            return $chapter->pages()
                ->select(['id', 'chapter_id', 'page_number', 'image_url'])
                ->orderBy('page_number', 'asc')
                ->get();
        });

        return response()->json([
            'success' => true,
            'data' => $pages
        ]);
    }

    /**
     * Get chapter by series slug and chapter number (cached)
     */
    public function showBySeriesAndNumber($series, $chapterNumber): JsonResponse
    {
        $chapterNumberFloat = (float) $chapterNumber;
        $cacheKey = "chapter:series:{$series}:num:{$chapterNumberFloat}:v2";

        $chapter = Cache::remember($cacheKey, 600, function () use ($series, $chapterNumberFloat) {
            // Find series ID first (fast lookup)
            $seriesModel = Series::query()
                ->select('id')
                ->where(function ($query) use ($series) {
                    $query->where('slug', $series);
                    if (is_numeric($series)) {
                        $query->orWhere('id', (int) $series);
                    }
                })
                ->firstOrFail();

            return Chapter::query()
                ->with([
                    'series:id,title,slug,cover_url,thumbnail_url',
                    'pages' => fn($q) => $q->select(['id', 'chapter_id', 'page_number', 'image_url'])
                        ->orderBy('page_number', 'asc')
                ])
                ->select(['id', 'series_id', 'chapter_number', 'title', 'published_at', 'views'])
                ->where('series_id', $seriesModel->id)
                ->where('chapter_number', $chapterNumberFloat)
                ->where('is_published', true)
                ->firstOrFail();
        });

        Chapter::find($chapter->id)?->incrementViews();

        return response()->json([
            'success' => true,
            'data' => $chapter
        ]);
    }
}
