<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Branding extends Model
{
    protected $table = 'branding';

    protected $fillable = [
        'logo_url',
        'hero_background_url',
        'hero_image_url',
        'card_layout',
        'grid_columns',
    ];

    protected $casts = [
        'card_layout' => 'array',
        'grid_columns' => 'array',
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
            'browse' => 'card_11',
            'rankings_top' => 'card_15',
            'rankings_most_read' => 'card_15',
            'rankings_trending' => 'card_20',
            'recently_viewed' => 'card_04',
            'favorites' => 'card_11',
        ];
    }

    /**
     * Section keys that have a grid (for grid_columns). Recently viewed is carousel, so excluded.
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
            $result[$key] = in_array($key, ['home_latest', 'home_weekly_highlights'], true)
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
                $useVertical = in_array($key, ['home_latest', 'home_weekly_highlights'], true);
                $converted[$key] = $stored[$useVertical ? 'vertical' : 'horizontal'] ?? $defaults[$key];
            }
            return array_merge($defaults, $converted);
        }
        return array_merge($defaults, $stored);
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
        ]);
    }
}
