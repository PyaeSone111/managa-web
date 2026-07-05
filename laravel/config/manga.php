<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cache TTL (Time To Live) Configuration
    |--------------------------------------------------------------------------
    |
    | Define cache durations for different types of data.
    | Values are in seconds.
    |
    */

    'cache' => [
        // Static/semi-static data
        'categories' => 3600,           // 1 hour
        'types' => 3600,                // 1 hour
        'authors_list' => 1800,         // 30 minutes

        // Manga data
        'manga_detail' => 300,          // 5 minutes
        'manga_chapters' => 300,        // 5 minutes

        // Rankings (refresh with materialized views)
        'rankings_top' => 900,          // 15 minutes
        'rankings_reading' => 900,      // 15 minutes
        'rankings_trending' => 300,     // 5 minutes (more dynamic)

        // Search results
        'search_results' => 180,        // 3 minutes
        'search_suggestions' => 60,     // 1 minute

        // User-specific (shorter TTL)
        'user_favorites' => 60,         // 1 minute
        'user_progress' => 60,          // 1 minute
    ],

    /*
    |--------------------------------------------------------------------------
    | Ranking Score Weights
    |--------------------------------------------------------------------------
    |
    | Configure the weights used in ranking calculations.
    |
    */

    'rankings' => [
        'top' => [
            'views' => 0.30,
            'favorites' => 0.25,
            'rating' => 0.25,
            'recency' => 0.20,
        ],

        'reading' => [
            'chapters_read' => 10,       // Points per chapter
            'reading_time' => 1,         // Points per minute
            'active_readers' => 5,       // Points per reader
        ],

        'trending' => [
            'views_weight' => 2,
            'favorites_weight' => 50,
            'growth_multiplier' => 1000,
        ],

        // Recency bonuses for top score
        'recency_bonus' => [
            'within_7_days' => 1000,
            'within_30_days' => 500,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Pagination Defaults
    |--------------------------------------------------------------------------
    */

    'pagination' => [
        'default_per_page' => 20,
        'max_per_page' => 50,
        /** Max series returned across all ranking list endpoints (top / reading / trending). */
        'rankings_max_results' => 100,
    ],

    /*
    |--------------------------------------------------------------------------
    | Search Configuration
    |--------------------------------------------------------------------------
    */

    'search' => [
        // Minimum characters for search
        'min_query_length' => 2,

        // Maximum results for suggestions
        'max_suggestions' => 10,

        // PostgreSQL trigram similarity threshold
        'trigram_threshold' => 0.3,
    ],

    /*
    |--------------------------------------------------------------------------
    | Image/CDN Configuration
    |--------------------------------------------------------------------------
    */

    'images' => [
        // CDN base URL (if using CDN)
        'cdn_url' => env('CDN_URL', null),

        // Image sizes
        'sizes' => [
            'thumbnail' => [
                'width' => 200,
                'height' => 280,
                'quality' => 80,
            ],
            'cover_medium' => [
                'width' => 400,
                'height' => 560,
                'quality' => 85,
            ],
            'cover_large' => [
                'width' => 800,
                'height' => 1120,
                'quality' => 90,
            ],
            'page' => [
                'quality' => 90,
            ],
            'page_preview' => [
                'width' => 150,
                'quality' => 75,
            ],
        ],

        // Allowed image formats
        'allowed_formats' => ['jpg', 'jpeg', 'png', 'webp', 'gif'],

        // Maximum file size (in KB)
        'max_file_size' => 10240, // 10MB
    ],

    /*
    |--------------------------------------------------------------------------
    | Data Retention
    |--------------------------------------------------------------------------
    */

    'retention' => [
        // How long to keep view events (in days)
        'view_events' => 180,  // 6 months

        // How long to keep reading sessions (in days)
        'reading_sessions' => 90,  // 3 months
    ],

    /*
    |--------------------------------------------------------------------------
    | Rate Limiting
    |--------------------------------------------------------------------------
    */

    'rate_limits' => [
        // Search requests per minute
        'search' => 60,

        // View events per minute per IP
        'views' => 120,

        // Favorite/rating actions per minute
        'user_actions' => 30,
    ],

];
