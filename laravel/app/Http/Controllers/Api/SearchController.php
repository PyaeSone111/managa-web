<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Series;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SearchController extends Controller
{
    /**
     * Search series
     * 
     * Query Parameters:
     * - q: Search query (required)
     * - page: Page number (default: 1)
     * - per_page: Items per page (default: 20)
     */
    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'q' => 'required|string|min:2|max:100',
        ]);

        $perPage = min($request->get('per_page', 20), 100);
        $query = $request->get('q');

        $series = Series::with(['categories', 'tags'])
            ->where('is_active', true)
            ->where(function ($q) use ($query) {
                $q->whereFullText(['title', 'description'], $query)
                  ->orWhere('title', 'like', "%{$query}%")
                  ->orWhere('description', 'like', "%{$query}%")
                  ->orWhere('author', 'like', "%{$query}%")
                  ->orWhere('artist', 'like', "%{$query}%");
            })
            ->orderBy('total_views', 'desc')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'query' => $query,
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

