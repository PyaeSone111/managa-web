<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Branding;
use Illuminate\Http\JsonResponse;

class BrandingController extends Controller
{
    /**
     * Get current branding (logo, hero background, hero image, card layout).
     *
     * GET /api/v1/branding
     */
    public function show(): JsonResponse
    {
        $branding = Branding::current();
        $cardLayout = Branding::normalizeCardLayout($branding->card_layout);
        $gridColumns = Branding::normalizeGridColumns($branding->grid_columns);
        $appDownload = Branding::appDownloadPayload($branding);

        return response()->json([
            'data' => array_merge([
                'logo_url' => $branding->logo_url,
                'hero_background_url' => $branding->hero_background_url,
                'hero_image_url' => $branding->hero_image_url,
                'card_layout' => $cardLayout,
                'grid_columns' => $gridColumns,
            ], $appDownload),
        ])->header('Cache-Control', 'no-store, no-cache, must-revalidate');
    }
}
