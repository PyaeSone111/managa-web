<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class AdminCategoryController extends Controller
{
    /**
     * List all categories (admin, no cache).
     */
    public function index(): JsonResponse
    {
        $categories = Category::withCount('series')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $categories,
        ])->header('Cache-Control', 'no-store, no-cache, must-revalidate');
    }

    /**
     * Create a new category
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
            'slug' => 'nullable|string|max:255|unique:categories,slug',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:255',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $category = Category::create($validated);

        return response()->json([
            'success' => true,
            'data' => $category,
            'message' => 'Category created successfully',
        ], 201);
    }

    /**
     * Get a category for admin edit.
     */
    public function show($id): JsonResponse
    {
        $category = Category::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $category,
        ])->header('Cache-Control', 'no-store, no-cache, must-revalidate');
    }

    /**
     * Update a category
     */
    public function update(Request $request, $id): JsonResponse
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255', \Illuminate\Validation\Rule::unique('categories', 'name')->ignore($id)],
            'slug' => ['sometimes', 'string', 'max:255', \Illuminate\Validation\Rule::unique('categories', 'slug')->ignore($id)],
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:255',
        ]);

        $category->update($validated);

        return response()->json([
            'success' => true,
            'data' => $category,
            'message' => 'Category updated successfully'
        ]);
    }

    /**
     * Delete a category
     */
    public function destroy($id): JsonResponse
    {
        $category = Category::findOrFail($id);
        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Category deleted successfully'
        ]);
    }
}

