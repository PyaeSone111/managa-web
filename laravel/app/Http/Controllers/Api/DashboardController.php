<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Branding;
use App\Models\Series;
use App\Models\SeriesRanking;
use App\Services\CacheInvalidator;
use App\Support\SeriesCardFormatter;
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
    public function index(Request $request, CacheInvalidator $cacheInvalidator): JsonResponse
    {
        $request->validate([
            'limit' => 'nullable|integer|min:1|max:20',
        ]);

        $limit = min($request->input('limit', 12), 20);

        // Use a single cache key for the entire dashboard (10 min TTL)
        $cacheKey = "dashboard:home:v3:{$cacheInvalidator->version('dashboard')}:{$limit}";

        $data = Cache::remember($cacheKey, 600, function () use ($limit) {
            // Check once — reused by both getTrending and getTop
            $hasRankings = SeriesRanking::exists();

            return [
                'latest'   => $this->getLatest($limit),
                'new'      => $this->getNew($limit),
                'trending' => $this->getTrending($limit, $hasRankings),
                'top'      => $this->getTop($limit, $hasRankings),
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
            ->with($this->cardRelationsWithChapters())
            ->limit($limit)
            ->get();

        return $series->map(function ($s) {
            $latestChapter = $s->chapters->first();
            return array_merge([
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
            ], SeriesCardFormatter::metaFields($s));
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
            ->with($this->cardRelationsWithChapters())
            ->withCount(['chapters' => fn($q) => $q->where('is_published', true)])
            ->limit($limit)
            ->get();

        return $series->map(function ($s) {
            return array_merge([
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
            ], SeriesCardFormatter::metaFields($s));
        })->all();
    }

    /**
     * Get trending manga.
     */
    private function getTrending(int $limit, bool $hasRankings): array
    {

        if ($hasRankings) {
            $rankings = SeriesRanking::getTrending($limit, 0);
            return $rankings->map(function ($ranking) {
                $s = $ranking->series;
                return array_merge([
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
                    'views_7d' => $ranking->views_7d,
                    'favorites_7d' => $ranking->favorites_7d,
                    'score' => $ranking->trending_score,
                    'rank' => $ranking->trending_rank,
                ], SeriesCardFormatter::metaFields($s));
            })->all();
        }

        // Fallback
        $series = Series::query()
            ->active()
            ->with(SeriesCardFormatter::relations())
            ->withCount([
                'favorites as favorites_7d' => fn($q) => $q->where('created_at', '>=', now()->subDays(7))
            ])
            ->orderByDesc('favorites_7d')
            ->orderByDesc('total_views')
            ->limit($limit)
            ->get();

        return $series->map(function ($s, $index) {
            return array_merge([
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
                'views_7d' => 0,
                'favorites_7d' => $s->favorites_7d ?? 0,
                'score' => $s->favorites_7d ?? 0,
                'rank' => $index + 1,
            ], SeriesCardFormatter::metaFields($s));
        })->all();
    }

    /**
     * Get top rated manga.
     */
    private function getTop(int $limit, bool $hasRankings): array
    {

        if ($hasRankings) {
            $rankings = SeriesRanking::getTopManga($limit, 0);
            return $rankings->map(function ($ranking) {
                $s = $ranking->series;
                return array_merge([
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
                    'score' => $ranking->top_score,
                    'rank' => $ranking->top_rank,
                ], SeriesCardFormatter::metaFields($s));
            })->all();
        }

        // Fallback: use Series::scopeOrderByTopScore (Eloquent scope, no raw DB facade)
        $series = Series::query()
            ->active()
            ->with(SeriesCardFormatter::relations())
            ->orderByTopScore()
            ->limit($limit)
            ->get();

        return $series->map(function ($s, $index) {
            return array_merge([
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
                'score' => $s->top_score ?? 0,
                'rank' => $index + 1,
            ], SeriesCardFormatter::metaFields($s));
        })->all();
    }

    private function cardRelationsWithChapters(): array
    {
        return array_merge(SeriesCardFormatter::relations(), [
            'chapters' => function ($q) {
                $q->where('is_published', true)
                    ->orderBy('published_at', 'desc')
                    ->limit(2)
                    ->select('id', 'series_id', 'chapter_number', 'title', 'published_at');
            },
        ]);
    }

    /**
     * Get branding data.
     */
    private function getBranding(): array
    {
        $branding = Branding::current();
        $payload = Branding::publicPayload($branding);

        // Dashboard branding block stays lean (no app download noise).
        return [
            'logo_url' => $payload['logo_url'],
            'hero_background_url' => $payload['hero_background_url'],
            'hero_image_url' => $payload['hero_image_url'],
            'hero_series_ids' => $payload['hero_series_ids'],
            'hero_series' => $payload['hero_series'],
            'card_layout' => $payload['card_layout'],
            'grid_columns' => $payload['grid_columns'],
        ];
    }
}
