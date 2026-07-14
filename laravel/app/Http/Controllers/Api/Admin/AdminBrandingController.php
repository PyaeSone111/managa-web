<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Branding;
use App\Models\Series;
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
        $payload = Branding::publicPayload($branding);
        // Editor must show what is stored (01–20 for Recent). publicPayload uses the same rules.
        $payload['card_layout'] = Branding::normalizeCardLayout(
            is_array($branding->card_layout) ? $branding->card_layout : null
        );

        return response()->json([
            'data' => $payload,
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

        $hasTextFields = $request->isJson()
            || $request->has('logo_url')
            || $request->has('hero_background_url')
            || $request->has('hero_image_url')
            || $request->has('card_layout')
            || $request->has('grid_columns')
            || $request->has('hero_series_ids')
            || $request->has('app_download_url')
            || $request->has('app_download_filename')
            || $request->has('app_version')
            || $request->has('app_size_mb');

        if ($hasTextFields) {
            $request->validate([
                'logo_url' => 'nullable|string|max:500',
                'hero_background_url' => 'nullable|string|max:500',
                'hero_image_url' => 'nullable|string|max:500',
                'app_download_url' => 'nullable|string|max:500',
                'app_download_filename' => 'nullable|string|max:120',
                'app_version' => 'nullable|string|max:20',
                'app_size_mb' => 'nullable|string|max:10',
                'card_layout' => 'nullable',
                'grid_columns' => 'nullable',
                'hero_series_ids' => 'nullable',
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
            if ($request->has('app_download_url')) {
                $branding->app_download_url = $request->input('app_download_url') ?: null;
            }
            if ($request->has('app_download_filename')) {
                $branding->app_download_filename = $request->input('app_download_filename') ?: null;
            }
            if ($request->has('app_version')) {
                $branding->app_version = $request->input('app_version') ?: null;
            }
            if ($request->has('app_size_mb')) {
                $branding->app_size_mb = $request->input('app_size_mb') ?: null;
            }
            if ($request->has('card_layout')) {
                $v = $request->input('card_layout');
                $decoded = is_string($v) ? json_decode($v, true) : $v;
                $branding->card_layout = is_array($decoded)
                    ? Branding::normalizeCardLayout($decoded)
                    : null;
            }
            if ($request->has('grid_columns')) {
                $v = $request->input('grid_columns');
                $decoded = is_string($v) ? json_decode($v, true) : $v;
                $branding->grid_columns = is_array($decoded) ? $decoded : null;
            }
            if ($request->has('hero_series_ids')) {
                $v = $request->input('hero_series_ids');
                $decoded = is_string($v) ? json_decode($v, true) : $v;
                $ids = Branding::normalizeHeroSeriesIds($decoded);
                if ($ids !== []) {
                    $existing = Series::query()->whereIn('id', $ids)->pluck('id')->all();
                    $ids = array_values(array_filter($ids, fn ($id) => in_array($id, $existing, true)));
                }
                $branding->hero_series_ids = $ids;
            }
        }

        $branding->save();
        $branding->refresh();

        Branding::clearPublicCache();

        $payload = Branding::publicPayload($branding);
        $payload['card_layout'] = Branding::normalizeCardLayout(
            is_array($branding->card_layout) ? $branding->card_layout : null
        );

        return response()->json([
            'data' => $payload,
            'message' => 'Branding updated successfully',
        ]);
    }
}
