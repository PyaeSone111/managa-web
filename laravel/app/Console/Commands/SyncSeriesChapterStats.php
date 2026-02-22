<?php

namespace App\Console\Commands;

use App\Models\Chapter;
use App\Models\Series;
use Illuminate\Console\Command;

/**
 * One-time backfill of last_chapter_at and total_chapters for all series (MySQL / PHPMyAdmin).
 * Run: php artisan series:sync-chapter-stats
 */
class SyncSeriesChapterStats extends Command
{
    protected $signature = 'series:sync-chapter-stats';
    protected $description = 'Sync last_chapter_at and total_chapters on all series (for MySQL)';

    public function handle(): int
    {
        $this->info('Syncing series chapter stats...');

        $count = 0;
        Series::query()->chunk(100, function ($seriesList) use (&$count) {
            foreach ($seriesList as $series) {
                $published = Chapter::query()
                    ->where('series_id', $series->id)
                    ->where('is_published', true);
                $series->total_chapters = $published->count();
                $series->last_chapter_at = $published->max('published_at');
                $series->saveQuietly();
                $count++;
            }
        });

        $this->info("Updated {$count} series.");
        return Command::SUCCESS;
    }
}
