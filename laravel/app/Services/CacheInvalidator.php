<?php

namespace App\Services;

use App\Models\Chapter;
use App\Models\Series;
use Illuminate\Support\Facades\Cache;

/**
 * Central place for clearing read caches after admin writes.
 *
 * Caches keyed by a fixed identifier (series id/slug, chapter id) are
 * forgotten directly. Caches keyed by pagination/filter params (series
 * lists, dashboard, rankings) can't be swept with `Cache::forget('key:*')`
 * — wildcards are not supported by the file/array cache drivers used here —
 * so those groups are invalidated by bumping a version stamp that read
 * endpoints mix into their cache key instead.
 */
class CacheInvalidator
{
    public function version(string $group): int
    {
        return (int) Cache::get("cache_version:{$group}", 1);
    }

    private function bump(string $group): void
    {
        Cache::forever("cache_version:{$group}", $this->version($group) + 1);
    }

    /**
     * Call after creating, updating, or deleting a series.
     */
    public function invalidateSeries(Series $series, ?string $previousSlug = null): void
    {
        Cache::forget("series:show:{$series->id}");
        Cache::forget("series:show:{$series->slug}");
        if ($previousSlug && $previousSlug !== $series->slug) {
            Cache::forget("series:show:{$previousSlug}");
        }

        $this->bumpListGroups();
    }

    /**
     * Call after creating, updating, or deleting a chapter. Pass the old
     * chapter_number when an update changes it, so its stale cache entry
     * (keyed by series+number) is cleared too.
     */
    public function invalidateChapter(Chapter $chapter, float|int|null $previousChapterNumber = null): void
    {
        Cache::forget("chapter:{$chapter->id}:v2");
        Cache::forget("chapter:{$chapter->id}:pages");

        $series = $chapter->series ?? Series::find($chapter->series_id);
        if ($series) {
            Cache::forget("chapter:series:{$series->slug}:num:" . (float) $chapter->chapter_number . ':v2');
            if ($previousChapterNumber !== null && (float) $previousChapterNumber !== (float) $chapter->chapter_number) {
                Cache::forget("chapter:series:{$series->slug}:num:" . (float) $previousChapterNumber . ':v2');
            }
            Cache::forget("series:show:{$series->id}");
            Cache::forget("series:show:{$series->slug}");
        }

        $this->bump('series_chapters');
        $this->bumpListGroups();
    }

    /**
     * Call after the rankings table is recomputed.
     */
    public function invalidateRankings(): void
    {
        $this->bump('rankings');
        $this->bump('dashboard');
    }

    private function bumpListGroups(): void
    {
        $this->bump('series_list');
        $this->bump('series_legacy_lists');
        $this->bump('dashboard');
        $this->bump('rankings');
        $this->bump('manga_recent');
        $this->bump('manga_new');
    }
}
