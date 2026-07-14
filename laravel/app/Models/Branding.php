<?php

namespace App\Models;

use App\Support\SeriesCardFormatter;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Branding extends Model
{
    protected $table = 'branding';

    protected $fillable = [
        'logo_url',
        'hero_background_url',
        'hero_image_url',
        'hero_series_ids',
        'app_download_url',
        'app_download_filename',
        'app_version',
        'app_size_mb',
        'card_layout',
        'grid_columns',
    ];

    public static function defaultAppDownload(): array
    {
        return [
            'app_download_url' => 'https://myangar.fatelight.org/download',
            'app_download_filename' => 'myangarread00121v01.apk',
            'app_version' => '1.0',
            'app_size_mb' => '29',
        ];
    }

    public static function appDownloadPayload(self $branding): array
    {
        $defaults = self::defaultAppDownload();

        return [
            'app_download_url' => $branding->app_download_url ?: $defaults['app_download_url'],
            'app_download_filename' => $branding->app_download_filename ?: $defaults['app_download_filename'],
            'app_version' => $branding->app_version ?: $defaults['app_version'],
            'app_size_mb' => $branding->app_size_mb ?: $defaults['app_size_mb'],
        ];
    }

    protected $casts = [
        'card_layout' => 'array',
        'grid_columns' => 'array',
        'hero_series_ids' => 'array',
    ];

    /**
     * Default card layout: section key => card id (card_01 .. card_20).
     * Browse: single view. Rankings: separate top, most read, trending.
     */
    public static function defaultCardLayout(): array
    {
        return [
            'home_latest' => 'card_01',
            'home_popular' => 'card_11',
            'home_weekly_highlights' => 'card_03',
            'home_recently_added' => 'card_13',
            'home_hero' => 'card_01',
            'browse' => 'card_11',
            'rankings_top' => 'card_15',
            'rankings_most_read' => 'card_15',
            'rankings_trending' => 'card_20',
            'recently_viewed' => 'card_04',
            'favorites' => 'card_11',
        ];
    }

    /**
     * Section keys that have a grid (for grid_columns).
     */
    public static function gridColumnSectionKeys(): array
    {
        return [
            'home_latest',
            'home_popular',
            'home_weekly_highlights',
            'home_recently_added',
            'browse',
            'rankings_top',
            'rankings_most_read',
            'rankings_trending',
            'recently_viewed',
            'favorites',
        ];
    }

    /**
     * Default grid columns per section (per view). Each section: { default, sm, md, lg, xl }.
     */
    public static function defaultGridColumns(): array
    {
        $vertical = [
            'default' => 2,
            'sm' => 3,
            'md' => 4,
            'lg' => 5,
            'xl' => 6,
        ];
        $horizontal = [
            'default' => 1,
            'sm' => 2,
            'md' => 3,
            'lg' => 4,
            'xl' => 5,
        ];
        $sections = self::gridColumnSectionKeys();
        $result = [];
        foreach ($sections as $key) {
            $result[$key] = in_array($key, ['home_latest', 'home_weekly_highlights', 'recently_viewed'], true)
                ? $vertical
                : $horizontal;
        }
        return $result;
    }

    /**
     * Normalize card_layout: merge with defaults and map legacy keys (rankings, browse_vertical, browse_horizontal) to new.
     */
    public static function normalizeCardLayout(?array $stored): array
    {
        $defaults = self::defaultCardLayout();
        if (empty($stored)) {
            return $defaults;
        }
        $out = array_merge($defaults, $stored);
        if (isset($stored['rankings']) && !isset($stored['rankings_top'])) {
            $out['rankings_top'] = $stored['rankings'];
            $out['rankings_most_read'] = $stored['rankings'];
            $out['rankings_trending'] = $stored['rankings'];
        }
        if ((isset($stored['browse_vertical']) || isset($stored['browse_horizontal'])) && !isset($stored['browse'])) {
            $out['browse'] = $stored['browse_horizontal'] ?? $stored['browse_vertical'] ?? $defaults['browse'];
        }
        // Hero carousel is portrait-only (01–10). All other sections allow 01–20.
        $hero = $out['home_hero'] ?? $defaults['home_hero'];
        $heroNum = (int) str_replace('card_', '', (string) $hero);
        if ($heroNum < 1 || $heroNum > 10) {
            $out['home_hero'] = $defaults['home_hero'];
        }

        foreach ($out as $key => $card) {
            if ($key === 'home_hero') {
                continue;
            }
            $num = (int) str_replace('card_', '', (string) $card);
            if ($num < 1 || $num > 20) {
                $out[$key] = $defaults[$key] ?? 'card_01';
            }
        }

        return $out;
    }

    /**
     * Normalize grid_columns: convert legacy { vertical, horizontal } to per-section and merge with defaults.
     */
    public static function normalizeGridColumns(?array $stored): array
    {
        $defaults = self::defaultGridColumns();
        if (empty($stored)) {
            return $defaults;
        }
        if (isset($stored['vertical']) || isset($stored['horizontal'])) {
            $converted = [];
            foreach (self::gridColumnSectionKeys() as $key) {
                $useVertical = in_array($key, ['home_latest', 'home_weekly_highlights', 'recently_viewed'], true);
                $converted[$key] = $stored[$useVertical ? 'vertical' : 'horizontal'] ?? $defaults[$key];
            }
            return array_merge($defaults, $converted);
        }
        return array_merge($defaults, $stored);
    }

    public static function normalizeHeroSeriesIds(mixed $stored): array
    {
        if (is_string($stored)) {
            $decoded = json_decode($stored, true);
            $stored = is_array($decoded) ? $decoded : [];
        }
        if (!is_array($stored)) {
            return [];
        }

        $ids = [];
        foreach ($stored as $id) {
            $n = (int) $id;
            if ($n > 0 && !in_array($n, $ids, true)) {
                $ids[] = $n;
            }
        }

        return array_slice($ids, 0, 20);
    }

    /**
     * Ordered series payloads for the home hero carousel.
     */
    public static function heroSeriesPayload(?array $ids): array
    {
        $ids = self::normalizeHeroSeriesIds($ids);
        if ($ids === []) {
            return [];
        }

        $series = Series::query()
            ->active()
            ->whereIn('id', $ids)
            ->with(SeriesCardFormatter::relations())
            ->get()
            ->keyBy('id');

        $out = [];
        foreach ($ids as $id) {
            $s = $series->get($id);
            if (!$s) {
                continue;
            }
            $out[] = array_merge([
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
                'categories' => $s->categories,
            ], SeriesCardFormatter::metaFields($s));
        }

        return $out;
    }

    public static function publicPayload(self $branding): array
    {
        $heroIds = self::normalizeHeroSeriesIds($branding->hero_series_ids);

        return array_merge([
            'logo_url' => $branding->logo_url,
            'hero_background_url' => $branding->hero_background_url,
            'hero_image_url' => $branding->hero_image_url,
            'hero_series_ids' => $heroIds,
            'hero_series' => self::heroSeriesPayload($heroIds),
            'card_layout' => self::normalizeCardLayout($branding->card_layout),
            'grid_columns' => self::normalizeGridColumns($branding->grid_columns),
        ], self::appDownloadPayload($branding));
    }

    /**
     * Get the singleton branding row (first or create default).
     */
    public static function current(): self
    {
        $row = self::first();
        if ($row) {
            return $row;
        }
        return self::create([
            'logo_url' => null,
            'hero_background_url' => null,
            'hero_image_url' => null,
            'hero_series_ids' => [],
        ]);
    }

    /**
     * Clear cached public branding and homepage dashboard payloads.
     */
    public static function clearPublicCache(): void
    {
        Cache::forget('branding:public:v1');

        for ($limit = 1; $limit <= 20; $limit++) {
            Cache::forget("dashboard:home:v3:{$limit}");
        }
    }
}
