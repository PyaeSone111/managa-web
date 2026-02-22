<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Branding;
use App\Models\Series;
use App\Models\SeriesRanking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    /**
     * Get consolidated homepage data in a single API call.
     * Includes: latest, new, trending, top, and branding.
     *
     * GET /api/v1/dashboard
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'limit' => 'nullable|integer|min:1|max:20',
        ]);

        $limit = min($request->input('limit', 12), 20);

        // Use a single cache key for the entire dashboard
        $cacheKey = "dashboard:home:v1:{$limit}";

        $data = Cache::remember($cacheKey, 300, function () use ($limit) {
            return [
                'latest' => $this->getLatest($limit),
                'new' => $this->getNew($limit),
                'trending' => $this->getTrending($limit),
                'top' => $this->getTop($limit),
                'branding' => $this->getBranding(),
            ];
        });

        return response()->json([
            'data' => $data,
            'cached_at' => now()->toIso8601String(),
        ]);
    }

    /**
     * Get latest updated manga (ordered by most recent chapter published_at).
     * Uses subquery so it works even when last_chapter_at is not populated (e.g. MySQL/SQLite or before trigger ran).
     */
    private function getLatest(int $limit): array
    {
        // Use Eloquent scope: orders by latest published chapter, works on MySQL without last_chapter_at trigger
        $series = Series::query()
            ->active()
            ->orderByLatestChapter()
            ->with(['categories', 'mangaTypes', 'chapters' => function ($q) {
                $q->where('is_published', true)
                    ->orderBy('published_at', 'desc')
                    ->limit(2)
                    ->select('id', 'series_id', 'chapter_number', 'title', 'published_at');
            }])
            ->limit($limit)
            ->get();

        return $series->map(function ($s) {
            $latestChapter = $s->chapters->first();
            return [
                'id' => $s->id,
                'title' => $s->title,
                'slug' => $s->slug,
                'cover_url' => $s->cover_url,
                'thumbnail_url' => $s->thumbnail_url,
                'status' => $s->status,
                'rating' => $s->rating,
                'average_rating' => $s->rating,
                'rating_count' => $s->rating_count,
                'last_chapter_at' => $s->last_chapter_at,
                'latest_chapter' => $latestChapter ? [
                    'number' => $latestChapter->chapter_number,
                    'title' => $latestChapter->title,
                    'published_at' => $latestChapter->published_at,
                ] : null,
                'last_two_chapters' => $s->chapters->take(2)->map(fn($ch) => [
                    'id' => $ch->id,
                    'chapter_number' => $ch->chapter_number,
                    'number' => $ch->chapter_number,
                    'title' => $ch->title,
                    'published_at' => $ch->published_at,
                ])->values()->all(),
                'categories' => $s->categories,
                'types' => $s->mangaTypes,
            ];
        })->all();
    }

    /**
     * Get newly added manga (ordered by created_at).
     */
    private function getNew(int $limit): array
    {
        $series = Series::query()
            ->active()
            ->orderBy('created_at', 'desc')
            ->with(['categories', 'mangaTypes', 'chapters' => function ($q) {
                $q->where('is_published', true)
                    ->orderBy('published_at', 'desc')
                    ->limit(2)
                    ->select('id', 'series_id', 'chapter_number', 'title', 'published_at');
            }])
            ->withCount(['chapters' => fn($q) => $q->where('is_published', true)])
            ->limit($limit)
            ->get();

        return $series->map(function ($s) {
            return [
                'id' => $s->id,
                'title' => $s->title,
                'slug' => $s->slug,
                'cover_url' => $s->cover_url,
                'thumbnail_url' => $s->thumbnail_url,
                'status' => $s->status,
                'rating' => $s->rating,
                'average_rating' => $s->rating,
                'rating_count' => $s->rating_count,
                'total_chapters' => $s->total_chapters,
                'chapters_count' => $s->chapters_count,
                'created_at' => $s->created_at,
                'last_two_chapters' => $s->chapters->take(2)->map(fn($ch) => [
                    'id' => $ch->id,
                    'chapter_number' => $ch->chapter_number,
                    'number' => $ch->chapter_number,
                    'title' => $ch->title,
                    'published_at' => $ch->published_at,
                ])->values()->all(),
                'categories' => $s->categories,
                'types' => $s->mangaTypes,
            ];
        })->all();
    }

    /**
     * Get trending manga.
     */
    private function getTrending(int $limit): array
    {
        $hasRankings = SeriesRanking::exists();

        if ($hasRankings) {
            $rankings = SeriesRanking::getTrending($limit, 0);
            return $rankings->map(function ($ranking) {
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
                ];
            })->all();
        }

        // Fallback
        $series = Series::query()
            ->active()
            ->with(['categories', 'mangaTypes'])
            ->withCount([
                'favorites as favorites_7d' => fn($q) => $q->where('created_at', '>=', now()->subDays(7))
            ])
            ->orderByDesc('favorites_7d')
            ->orderByDesc('total_views')
            ->limit($limit)
            ->get();

        return $series->map(function ($s, $index) {
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
                'views_7d' => 0,
                'favorites_7d' => $s->favorites_7d ?? 0,
                'score' => $s->favorites_7d ?? 0,
                'rank' => $index + 1,
            ];
        })->all();
    }

    /**
     * Get top rated manga.
     */
    private function getTop(int $limit): array
    {
        $hasRankings = SeriesRanking::exists();

        if ($hasRankings) {
            $rankings = SeriesRanking::getTopManga($limit, 0);
            return $rankings->map(function ($ranking) {
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
            })->all();
        }

        // Fallback: use Series::scopeOrderByTopScore (Eloquent scope, no raw DB facade)
        $series = Series::query()
            ->active()
            ->with(['categories', 'mangaTypes'])
            ->orderByTopScore()
            ->limit($limit)
            ->get();

        return $series->map(function ($s, $index) {
            return [
                'id' => $s->id,
                'title' => $s->title,
                'slug' => $s->slug,
                'cover_url' => $s->cover_url,
                'thumbnail_url' => $s->thumbnail_url,
                'status' => $s->status,
                'rating' => $s->rating,
                'average_rating' => $s->rating,
                'rating_count' => $s->rating_count,
                'total_views' => $s->total_views,
                'total_favorites' => $s->total_favorites,
                'categories' => $s->categories,
                'types' => $s->mangaTypes,
                'score' => $s->top_score ?? 0,
                'rank' => $index + 1,
            ];
        })->all();
    }

    /**
     * Get branding data.
     */
    private function getBranding(): array
    {
        $branding = Branding::current();
        $cardLayout = Branding::normalizeCardLayout($branding->card_layout);
        $gridColumns = Branding::normalizeGridColumns($branding->grid_columns);

        return [
            'logo_url' => $branding->logo_url,
            'hero_background_url' => $branding->hero_background_url,
            'hero_image_url' => $branding->hero_image_url,
            'card_layout' => $cardLayout,
            'grid_columns' => $gridColumns,
        ];
    }
}
