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
     */
    public static function defaultCardLayout(): array
    {
        return [
            'home_latest' => 'card_01',
            'home_popular' => 'card_11',
            'home_weekly_highlights' => 'card_03',
            'home_recently_added' => 'card_13',
            'browse_vertical' => 'card_01',
            'browse_horizontal' => 'card_11',
            'rankings' => 'card_15',
            'recently_viewed' => 'card_04',
        ];
    }

    /**
     * Default grid columns per breakpoint (Tailwind: default, sm, md, lg, xl).
     * Keys: vertical, horizontal. Values: { default: n, sm: n, md: n, lg: n, xl: n }.
     */
    public static function defaultGridColumns(): array
    {
        return [
            'vertical' => [
                'default' => 2,
                'sm' => 3,
                'md' => 4,
                'lg' => 5,
                'xl' => 6,
            ],
            'horizontal' => [
                'default' => 1,
                'sm' => 2,
                'md' => 3,
                'lg' => 4,
            ],
        ];
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
