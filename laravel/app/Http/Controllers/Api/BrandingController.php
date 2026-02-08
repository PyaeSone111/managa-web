<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Branding;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class BrandingController extends Controller
{
    /**
     * Get current branding (logo, hero background, hero image) for the frontend.
     * Cached for 1 hour since branding rarely changes.
     *
     * GET /api/v1/branding
     */
    public function show(): JsonResponse
    {
        $data = Cache::remember('branding:public:v1', 3600, function () {
            $branding = Branding::current();
            $cardLayout = Branding::normalizeCardLayout($branding->card_layout);
            $gridColumns = Branding::normalizeGridColumns($branding->grid_columns);

            return [
                'logo_url' => $branding->logo_url,
                'hero_background_url' => $branding->hero_background_url,
                'hero_image_url' => $branding->hero_image_url,
                'card_layout' => $cardLayout,
                'grid_columns' => $gridColumns,
            ];
        });

        return response()->json([
            'data' => $data,
        ])->header('Cache-Control', 'public, max-age=3600');
    }
}
