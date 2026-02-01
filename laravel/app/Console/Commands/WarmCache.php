<?php

namespace App\Console\Commands;

use App\Models\Category;
use App\Models\MangaType;
use App\Models\Series;
use App\Models\SeriesRanking;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class WarmCache extends Command
{
    protected $signature = 'cache:warm {--rankings : Only warm ranking caches}';
    protected $description = 'Warm up frequently accessed caches';

    public function handle(): int
    {
        $this->info('Warming caches...');

        if (!$this->option('rankings')) {
            $this->warmStaticCaches();
        }

        $this->warmRankingCaches();

        $this->info('Cache warming complete!');

        return Command::SUCCESS;
    }

    private function warmStaticCaches(): void
    {
        $this->info('  Warming static caches...');

        // Categories
        Cache::remember('categories:all', 3600, function () {
            return Category::withCount('series')->orderBy('name')->get();
        });
        $this->info('    - Categories cached');

        // Manga types
        Cache::remember('manga_types:all', 3600, function () {
            return MangaType::withCount('series')->orderBy('name')->get();
        });
        $this->info('    - Manga types cached');
    }

    private function warmRankingCaches(): void
    {
        $this->info('  Warming ranking caches...');

        $perPage = 20;

        // Top rankings (first 3 pages)
        for ($page = 1; $page <= 3; $page++) {
            $offset = ($page - 1) * $perPage;
            $cacheKey = "rankings:top:{$page}:{$perPage}";

            Cache::remember($cacheKey, 900, function () use ($perPage, $offset) {
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
                                'score' => $ranking->top_score,
                                'rank' => $ranking->top_rank,
                            ];
                        }),
                        'total' => $total,
                    ];
                }

                return ['items' => collect(), 'total' => 0];
            });
        }
        $this->info('    - Top rankings cached (pages 1-3)');

        // Trending rankings (first 2 pages - more dynamic)
        for ($page = 1; $page <= 2; $page++) {
            $offset = ($page - 1) * $perPage;
            $cacheKey = "rankings:trending:{$page}:{$perPage}";

            Cache::remember($cacheKey, 300, function () use ($perPage, $offset) {
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
                            ];
                        }),
                        'total' => $total,
                    ];
                }

                return ['items' => collect(), 'total' => 0];
            });
        }
        $this->info('    - Trending rankings cached (pages 1-2)');

        // Recently updated
        Cache::remember('manga:recent:1:20', 300, function () {
            return Series::recentlyUpdated()
                ->with(['categories', 'mangaTypes'])
                ->paginate(20);
        });
        $this->info('    - Recently updated cached');
    }
}
