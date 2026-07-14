<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Branding;
use Illuminate\Http\JsonResponse;

class BrandingController extends Controller
{
    /**
     * Get current branding (logo, hero, card layout, hero series carousel).
     *
     * GET /api/v1/branding
     */
    public function show(): JsonResponse
    {
        $branding = Branding::current();

        return response()->json([
            'data' => Branding::publicPayload($branding),
        ])->header('Cache-Control', 'no-store, no-cache, must-revalidate');
    }
}
