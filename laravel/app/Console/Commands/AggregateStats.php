<?php

namespace App\Console\Commands;

use App\Models\SeriesStatsDaily;
use App\Models\ViewEvent;
use App\Models\UserFavorite;
use App\Models\UserRating;
use App\Models\UserReadingSession;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class AggregateStats extends Command
{
    protected $signature = 'stats:aggregate {--date= : Date to aggregate (YYYY-MM-DD), defaults to today}';
    protected $description = 'Aggregate daily stats from view events and user activity';

    public function handle(): int
    {
        $date = $this->option('date') ?? now()->toDateString();
        $this->info("Aggregating stats for {$date}...");

        $startTime = microtime(true);

        // Aggregate view events
        $this->aggregateViews($date);

        // Aggregate favorites
        $this->aggregateFavorites($date);

        // Aggregate ratings
        $this->aggregateRatings($date);

        // Aggregate reading activity
        $this->aggregateReadingActivity($date);

        $duration = round(microtime(true) - $startTime, 2);
        $this->info("Stats aggregated in {$duration}s");

        return Command::SUCCESS;
    }

    private function aggregateViews(string $date): void
    {
        $this->info('  Aggregating views...');

        $viewStats = ViewEvent::whereDate('viewed_at', $date)
            ->selectRaw('
                series_id,
                COUNT(*) as views,
                COUNT(DISTINCT COALESCE(user_id::TEXT, ip_hash)) as unique_viewers
            ')
            ->groupBy('series_id')
            ->get();

        foreach ($viewStats as $stat) {
            SeriesStatsDaily::updateOrCreate(
                [
                    'series_id' => $stat->series_id,
                    'stat_date' => $date,
                ],
                [
                    'views' => $stat->views,
                    'unique_viewers' => $stat->unique_viewers,
                ]
            );
        }

        $this->info("    {$viewStats->count()} series processed");
    }

    private function aggregateFavorites(string $date): void
    {
        $this->info('  Aggregating favorites...');

        // Added favorites
        $added = UserFavorite::whereDate('created_at', $date)
            ->selectRaw('series_id, COUNT(*) as count')
            ->groupBy('series_id')
            ->pluck('count', 'series_id');

        // Removed favorites (if we track deletions, otherwise skip)
        // For now, we'll just track additions

        foreach ($added as $seriesId => $count) {
            SeriesStatsDaily::updateOrCreate(
                [
                    'series_id' => $seriesId,
                    'stat_date' => $date,
                ],
                [
                    'favorites_added' => $count,
                ]
            );
        }

        $this->info("    {$added->count()} series with new favorites");
    }

    private function aggregateRatings(string $date): void
    {
        $this->info('  Aggregating ratings...');

        $ratings = UserRating::whereDate('created_at', $date)
            ->orWhereDate('updated_at', $date)
            ->selectRaw('
                series_id,
                COUNT(*) as ratings_count,
                SUM(rating) as ratings_sum
            ')
            ->groupBy('series_id')
            ->get();

        foreach ($ratings as $stat) {
            SeriesStatsDaily::updateOrCreate(
                [
                    'series_id' => $stat->series_id,
                    'stat_date' => $date,
                ],
                [
                    'ratings_count' => $stat->ratings_count,
                    'ratings_sum' => $stat->ratings_sum,
                ]
            );
        }

        $this->info("    {$ratings->count()} series with ratings activity");
    }

    private function aggregateReadingActivity(string $date): void
    {
        $this->info('  Aggregating reading activity...');

        $reading = UserReadingSession::whereDate('started_at', $date)
            ->whereNotNull('ended_at')
            ->selectRaw('
                series_id,
                COUNT(*) as chapters_read,
                SUM(duration_seconds) as reading_time_seconds
            ')
            ->groupBy('series_id')
            ->get();

        foreach ($reading as $stat) {
            SeriesStatsDaily::updateOrCreate(
                [
                    'series_id' => $stat->series_id,
                    'stat_date' => $date,
                ],
                [
                    'chapters_read' => $stat->chapters_read,
                    'reading_time_seconds' => $stat->reading_time_seconds ?? 0,
                ]
            );
        }

        $this->info("    {$reading->count()} series with reading activity");
    }
}
