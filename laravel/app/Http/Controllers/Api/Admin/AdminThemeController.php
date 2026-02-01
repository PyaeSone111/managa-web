<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Theme;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminThemeController extends Controller
{
    /**
     * List all themes.
     */
    public function index(): JsonResponse
    {
        $themes = Theme::orderBy('is_active', 'desc')->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => $themes,
        ]);
    }

    /**
     * Get a single theme.
     */
    public function show(int $id): JsonResponse
    {
        $theme = Theme::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $theme,
        ]);
    }

    /**
     * Create a new theme.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:themes,slug',
            'is_active' => 'boolean',
            'config' => 'nullable|array',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        if (!empty($validated['is_active'])) {
            Theme::query()->update(['is_active' => false]);
        } else {
            unset($validated['is_active']);
        }

        $theme = Theme::create($validated);

        return response()->json([
            'success' => true,
            'data' => $theme,
            'message' => 'Theme created successfully',
        ], 201);
    }

    /**
     * Update a theme.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $theme = Theme::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => ['sometimes', 'string', 'max:255', \Illuminate\Validation\Rule::unique('themes', 'slug')->ignore($id)],
            'is_active' => 'boolean',
            'config' => 'nullable|array',
        ]);

        if (isset($validated['is_active']) && $validated['is_active']) {
            Theme::query()->where('id', '!=', $id)->update(['is_active' => false]);
        }

        $theme->update($validated);

        return response()->json([
            'success' => true,
            'data' => $theme,
            'message' => 'Theme updated successfully',
        ]);
    }

    /**
     * Delete a theme.
     */
    public function destroy(int $id): JsonResponse
    {
        $theme = Theme::findOrFail($id);

        if ($theme->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete the active theme. Activate another theme first.',
            ], 422);
        }

        $theme->delete();

        return response()->json([
            'success' => true,
            'message' => 'Theme deleted successfully',
        ]);
    }

    /**
     * Set a theme as active (used by frontend to show this theme).
     */
    public function activate(int $id): JsonResponse
    {
        $theme = Theme::findOrFail($id);
        $theme->activate();

        return response()->json([
            'success' => true,
            'data' => $theme,
            'message' => 'Theme activated successfully',
        ]);
    }
}
