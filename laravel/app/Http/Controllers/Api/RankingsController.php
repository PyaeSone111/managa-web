<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Series;
use App\Models\SeriesRanking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class RankingsController extends Controller
{
    /**
     * Get top manga (overall best based on views, favorites, ratings, recency).
     *
     * GET /api/v1/rankings/top
     */
    public function top(Request $request): JsonResponse
    {
        $request->validate([
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);

        $perPage = min($request->input('per_page', 20), 50);
        $page = $request->input('page', 1);
        $offset = ($page - 1) * $perPage;

        $cacheKey = "rankings:top:{$page}:{$perPage}";

        $data = Cache::remember($cacheKey, 900, function () use ($perPage, $offset) {
            // If rankings table is populated, use it
            $hasRankings = SeriesRanking::exists();

            if ($hasRankings) {
                $rankings = SeriesRanking::getTopManga($perPage, $offset);
                $total = SeriesRanking::whereHas('series', fn($q) => $q->where('is_active', true))->count();

                return [
                    'items' => $rankings->map(function ($ranking) {
                        return [
                            'id' => $ranking->series->id,
                            'title' => $ranking->series->title,
                            'slug' => $ranking->series->slug,
                            'thumbnail_url' => $ranking->series->thumbnail_url,
                            'status' => $ranking->series->status,
                            'average_rating' => $ranking->series->rating,
                            'total_views' => $ranking->series->total_views,
                            'total_favorites' => $ranking->series->total_favorites,
                            'categories' => $ranking->series->categories,
                            'types' => $ranking->series->mangaTypes,
                            'score' => $ranking->top_score,
                            'rank' => $ranking->top_rank,
                        ];
                    }),
                    'total' => $total,
                ];
            }

            // Fallback: compute on-the-fly
            $query = Series::query()
                ->active()
                ->with(['categories', 'mangaTypes'])
                ->select('series.*')
                ->selectRaw('
                    (COALESCE(total_views, 0) * 0.3 +
                    COALESCE(total_favorites, 0) * 100 * 0.25 +
                    COALESCE(rating, 0) * COALESCE(rating_count, 0) * 10 * 0.25 +
                    CASE
                        WHEN last_chapter_at > NOW() - INTERVAL \'7 days\' THEN 1000
                        WHEN last_chapter_at > NOW() - INTERVAL \'30 days\' THEN 500
                        ELSE 0
                    END * 0.2) AS top_score
                ')
                ->orderByRaw('top_score DESC');

            $total = Series::active()->count();
            $items = $query->offset($offset)->limit($perPage)->get();

            return [
                'items' => $items->map(function ($series, $index) use ($offset) {
                    return [
                        'id' => $series->id,
                        'title' => $series->title,
                        'slug' => $series->slug,
                        'thumbnail_url' => $series->thumbnail_url,
                        'status' => $series->status,
                        'average_rating' => $series->rating,
                        'total_views' => $series->total_views,
                        'total_favorites' => $series->total_favorites,
                        'categories' => $series->categories,
                        'types' => $series->mangaTypes,
                        'score' => $series->top_score ?? 0,
                        'rank' => $offset + $index + 1,
                    ];
                }),
                'total' => $total,
            ];
        });

        return response()->json([
            'data' => $data['items'],
            'meta' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $data['total'],
                'total_pages' => ceil($data['total'] / $perPage),
            ],
            'ranking_type' => 'top',
            'description' => 'Overall best manga based on views, favorites, ratings, and recency',
        ]);
    }

    /**
     * Get top reading manga (based on reading activity).
     *
     * GET /api/v1/rankings/reading
     */
    public function reading(Request $request): JsonResponse
    {
        $request->validate([
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);

        $perPage = min($request->input('per_page', 20), 50);
        $page = $request->input('page', 1);
        $offset = ($page - 1) * $perPage;

        $cacheKey = "rankings:reading:{$page}:{$perPage}";

        $data = Cache::remember($cacheKey, 900, function () use ($perPage, $offset) {
            $hasRankings = SeriesRanking::exists();

            if ($hasRankings) {
                $rankings = SeriesRanking::getTopReading($perPage, $offset);
                $total = SeriesRanking::whereHas('series', fn($q) => $q->where('is_active', true))->count();

                return [
                    'items' => $rankings->map(function ($ranking) {
                        return [
                            'id' => $ranking->series->id,
                            'title' => $ranking->series->title,
                            'slug' => $ranking->series->slug,
                            'thumbnail_url' => $ranking->series->thumbnail_url,
                            'chapters_read_7d' => $ranking->chapters_read_7d,
                            'reading_time_hours' => round($ranking->reading_time_7d / 3600, 1),
                            'active_readers' => $ranking->viewers_7d,
                            'score' => $ranking->reading_score,
                            'rank' => $ranking->reading_rank,
                        ];
                    }),
                    'total' => $total,
                ];
            }

            // Fallback: use reading sessions/progress
            $query = Series::query()
                ->active()
                ->with(['categories', 'mangaTypes'])
                ->withCount([
                    'readingProgress as readers_7d' => function ($q) {
                        $q->where('updated_at', '>=', now()->subDays(7));
                    }
                ])
                ->orderByDesc('readers_7d');

            $total = Series::active()->count();
            $items = $query->offset($offset)->limit($perPage)->get();

            return [
                'items' => $items->map(function ($series, $index) use ($offset) {
                    return [
                        'id' => $series->id,
                        'title' => $series->title,
                        'slug' => $series->slug,
                        'thumbnail_url' => $series->thumbnail_url,
                        'chapters_read_7d' => 0,
                        'reading_time_hours' => 0,
                        'active_readers' => $series->readers_7d ?? 0,
                        'score' => $series->readers_7d ?? 0,
                        'rank' => $offset + $index + 1,
                    ];
                }),
                'total' => $total,
            ];
        });

        return response()->json([
            'data' => $data['items'],
            'meta' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $data['total'],
                'total_pages' => ceil($data['total'] / $perPage),
            ],
            'ranking_type' => 'reading',
            'description' => 'Most actively read manga based on readers, chapters read, and reading time',
        ]);
    }

    /**
     * Get trending/popular manga (based on recent growth).
     *
     * GET /api/v1/rankings/trending
     */
    public function trending(Request $request): JsonResponse
    {
        $request->validate([
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);

        $perPage = min($request->input('per_page', 20), 50);
        $page = $request->input('page', 1);
        $offset = ($page - 1) * $perPage;

        $cacheKey = "rankings:trending:{$page}:{$perPage}";

        $data = Cache::remember($cacheKey, 300, function () use ($perPage, $offset) {
            $hasRankings = SeriesRanking::exists();

            if ($hasRankings) {
                $rankings = SeriesRanking::getTrending($perPage, $offset);
                $total = SeriesRanking::whereHas('series', fn($q) => $q->where('is_active', true))->count();

                return [
                    'items' => $rankings->map(function ($ranking) {
                        return [
                            'id' => $ranking->series->id,
                            'title' => $ranking->series->title,
                            'slug' => $ranking->series->slug,
                            'thumbnail_url' => $ranking->series->thumbnail_url,
                            'views_7d' => $ranking->views_7d,
                            'favorites_7d' => $ranking->favorites_7d,
                            'score' => $ranking->trending_score,
                            'rank' => $ranking->trending_rank,
                            'trend_status' => $ranking->views_7d > 1000 ? 'hot' : 'rising',
                        ];
                    }),
                    'total' => $total,
                ];
            }

            // Fallback: use recent views and favorites
            $query = Series::query()
                ->active()
                ->with(['categories', 'mangaTypes'])
                ->withCount([
                    'favorites as favorites_7d' => function ($q) {
                        $q->where('created_at', '>=', now()->subDays(7));
                    }
                ])
                ->orderByDesc('favorites_7d')
                ->orderByDesc('total_views');

            $total = Series::active()->count();
            $items = $query->offset($offset)->limit($perPage)->get();

            return [
                'items' => $items->map(function ($series, $index) use ($offset) {
                    return [
                        'id' => $series->id,
                        'title' => $series->title,
                        'slug' => $series->slug,
                        'thumbnail_url' => $series->thumbnail_url,
                        'views_7d' => 0,
                        'favorites_7d' => $series->favorites_7d ?? 0,
                        'score' => $series->favorites_7d ?? 0,
                        'rank' => $offset + $index + 1,
                        'trend_status' => 'rising',
                    ];
                }),
                'total' => $total,
            ];
        });

        return response()->json([
            'data' => $data['items'],
            'meta' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $data['total'],
                'total_pages' => ceil($data['total'] / $perPage),
            ],
            'ranking_type' => 'trending',
            'description' => 'Trending manga based on recent growth in views and favorites',
        ]);
    }

    /**
     * Get recently updated manga.
     *
     * GET /api/v1/manga/recent
     */
    public function recentlyUpdated(Request $request): JsonResponse
    {
        $request->validate([
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);

        $perPage = min($request->input('per_page', 20), 50);
        $page = $request->input('page', 1);

        $cacheKey = "manga:recent:{$page}:{$perPage}";

        $results = Cache::remember($cacheKey, 300, function () use ($perPage) {
            return Series::recentlyUpdated()
                ->with(['categories', 'mangaTypes', 'chapters' => function ($q) {
                    $q->where('is_published', true)
                        ->orderBy('published_at', 'desc')
                        ->limit(1);
                }])
                ->paginate($perPage);
        });

        $data = $results->getCollection()->map(function ($series) {
            $latestChapter = $series->chapters->first();
            return [
                'id' => $series->id,
                'title' => $series->title,
                'slug' => $series->slug,
                'thumbnail_url' => $series->thumbnail_url,
                'status' => $series->status,
                'last_chapter_at' => $series->last_chapter_at,
                'latest_chapter' => $latestChapter ? [
                    'number' => $latestChapter->chapter_number,
                    'title' => $latestChapter->title,
                    'published_at' => $latestChapter->published_at,
                ] : null,
                'categories' => $series->categories,
            ];
        });

        return response()->json([
            'data' => $data,
            'meta' => [
                'current_page' => $results->currentPage(),
                'per_page' => $results->perPage(),
                'total' => $results->total(),
                'total_pages' => $results->lastPage(),
            ],
        ]);
    }

    /**
     * Get recently added manga.
     *
     * GET /api/v1/manga/new
     */
    public function recentlyAdded(Request $request): JsonResponse
    {
        $request->validate([
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);

        $perPage = min($request->input('per_page', 20), 50);
        $page = $request->input('page', 1);

        $cacheKey = "manga:new:{$page}:{$perPage}";

        $results = Cache::remember($cacheKey, 300, function () use ($perPage) {
            return Series::recentlyAdded()
                ->with(['categories', 'mangaTypes'])
                ->withCount(['chapters' => fn($q) => $q->where('is_published', true)])
                ->paginate($perPage);
        });

        return response()->json([
            'data' => $results->items(),
            'meta' => [
                'current_page' => $results->currentPage(),
                'per_page' => $results->perPage(),
                'total' => $results->total(),
                'total_pages' => $results->lastPage(),
            ],
        ]);
    }
}
