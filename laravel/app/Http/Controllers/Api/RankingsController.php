<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Series;
use App\Models\SeriesRanking;
use App\Services\CacheInvalidator;
use App\Support\SeriesCardFormatter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class RankingsController extends Controller
{
    /**
     * @return array{page: int, per_page: int, fetch_limit: int, offset: int, max_results: int}
     */
    private function resolveRankingPagination(Request $request): array
    {
        $default = (int) config('manga.pagination.default_per_page', 20);
        $maxPerPage = (int) config('manga.pagination.max_per_page', 50);
        $maxResults = (int) config('manga.pagination.rankings_max_results', 100);

        $request->validate([
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:' . $maxPerPage,
            'limit' => 'nullable|integer|min:1|max:' . $maxPerPage,
        ]);

        $page = max(1, (int) $request->input('page', 1));
        $perPage = min(
            (int) $request->input('per_page', $request->input('limit', $default)),
            $maxPerPage
        );
        $offset = ($page - 1) * $perPage;
        $remaining = max(0, $maxResults - $offset);
        $fetchLimit = min($perPage, $remaining);

        return [
            'page' => $page,
            'per_page' => $perPage,
            'fetch_limit' => $fetchLimit,
            'offset' => $offset,
            'max_results' => $maxResults,
        ];
    }

    /**
     * @param  int  $rawTotal  Un capped row count from DB
     * @return array{current_page: int, per_page: int, total: int, total_pages: int, limit: int}
     */
    private function rankingMeta(int $page, int $perPage, int $rawTotal, int $maxResults): array
    {
        $total = min($rawTotal, $maxResults);

        return [
            'current_page' => $page,
            'per_page' => $perPage,
            'total' => $total,
            'total_pages' => $perPage > 0 ? (int) ceil($total / $perPage) : 0,
            'limit' => $perPage,
        ];
    }

    /**
     * Get top manga (overall best based on views, favorites, ratings, recency).
     *
     * GET /api/v1/rankings/top
     */
    public function top(Request $request, CacheInvalidator $cacheInvalidator): JsonResponse
    {
        $pagination = $this->resolveRankingPagination($request);
        $page = $pagination['page'];
        $perPage = $pagination['per_page'];
        $fetchLimit = $pagination['fetch_limit'];
        $offset = $pagination['offset'];
        $maxResults = $pagination['max_results'];

        $cacheKey = "rankings:top:v3:{$cacheInvalidator->version('rankings')}:{$page}:{$perPage}";

        $data = Cache::remember($cacheKey, 900, function () use ($fetchLimit, $offset) {
            // If rankings table is populated, use it
            $hasRankings = SeriesRanking::exists();

            if ($hasRankings) {
                $rankings = SeriesRanking::getTopManga($fetchLimit, $offset);
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
                            'author' => $ranking->series->author,
                            'artist' => $ranking->series->artist,
                            'authors' => $ranking->series->authors,
                            'manga_types' => $ranking->series->mangaTypes,
                            'types' => $ranking->series->mangaTypes,
                            'type' => $ranking->series->type,
                            'score' => $ranking->top_score,
                            'rank' => $ranking->top_rank,
                        ];
                    }),
                    'total' => $total,
                ];
            }

            // Fallback: use Series::scopeOrderByTopScore (Eloquent scope, no raw DB facade)
            $query = Series::query()
                ->active()
                ->with(SeriesCardFormatter::relations())
                ->orderByTopScore();

            $total = Series::active()->count();
            $items = $query->offset($offset)->limit($fetchLimit)->get();

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
                        'author' => $series->author,
                        'artist' => $series->artist,
                        'authors' => $series->authors,
                        'manga_types' => $series->mangaTypes,
                        'types' => $series->mangaTypes,
                        'type' => $series->type,
                        'score' => $series->top_score ?? 0,
                        'rank' => $offset + $index + 1,
                    ];
                }),
                'total' => $total,
            ];
        });

        return response()->json([
            'data' => $data['items'],
            'meta' => $this->rankingMeta($page, $perPage, $data['total'], $maxResults),
            'ranking_type' => 'top',
            'description' => 'Overall best manga based on views, favorites, ratings, and recency',
        ]);
    }

    /**
     * Get top reading manga (based on reading activity).
     *
     * GET /api/v1/rankings/reading
     */
    public function reading(Request $request, CacheInvalidator $cacheInvalidator): JsonResponse
    {
        $pagination = $this->resolveRankingPagination($request);
        $page = $pagination['page'];
        $perPage = $pagination['per_page'];
        $fetchLimit = $pagination['fetch_limit'];
        $offset = $pagination['offset'];
        $maxResults = $pagination['max_results'];

        $cacheKey = "rankings:reading:v3:{$cacheInvalidator->version('rankings')}:{$page}:{$perPage}";

        $data = Cache::remember($cacheKey, 900, function () use ($fetchLimit, $offset) {
            $hasRankings = SeriesRanking::exists();

            if ($hasRankings) {
                $rankings = SeriesRanking::getTopReading($fetchLimit, $offset);
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
                            'author' => $s->author,
                            'artist' => $s->artist,
                            'authors' => $s->authors,
                            'manga_types' => $s->mangaTypes,
                            'types' => $s->mangaTypes,
                            'type' => $s->type,
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
                ->with(SeriesCardFormatter::relations())
                ->withCount([
                    'readingProgress as readers_7d' => function ($q) {
                        $q->where('updated_at', '>=', now()->subDays(7));
                    }
                ])
                ->orderByDesc('readers_7d');

            $total = Series::active()->count();
            $items = $query->offset($offset)->limit($fetchLimit)->get();

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
                        'author' => $series->author,
                        'artist' => $series->artist,
                        'authors' => $series->authors,
                        'manga_types' => $series->mangaTypes,
                        'types' => $series->mangaTypes,
                        'type' => $series->type,
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
            'meta' => $this->rankingMeta($page, $perPage, $data['total'], $maxResults),
            'ranking_type' => 'reading',
            'description' => 'Most actively read manga based on readers, chapters read, and reading time',
        ]);
    }

    /**
     * Get trending/popular manga (based on recent growth).
     *
     * GET /api/v1/rankings/trending
     */
    public function trending(Request $request, CacheInvalidator $cacheInvalidator): JsonResponse
    {
        $pagination = $this->resolveRankingPagination($request);
        $page = $pagination['page'];
        $perPage = $pagination['per_page'];
        $fetchLimit = $pagination['fetch_limit'];
        $offset = $pagination['offset'];
        $maxResults = $pagination['max_results'];

        $cacheKey = "rankings:trending:v3:{$cacheInvalidator->version('rankings')}:{$page}:{$perPage}";

        $data = Cache::remember($cacheKey, 300, function () use ($fetchLimit, $offset) {
            $hasRankings = SeriesRanking::exists();

            if ($hasRankings) {
                $rankings = SeriesRanking::getTrending($fetchLimit, $offset);
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
                            'author' => $s->author,
                            'artist' => $s->artist,
                            'authors' => $s->authors,
                            'manga_types' => $s->mangaTypes,
                            'types' => $s->mangaTypes,
                            'type' => $s->type,
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
                ->with(SeriesCardFormatter::relations())
                ->withCount([
                    'favorites as favorites_7d' => function ($q) {
                        $q->where('created_at', '>=', now()->subDays(7));
                    }
                ])
                ->orderByDesc('favorites_7d')
                ->orderByDesc('total_views');

            $total = Series::active()->count();
            $items = $query->offset($offset)->limit($fetchLimit)->get();

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
                        'author' => $series->author,
                        'artist' => $series->artist,
                        'authors' => $series->authors,
                        'manga_types' => $series->mangaTypes,
                        'types' => $series->mangaTypes,
                        'type' => $series->type,
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
            'meta' => $this->rankingMeta($page, $perPage, $data['total'], $maxResults),
            'ranking_type' => 'trending',
            'description' => 'Trending manga based on recent growth in views and favorites',
        ]);
    }

    /**
     * Get latest release manga (ordered by latest release date = most recent chapter published_at).
     *
     * GET /api/v1/manga/recent
     */
    public function recentlyUpdated(Request $request, CacheInvalidator $cacheInvalidator): JsonResponse
    {
        $request->validate([
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:50',
            'limit' => 'nullable|integer|min:1|max:50',
        ]);

        $perPage = min($request->input('per_page', $request->input('limit', 20)), 50);
        $page = $request->input('page', 1);

        $cacheKey = "manga:recent:v5:{$cacheInvalidator->version('manga_recent')}:{$page}:{$perPage}";

        $results = Cache::remember($cacheKey, 300, function () use ($perPage) {
            // Use last_chapter_at column instead of subquery for better performance
            return Series::query()
                ->active()
                ->whereNotNull('last_chapter_at')
                ->orderBy('last_chapter_at', 'desc')
                ->with(array_merge(SeriesCardFormatter::relations(), [
                    'chapters' => function ($q) {
                    $q->where('is_published', true)
                        ->orderBy('published_at', 'desc')
                        ->limit(2)
                        ->select('id', 'series_id', 'chapter_number', 'title', 'published_at');
                },
                ]))
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
            return array_merge([
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
            ], SeriesCardFormatter::metaFields($series));
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
    public function recentlyAdded(Request $request, CacheInvalidator $cacheInvalidator): JsonResponse
    {
        $request->validate([
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:50',
            'limit' => 'nullable|integer|min:1|max:50',
        ]);

        $perPage = min($request->input('per_page', $request->input('limit', 20)), 50);
        $page = $request->input('page', 1);

        $cacheKey = "manga:new:v4:{$cacheInvalidator->version('manga_new')}:{$page}:{$perPage}";

        $results = Cache::remember($cacheKey, 300, function () use ($perPage) {
            return Series::query()
                ->active()
                ->orderBy('created_at', 'desc')
                ->with(array_merge(SeriesCardFormatter::relations(), [
                    'chapters' => function ($q) {
                        $q->where('is_published', true)
                            ->orderBy('published_at', 'desc')
                            ->limit(2)
                            ->select('id', 'series_id', 'chapter_number', 'title', 'published_at');
                    },
                ]))
                ->withCount(['chapters' => fn($q) => $q->where('is_published', true)])
                ->paginate($perPage);
        });

        $data = $results->getCollection()->map(function ($series) {
            return array_merge($series->toArray(), [
                'last_two_chapters' => $series->chapters->take(2)->map(fn ($ch) => [
                    'id' => $ch->id,
                    'chapter_number' => $ch->chapter_number,
                    'number' => $ch->chapter_number,
                    'title' => $ch->title,
                    'published_at' => $ch->published_at,
                ])->values()->all(),
            ], SeriesCardFormatter::metaFields($series));
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
