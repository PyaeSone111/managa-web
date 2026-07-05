<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class AdminTagController extends Controller
{
    /**
     * List all tags (admin, no cache).
     */
    public function index(): JsonResponse
    {
        $tags = Tag::withCount('series')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $tags,
        ])->header('Cache-Control', 'no-store, no-cache, must-revalidate');
    }

    /**
     * Create a new tag
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:tags,name',
            'slug' => 'nullable|string|max:255|unique:tags,slug',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $tag = Tag::create($validated);

        return response()->json([
            'success' => true,
            'data' => $tag,
            'message' => 'Tag created successfully'
        ], 201);
    }

    /**
     * Get a tag for admin edit.
     */
    public function show($id): JsonResponse
    {
        $tag = Tag::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $tag,
        ])->header('Cache-Control', 'no-store, no-cache, must-revalidate');
    }

    /**
     * Update a tag
     */
    public function update(Request $request, $id): JsonResponse
    {
        $tag = Tag::findOrFail($id);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255', \Illuminate\Validation\Rule::unique('tags', 'name')->ignore($id)],
            'slug' => ['sometimes', 'string', 'max:255', \Illuminate\Validation\Rule::unique('tags', 'slug')->ignore($id)],
        ]);

        $tag->update($validated);

        return response()->json([
            'success' => true,
            'data' => $tag,
            'message' => 'Tag updated successfully'
        ]);
    }

    /**
     * Delete a tag
     */
    public function destroy($id): JsonResponse
    {
        $tag = Tag::findOrFail($id);
        $tag->delete();

        return response()->json([
            'success' => true,
            'message' => 'Tag deleted successfully'
        ]);
    }
}

