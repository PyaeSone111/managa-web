<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Branding;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminBrandingController extends Controller
{
    /**
     * Get current branding.
     *
     * GET /api/v1/admin/branding
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

    /**
     * Update branding (upload new logo, hero background, hero image).
     * Accepts multipart: optional logo, hero_background, hero_image files.
     * Or JSON: logo_url, hero_background_url, hero_image_url to set URLs directly.
     *
     * PUT /api/v1/admin/branding
     */
    public function update(Request $request): JsonResponse
    {
        $branding = Branding::current();
        $disk = Storage::disk(config('filesystems.cloud', 'r2'));

        $rules = [];
        if ($request->hasFile('logo')) {
            $rules['logo'] = 'image|mimes:jpeg,png,jpg,gif,webp|max:2048';
        }
        if ($request->hasFile('hero_background')) {
            $rules['hero_background'] = 'image|mimes:jpeg,png,jpg,gif,webp|max:5120';
        }
        if ($request->hasFile('hero_image')) {
            $rules['hero_image'] = 'image|mimes:jpeg,png,jpg,gif,webp|max:2048';
        }
        if (!empty($rules)) {
            $request->validate($rules);
        }

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('branding', config('filesystems.cloud', 'r2'));
            $branding->logo_url = $disk->url($path);
        }
        if ($request->hasFile('hero_background')) {
            $path = $request->file('hero_background')->store('branding', config('filesystems.cloud', 'r2'));
            $branding->hero_background_url = $disk->url($path);
        }
        if ($request->hasFile('hero_image')) {
            $path = $request->file('hero_image')->store('branding', config('filesystems.cloud', 'r2'));
            $branding->hero_image_url = $disk->url($path);
        }

        if ($request->isJson() || $request->has('logo_url') || $request->has('hero_background_url') || $request->has('hero_image_url') || $request->has('card_layout') || $request->has('grid_columns')) {
            $request->validate([
                'logo_url' => 'nullable|string|max:500',
                'hero_background_url' => 'nullable|string|max:500',
                'hero_image_url' => 'nullable|string|max:500',
                'card_layout' => 'nullable',
                'grid_columns' => 'nullable',
            ]);
            if ($request->has('logo_url')) {
                $branding->logo_url = $request->input('logo_url') ?: null;
            }
            if ($request->has('hero_background_url')) {
                $branding->hero_background_url = $request->input('hero_background_url') ?: null;
            }
            if ($request->has('hero_image_url')) {
                $branding->hero_image_url = $request->input('hero_image_url') ?: null;
            }
            if ($request->has('card_layout')) {
                $v = $request->input('card_layout');
                $decoded = is_string($v) ? json_decode($v, true) : $v;
                $branding->card_layout = is_array($decoded) ? $decoded : null;
            }
            if ($request->has('grid_columns')) {
                $v = $request->input('grid_columns');
                $decoded = is_string($v) ? json_decode($v, true) : $v;
                $branding->grid_columns = is_array($decoded) ? $decoded : null;
            }
        }

        $branding->save();

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
            'message' => 'Branding updated successfully',
        ]);
    }
}
