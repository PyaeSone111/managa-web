<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Theme;
use Illuminate\Http\JsonResponse;

class ThemeController extends Controller
{
    /**
     * Get the active theme config for the frontend (public).
     */
    public function active(): JsonResponse
    {
        $theme = Theme::getActive();

        if (!$theme) {
            return response()->json([
                'success' => true,
                'data' => null,
                'message' => 'No active theme',
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $theme->id,
                'name' => $theme->name,
                'slug' => $theme->slug,
                'config' => $theme->config ?? [],
            ],
        ]);
    }
}
