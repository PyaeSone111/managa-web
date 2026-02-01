<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    /**
     * Get all categories
     */
    public function index(): JsonResponse
    {
        $categories = Category::orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }

    /**
     * Get single category
     */
    public function show($id): JsonResponse
    {
        $category = Category::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $category
        ]);
    }

    /**
     * Get series in a category
     */
    public function series($id, Request $request): JsonResponse
    {
        $perPage = min($request->get('per_page', 20), 100);
        
        $category = Category::findOrFail($id);
        
        $series = $category->series()
            ->where('is_active', true)
            ->with(['categories', 'tags'])
            ->orderBy('updated_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $series->items(),
            'pagination' => [
                'current_page' => $series->currentPage(),
                'last_page' => $series->lastPage(),
                'per_page' => $series->perPage(),
                'total' => $series->total(),
            ]
        ]);
    }
}

