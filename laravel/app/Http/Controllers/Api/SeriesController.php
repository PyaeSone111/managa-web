<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Series;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SeriesController extends Controller
{
    /**
     * Get paginated list of series
     * 
     * Query Parameters:
     * - page: Page number (default: 1)
     * - per_page: Items per page (default: 20, max: 100)
     * - category: Filter by category slug
     * - tag: Filter by tag slug
     * - type: Filter by type (manga/manhwa/manhua)
     * - status: Filter by status (ongoing/completed/hiatus/cancelled)
     * - sort: Sort by (latest/popular/rating/alphabetical)
     * - search: Search query
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min($request->get('per_page', 20), 100);
        $query = Series::with(['categories', 'tags'])
            ->where('is_active', true);

        // Apply filters
        if ($request->has('category')) {
            $query->whereHas('categories', function ($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        if ($request->has('tag')) {
            $query->whereHas('tags', function ($q) use ($request) {
                $q->where('slug', $request->tag);
            });
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereFullText(['title', 'description'], $search)
                  ->orWhere('title', 'like', "%{$search}%")
                  ->orWhere('author', 'like', "%{$search}%");
            });
        }

        // Apply sorting
        $sort = $request->get('sort', 'latest');
        switch ($sort) {
            case 'popular':
                $query->orderBy('total_views', 'desc');
                break;
            case 'rating':
                $query->orderBy('rating', 'desc');
                break;
            case 'alphabetical':
                $query->orderBy('title', 'asc');
                break;
            case 'latest':
            default:
                $query->orderBy('updated_at', 'desc');
                break;
        }

        $series = $query->paginate($perPage);

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

    /**
     * Get single series details by ID or slug
     */
    public function show($series): JsonResponse
    {
        // Try to find by slug first, then by ID
        $seriesModel = Series::with(['categories', 'tags'])
            ->where('is_active', true)
            ->where(function ($query) use ($series) {
                $query->where('slug', $series)
                      ->orWhere('id', $series);
            })
            ->firstOrFail();

        // Increment views
        $seriesModel->increment('total_views');

        return response()->json([
            'success' => true,
            'data' => $seriesModel
        ]);
    }

    /**
     * Get chapters for a series by ID or slug
     */
    public function chapters($series, Request $request): JsonResponse
    {
        $perPage = min($request->get('per_page', 50), 100);
        
        // Try to find by slug first, then by ID
        $seriesModel = Series::where(function ($query) use ($series) {
            $query->where('slug', $series)
                  ->orWhere('id', $series);
        })->firstOrFail();
        
        $chapters = $seriesModel->chapters()
            ->where('is_published', true)
            ->orderBy('chapter_number', 'desc')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $chapters->items(),
            'pagination' => [
                'current_page' => $chapters->currentPage(),
                'last_page' => $chapters->lastPage(),
                'per_page' => $chapters->perPage(),
                'total' => $chapters->total(),
            ]
        ]);
    }

    /**
     * Get latest updated series
     */
    public function latest(Request $request): JsonResponse
    {
        $limit = min($request->get('limit', 20), 50);
        
        $series = Series::with(['categories'])
            ->where('is_active', true)
            ->orderBy('updated_at', 'desc')
            ->limit($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $series
        ]);
    }

    /**
     * Get popular series
     */
    public function popular(Request $request): JsonResponse
    {
        $limit = min($request->get('limit', 20), 50);
        
        $series = Series::with(['categories'])
            ->where('is_active', true)
            ->orderBy('total_views', 'desc')
            ->limit($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $series
        ]);
    }

    /**
     * Get trending series (based on recent views)
     */
    public function trending(Request $request): JsonResponse
    {
        $limit = min($request->get('limit', 20), 50);
        
        // This could be enhanced with a separate trending calculation table
        $series = Series::with(['categories'])
            ->where('is_active', true)
            ->where('updated_at', '>=', now()->subDays(7))
            ->orderBy('total_views', 'desc')
            ->limit($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $series
        ]);
    }
}

