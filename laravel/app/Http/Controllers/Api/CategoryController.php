<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class CategoryController extends Controller
{
    /**
     * Get all categories with caching (1 hour)
     */
    public function index(): JsonResponse
    {
        $categories = Cache::remember('categories:all', 3600, function () {
            return Category::query()
                ->select(['id', 'name', 'slug', 'description'])
                ->orderBy('name')
                ->get();
        });

        return response()->json([
            'success' => true,
            'data' => $categories
        ])->header('Cache-Control', 'public, max-age=3600');
    }

    /**
     * Get single category with caching
     */
    public function show($id): JsonResponse
    {
        $category = Cache::remember("category:{$id}", 3600, function () use ($id) {
            return Category::select(['id', 'name', 'slug', 'description'])->findOrFail($id);
        });

        return response()->json([
            'success' => true,
            'data' => $category
        ]);
    }

    /**
     * Get series in a category with caching
     */
    public function series($id, Request $request): JsonResponse
    {
        $perPage = min($request->get('per_page', 20), 100);
        $page = $request->get('page', 1);

        $cacheKey = "category:{$id}:series:{$page}:{$perPage}";

        $result = Cache::remember($cacheKey, 300, function () use ($id, $perPage) {
            $category = Category::findOrFail($id);

            return $category->series()
                ->select([
                    'series.id', 'title', 'slug', 'cover_url', 'thumbnail_url',
                    'status', 'rating', 'total_views', 'last_chapter_at'
                ])
                ->where('is_active', true)
                ->with(['categories:id,name,slug', 'mangaTypes:id,name,slug'])
                ->orderBy('last_chapter_at', 'desc')
                ->paginate($perPage);
        });

        return response()->json([
            'success' => true,
            'data' => $result->items(),
            'pagination' => [
                'current_page' => $result->currentPage(),
                'last_page' => $result->lastPage(),
                'per_page' => $result->perPage(),
                'total' => $result->total(),
            ]
        ]);
    }
}
