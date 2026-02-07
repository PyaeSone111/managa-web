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

        $cacheKey = "rankings:top:v2:{$page}:{$perPage}";

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
                            'cover_url' => $ranking->series->cover_url,
                            'thumbnail_url' => $ranking->series->thumbnail_url,
                            'status' => $ranking->series->status,
                            'rating' => $ranking->series->rating,
                            'average_rating' => $ranking->series->rating,
                            'rating_count' => $ranking->series->rating_count,
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

            // Fallback: compute on-the-fly (interval syntax: PostgreSQL uses '7 days', MySQL uses 7 DAY)
            $driver = DB::connection()->getDriverName();
            $interval7 = $driver === 'pgsql' ? "NOW() - INTERVAL '7 days'" : 'NOW() - INTERVAL 7 DAY';
            $interval30 = $driver === 'pgsql' ? "NOW() - INTERVAL '30 days'" : 'NOW() - INTERVAL 30 DAY';
            $query = Series::query()
                ->active()
                ->with(['categories', 'mangaTypes'])
                ->select('series.*')
                ->selectRaw("
                    (COALESCE(total_views, 0) * 0.3 +
                    COALESCE(total_favorites, 0) * 100 * 0.25 +
                    COALESCE(rating, 0) * COALESCE(rating_count, 0) * 10 * 0.25 +
                    CASE
                        WHEN last_chapter_at > {$interval7} THEN 1000
                        WHEN last_chapter_at > {$interval30} THEN 500
                        ELSE 0
                    END * 0.2) AS top_score
                ")
                ->orderByRaw('top_score DESC');

            $total = Series::active()->count();
            $items = $query->offset($offset)->limit($perPage)->get();

            return [
                'items' => $items->map(function ($series, $index) use ($offset) {
                    return [
                        'id' => $series->id,
                        'title' => $series->title,
                        'slug' => $series->slug,
                        'cover_url' => $series->cover_url,
                        'thumbnail_url' => $series->thumbnail_url,
                        'status' => $series->status,
                        'rating' => $series->rating,
                        'average_rating' => $series->rating,
                        'rating_count' => $series->rating_count,
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

        $cacheKey = "rankings:reading:v2:{$page}:{$perPage}";

        $data = Cache::remember($cacheKey, 900, function () use ($perPage, $offset) {
            $hasRankings = SeriesRanking::exists();

            if ($hasRankings) {
                $rankings = SeriesRanking::getTopReading($perPage, $offset);
                $total = SeriesRanking::whereHas('series', fn($q) => $q->where('is_active', true))->count();

                return [
                    'items' => $rankings->map(function ($ranking) {
                        $s = $ranking->series;
                        return [
                            'id' => $s->id,
                            'title' => $s->title,
                            'slug' => $s->slug,
                            'cover_url' => $s->cover_url,
                            'thumbnail_url' => $s->thumbnail_url,
                            'status' => $s->status,
                            'total_chapters' => $s->total_chapters,
                            'rating' => $s->rating,
                            'average_rating' => $s->rating,
                            'rating_count' => $s->rating_count,
                            'total_views' => $s->total_views,
                            'total_favorites' => $s->total_favorites,
                            'categories' => $s->categories,
                            'types' => $s->mangaTypes,
                            'chapters_read_7d' => $ranking->chapters_read_7d,
                            'reading_time_hours' => round($ranking->reading_time_7d / 3600, 1),
                            'active_readers' => $ranking->viewers_7d,
                            'score' => $ranking->reading_score,
                            'rank' => $ranking->reading_rank,
                            'ranking' => ['score' => $ranking->reading_score],
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
                    $score = $series->readers_7d ?? 0;
                    return [
                        'id' => $series->id,
                        'title' => $series->title,
                        'slug' => $series->slug,
                        'cover_url' => $series->cover_url,
                        'thumbnail_url' => $series->thumbnail_url,
                        'status' => $series->status,
                        'total_chapters' => $series->total_chapters,
                        'rating' => $series->rating,
                        'average_rating' => $series->rating,
                        'rating_count' => $series->rating_count,
                        'total_views' => $series->total_views,
                        'total_favorites' => $series->total_favorites,
                        'categories' => $series->categories,
                        'types' => $series->mangaTypes,
                        'chapters_read_7d' => 0,
                        'reading_time_hours' => 0,
                        'active_readers' => $score,
                        'score' => $score,
                        'rank' => $offset + $index + 1,
                        'ranking' => ['score' => $score],
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

        $cacheKey = "rankings:trending:v2:{$page}:{$perPage}";

        $data = Cache::remember($cacheKey, 300, function () use ($perPage, $offset) {
            $hasRankings = SeriesRanking::exists();

            if ($hasRankings) {
                $rankings = SeriesRanking::getTrending($perPage, $offset);
                $total = SeriesRanking::whereHas('series', fn($q) => $q->where('is_active', true))->count();

                return [
                    'items' => $rankings->map(function ($ranking) {
                        $s = $ranking->series;
                        return [
                            'id' => $s->id,
                            'title' => $s->title,
                            'slug' => $s->slug,
                            'cover_url' => $s->cover_url,
                            'thumbnail_url' => $s->thumbnail_url,
                            'status' => $s->status,
                            'total_chapters' => $s->total_chapters,
                            'rating' => $s->rating,
                            'average_rating' => $s->rating,
                            'rating_count' => $s->rating_count,
                            'total_views' => $s->total_views,
                            'total_favorites' => $s->total_favorites,
                            'categories' => $s->categories,
                            'types' => $s->mangaTypes,
                            'views_7d' => $ranking->views_7d,
                            'favorites_7d' => $ranking->favorites_7d,
                            'score' => $ranking->trending_score,
                            'rank' => $ranking->trending_rank,
                            'trend_status' => $ranking->views_7d > 1000 ? 'hot' : 'rising',
                            'ranking' => ['score' => $ranking->trending_score],
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
                    $score = $series->favorites_7d ?? 0;
                    return [
                        'id' => $series->id,
                        'title' => $series->title,
                        'slug' => $series->slug,
                        'cover_url' => $series->cover_url,
                        'thumbnail_url' => $series->thumbnail_url,
                        'status' => $series->status,
                        'total_chapters' => $series->total_chapters,
                        'rating' => $series->rating,
                        'average_rating' => $series->rating,
                        'rating_count' => $series->rating_count,
                        'total_views' => $series->total_views,
                        'total_favorites' => $series->total_favorites,
                        'categories' => $series->categories,
                        'types' => $series->mangaTypes,
                        'views_7d' => 0,
                        'favorites_7d' => $score,
                        'score' => $score,
                        'rank' => $offset + $index + 1,
                        'trend_status' => 'rising',
                        'ranking' => ['score' => $score],
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
     * Get latest release manga (ordered by latest release date = most recent chapter published_at).
     *
     * GET /api/v1/manga/recent
     */
    public function recentlyUpdated(Request $request): JsonResponse
    {
        $request->validate([
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:50',
            'limit' => 'nullable|integer|min:1|max:50',
        ]);

        $perPage = min($request->input('per_page', $request->input('limit', 20)), 50);
        $page = $request->input('page', 1);

        $cacheKey = "manga:recent:v4:{$page}:{$perPage}";

        $results = Cache::remember($cacheKey, 300, function () use ($perPage) {
            return Series::query()
                ->active()
                ->whereHas('chapters', fn ($q) => $q->where('is_published', true))
                ->orderByRaw(
                    '(SELECT MAX(published_at) FROM chapters WHERE chapters.series_id = series.id AND is_published = 1) DESC'
                )
                ->with(['categories', 'mangaTypes', 'chapters' => function ($q) {
                    $q->where('is_published', true)
                        ->orderBy('published_at', 'desc')
                        ->limit(2)
                        ->select('id', 'series_id', 'chapter_number', 'title', 'published_at');
                }])
                ->paginate($perPage);
        });

        $data = $results->getCollection()->map(function ($series) {
            $chapters = $series->chapters;
            $latestChapter = $chapters->first();
            $latestReleaseAt = $latestChapter?->published_at ?? $series->last_chapter_at;
            $lastTwoChapters = $chapters->take(2)->map(fn ($ch) => [
                'id' => $ch->id,
                'chapter_number' => $ch->chapter_number,
                'number' => $ch->chapter_number,
                'title' => $ch->title,
                'published_at' => $ch->published_at,
            ])->values()->all();
            return [
                'id' => $series->id,
                'title' => $series->title,
                'slug' => $series->slug,
                'cover_url' => $series->cover_url,
                'thumbnail_url' => $series->thumbnail_url,
                'status' => $series->status,
                'rating' => $series->rating,
                'average_rating' => $series->rating,
                'rating_count' => $series->rating_count,
                'last_chapter_at' => $series->last_chapter_at,
                'latest_release_at' => $latestReleaseAt,
                'latest_chapter' => $latestChapter ? [
                    'number' => $latestChapter->chapter_number,
                    'title' => $latestChapter->title,
                    'published_at' => $latestChapter->published_at,
                ] : null,
                'last_two_chapters' => $lastTwoChapters,
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
     * Get recently added manga (ordered by latest created date = created_at).
     *
     * GET /api/v1/manga/new
     */
    public function recentlyAdded(Request $request): JsonResponse
    {
        $request->validate([
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:50',
            'limit' => 'nullable|integer|min:1|max:50',
        ]);

        $perPage = min($request->input('per_page', $request->input('limit', 20)), 50);
        $page = $request->input('page', 1);

        $cacheKey = "manga:new:v3:{$page}:{$perPage}";

        $results = Cache::remember($cacheKey, 300, function () use ($perPage) {
            return Series::query()
                ->active()
                ->orderBy('created_at', 'desc')
                ->with([
                    'categories',
                    'mangaTypes',
                    'chapters' => function ($q) {
                        $q->where('is_published', true)
                            ->orderBy('published_at', 'desc')
                            ->limit(2)
                            ->select('id', 'series_id', 'chapter_number', 'title', 'published_at');
                    },
                ])
                ->withCount(['chapters' => fn($q) => $q->where('is_published', true)])
                ->paginate($perPage);
        });

        $data = $results->getCollection()->map(function ($series) {
            $arr = $series->toArray();
            $arr['last_two_chapters'] = $series->chapters->take(2)->map(fn ($ch) => [
                'id' => $ch->id,
                'chapter_number' => $ch->chapter_number,
                'number' => $ch->chapter_number,
                'title' => $ch->title,
                'published_at' => $ch->published_at,
            ])->values()->all();
            return $arr;
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
}
