<?php

namespace App\Console\Commands;

use App\Models\Series;
use App\Models\SeriesRanking;
use App\Models\SeriesStatsDaily;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class RefreshRankings extends Command
{
    protected $signature = 'rankings:refresh';
    protected $description = 'Refresh manga rankings based on aggregated stats';

    public function handle(): int
    {
        $this->info('Refreshing rankings...');

        $startTime = microtime(true);

        // Get all active series
        $series = Series::where('is_active', true)->get();

        $this->output->progressStart($series->count());

        foreach ($series as $manga) {
            $this->refreshRankingForSeries($manga);
            $this->output->progressAdvance();
        }

        $this->output->progressFinish();

        // Calculate ranks
        $this->calculateRanks();

        // Clear ranking caches
        Cache::forget('rankings:top:*');
        Cache::forget('rankings:reading:*');
        Cache::forget('rankings:trending:*');

        $duration = round(microtime(true) - $startTime, 2);
        $this->info("Rankings refreshed in {$duration}s");

        return Command::SUCCESS;
    }

    private function refreshRankingForSeries(Series $series): void
    {
        // Get 7-day stats
        $stats7d = SeriesStatsDaily::where('series_id', $series->id)
            ->where('stat_date', '>=', now()->subDays(7)->toDateString())
            ->selectRaw('
                SUM(views) as views_7d,
                SUM(unique_viewers) as viewers_7d,
                SUM(favorites_added - favorites_removed) as favorites_7d,
                SUM(chapters_read) as chapters_read_7d,
                SUM(reading_time_seconds) as reading_time_7d
            ')
            ->first();

        // Get previous 7-day stats (for trending calculation)
        $statsPrev7d = SeriesStatsDaily::where('series_id', $series->id)
            ->whereBetween('stat_date', [
                now()->subDays(14)->toDateString(),
                now()->subDays(7)->toDateString()
            ])
            ->selectRaw('SUM(views) as views_prev_7d')
            ->first();

        $views7d = $stats7d->views_7d ?? 0;
        $viewers7d = $stats7d->viewers_7d ?? 0;
        $favorites7d = $stats7d->favorites_7d ?? 0;
        $chaptersRead7d = $stats7d->chapters_read_7d ?? 0;
        $readingTime7d = $stats7d->reading_time_7d ?? 0;
        $viewsPrev7d = $statsPrev7d->views_prev_7d ?? 0;

        // Calculate scores
        $topScore = $this->calculateTopScore($series, $views7d, $favorites7d);
        $readingScore = $this->calculateReadingScore($viewers7d, $chaptersRead7d, $readingTime7d);
        $trendingScore = $this->calculateTrendingScore($views7d, $viewsPrev7d, $favorites7d);

        // Upsert ranking
        SeriesRanking::updateOrCreate(
            ['series_id' => $series->id],
            [
                'views_7d' => $views7d,
                'viewers_7d' => $viewers7d,
                'favorites_7d' => $favorites7d,
                'chapters_read_7d' => $chaptersRead7d,
                'reading_time_7d' => $readingTime7d,
                'top_score' => $topScore,
                'reading_score' => $readingScore,
                'trending_score' => $trendingScore,
                'computed_at' => now(),
            ]
        );
    }

    private function calculateTopScore(Series $series): float
    {
        // Configurable weights
        $weights = [
            'views' => 0.30,
            'favorites' => 0.25,
            'rating' => 0.25,
            'recency' => 0.20,
        ];

        $viewsScore = ($series->total_views ?? 0) * $weights['views'];
        $favoritesScore = ($series->total_favorites ?? 0) * 100 * $weights['favorites'];
        $ratingScore = ($series->rating ?? 0) * ($series->rating_count ?? 0) * 10 * $weights['rating'];

        // Recency bonus
        $recencyScore = 0;
        if ($series->last_chapter_at) {
            $daysSinceUpdate = now()->diffInDays($series->last_chapter_at);
            if ($daysSinceUpdate <= 7) {
                $recencyScore = 1000;
            } elseif ($daysSinceUpdate <= 30) {
                $recencyScore = 500;
            }
        }
        $recencyScore *= $weights['recency'];

        return $viewsScore + $favoritesScore + $ratingScore + $recencyScore;
    }

    private function calculateReadingScore(int $viewers7d, int $chaptersRead7d, int $readingTime7d): float
    {
        return ($chaptersRead7d * 10) + ($readingTime7d / 60.0) + ($viewers7d * 5);
    }

    private function calculateTrendingScore(int $views7d, int $viewsPrev7d, int $favorites7d): float
    {
        $growthRate = 0;
        if ($viewsPrev7d > 0) {
            $growthRate = (($views7d - $viewsPrev7d) / $viewsPrev7d) * 1000;
        } else {
            $growthRate = $views7d * 0.1;
        }

        return ($views7d * 2) + ($favorites7d * 50) + $growthRate;
    }

    private function calculateRanks(): void
    {
        $driver = DB::connection()->getDriverName();

        if ($driver === 'pgsql') {
            $this->calculateRanksPostgres();
            return;
        }

        $this->calculateRanksEloquent();
    }

    /**
     * PostgreSQL: single-statement rank updates using ROW_NUMBER() and UPDATE ... FROM.
     */
    private function calculateRanksPostgres(): void
    {
        DB::statement('
            UPDATE series_rankings
            SET top_rank = ranked.rank
            FROM (
                SELECT id, ROW_NUMBER() OVER (ORDER BY top_score DESC) as rank
                FROM series_rankings
            ) as ranked
            WHERE series_rankings.id = ranked.id
        ');
        DB::statement('
            UPDATE series_rankings
            SET reading_rank = ranked.rank
            FROM (
                SELECT id, ROW_NUMBER() OVER (ORDER BY reading_score DESC) as rank
                FROM series_rankings
            ) as ranked
            WHERE series_rankings.id = ranked.id
        ');
        DB::statement('
            UPDATE series_rankings
            SET trending_rank = ranked.rank
            FROM (
                SELECT id, ROW_NUMBER() OVER (ORDER BY trending_score DESC) as rank
                FROM series_rankings
            ) as ranked
            WHERE series_rankings.id = ranked.id
        ');
    }

    /**
     * MySQL/SQLite: compute ranks with Eloquent and bulk update.
     */
    private function calculateRanksEloquent(): void
    {
        $idsByTop = SeriesRanking::orderByDesc('top_score')->pluck('id');
        $idsByReading = SeriesRanking::orderByDesc('reading_score')->pluck('id');
        $idsByTrending = SeriesRanking::orderByDesc('trending_score')->pluck('id');

        foreach ($idsByTop->values() as $rank => $id) {
            SeriesRanking::where('id', $id)->update(['top_rank' => $rank + 1]);
        }
        foreach ($idsByReading->values() as $rank => $id) {
            SeriesRanking::where('id', $id)->update(['reading_rank' => $rank + 1]);
        }
        foreach ($idsByTrending->values() as $rank => $id) {
            SeriesRanking::where('id', $id)->update(['trending_rank' => $rank + 1]);
        }
    }
}
