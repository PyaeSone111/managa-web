<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Series;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AdvancedSearchController extends Controller
{
    /**
     * Advanced search with all filters.
     *
     * GET /api/v1/search
     *
     * Query parameters:
     * - q: Search term (searches title, description, alt names)
     * - status: Filter by status (ongoing, completed, dropped, hiatus)
     * - categories[]: Array of category IDs
     * - types[]: Array of manga type IDs
     * - authors[]: Array of author IDs
     * - release_from: Release date range start (YYYY-MM-DD)
     * - release_to: Release date range end (YYYY-MM-DD)
     * - sort: Sort order (relevance, latest, newest, rating, views, favorites, title)
     * - page: Page number
     * - per_page: Items per page (max 50)
     */
    public function search(Request $request): JsonResponse
    {
        $this->normalizeSearchRequest($request);

        $request->validate([
            'q' => 'nullable|string|max:255',
            'status' => 'nullable|in:ongoing,completed,dropped,hiatus,cancelled',
            'categories' => 'nullable|array',
            'categories.*' => 'integer|exists:categories,id',
            'types' => 'nullable|array',
            'types.*' => 'integer|exists:manga_types,id',
            'authors' => 'nullable|array',
            'authors.*' => 'integer|exists:authors,id',
            'release_from' => 'nullable|date',
            'release_to' => 'nullable|date',
            'sort' => 'nullable|in:relevance,latest,newest,oldest,rating,views,favorites,title,title_asc,title_desc',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);

        $filters = $request->only([
            'q',
            'status',
            'categories',
            'types',
            'authors',
            'release_from',
            'release_to',
            'sort',
        ]);

        $perPage = min($request->input('per_page', 20), 50);

        // Generate cache key based on filters
        $cacheKey = 'search:' . md5(serialize($filters) . $request->input('page', 1) . $perPage);

        $results = Cache::remember($cacheKey, 180, function () use ($filters, $perPage) {
            return Series::advancedSearch($filters)
                ->with(['categories', 'mangaTypes', 'authors', 'altNames'])
                ->paginate($perPage);
        });

        return response()->json([
            'data' => $results->items(),
            'meta' => [
                'current_page' => $results->currentPage(),
                'per_page' => $results->perPage(),
                'total' => $results->total(),
                'total_pages' => $results->lastPage(),
                'last_page' => $results->lastPage(),
            ],
            'filters_applied' => array_filter($filters),
        ]);
    }

    private function normalizeSearchRequest(Request $request): void
    {
        if ($request->filled('search') && !$request->filled('q')) {
            $request->merge(['q' => $request->input('search')]);
        }

        foreach (['categories', 'types', 'authors'] as $key) {
            $value = $request->input($key);
            if (is_string($value) && $value !== '') {
                $request->merge([
                    $key => array_values(array_filter(array_map('intval', explode(',', $value)))),
                ]);
            }
        }
    }

    /**
     * Quick search suggestions (for autocomplete).
     *
     * GET /api/v1/search/suggestions
     */
    public function suggestions(Request $request): JsonResponse
    {
        $request->validate([
            'q' => 'required|string|min:2|max:100',
        ]);

        $term = $request->input('q');

        $cacheKey = 'search_suggestions:' . md5($term);

        $suggestions = Cache::remember($cacheKey, 60, function () use ($term) {
            return Series::query()
                ->active()
                ->search($term)
                ->select('id', 'title', 'slug', 'thumbnail_url')
                ->limit(10)
                ->get();
        });

        return response()->json([
            'data' => $suggestions,
        ]);
    }
}
