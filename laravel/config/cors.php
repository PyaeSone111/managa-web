<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_filter(array_merge(
        [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:3003',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:3001',
            'http://127.0.0.1:3003',
            // Production frontend (Firebase)
            'https://myangar-prod-frontend.web.app',
            'https://myangar-prod-frontend.firebaseapp.com',
            'https://myangar.fatelight.org',
            // Production admin dashboard (Firebase)
            'https://myanga-prod-admin.web.app',
            'https://myanga-prod-admin.firebaseapp.com',
        ],
        env('CORS_ALLOWED_ORIGINS') ? explode(',', env('CORS_ALLOWED_ORIGINS')) : []
    )),

    // Allow all fatelight.org subdomains (e.g. manga-apis.fatelight.org, app.fatelight.org)
    'allowed_origins_patterns' => [
        '#^https?://([a-z0-9-]+\.)*fatelight\.org$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
