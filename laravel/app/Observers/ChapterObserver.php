<?php

namespace App\Observers;

use App\Models\Chapter;
use App\Models\Series;

/**
 * Keeps series.last_chapter_at and series.total_chapters in sync on MySQL.
 * (PostgreSQL uses a DB trigger; this observer is for MySQL / PHPMyAdmin.)
 */
class ChapterObserver
{
    public function saved(Chapter $chapter): void
    {
        $this->syncSeriesStats($chapter->series_id);
    }

    public function deleted(Chapter $chapter): void
    {
        $this->syncSeriesStats($chapter->series_id);
    }

    private function syncSeriesStats(int $seriesId): void
    {
        $series = Series::find($seriesId);
        if (!$series) {
            return;
        }

        $publishedChapters = Chapter::query()
            ->where('series_id', $seriesId)
            ->where('is_published', true);

        $series->total_chapters = $publishedChapters->count();
        $series->last_chapter_at = $publishedChapters->max('published_at');
        $series->saveQuietly();
    }
}
