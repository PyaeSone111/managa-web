<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Branding;
use Illuminate\Http\JsonResponse;

class BrandingController extends Controller
{
    /**
     * Get current branding (logo, hero background, hero image) for the frontend.
     *
     * GET /api/v1/branding
     */
    public function show(): JsonResponse
    {
        $branding = Branding::current();
        $cardLayout = $branding->card_layout ?? Branding::defaultCardLayout();
        $gridColumns = $branding->grid_columns ?? Branding::defaultGridColumns();
        return response()->json([
            'data' => [
                'logo_url' => $branding->logo_url,
                'hero_background_url' => $branding->hero_background_url,
                'hero_image_url' => $branding->hero_image_url,
                'card_layout' => $cardLayout,
                'grid_columns' => $gridColumns,
            ],
        ]);
    }
}
