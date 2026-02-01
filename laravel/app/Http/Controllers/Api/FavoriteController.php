<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Series;
use App\Models\UserFavorite;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class FavoriteController extends Controller
{
    /**
     * Get user's favorites list.
     *
     * GET /api/v1/user/favorites
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:50',
            'sort' => 'nullable|in:added,title,latest',
        ]);

        $perPage = min($request->input('per_page', 20), 50);
        $sort = $request->input('sort', 'added');

        $query = UserFavorite::where('user_id', $user->id)
            ->with(['series' => function ($q) {
                $q->with(['categories', 'mangaTypes', 'authors']);
            }]);

        switch ($sort) {
            case 'title':
                $query->join('series', 'user_favorites.series_id', '=', 'series.id')
                    ->orderBy('series.title', 'asc')
                    ->select('user_favorites.*');
                break;
            case 'latest':
                $query->join('series', 'user_favorites.series_id', '=', 'series.id')
                    ->orderBy('series.last_chapter_at', 'desc')
                    ->select('user_favorites.*');
                break;
            default:
                $query->orderBy('created_at', 'desc');
        }

        $results = $query->paginate($perPage);

        $data = $results->getCollection()->map(function ($favorite) {
            return [
                'id' => $favorite->id,
                'added_at' => $favorite->created_at,
                'series' => $favorite->series,
            ];
        });

        return response()->json([
            'data' => $data,
            'meta' => [
                'current_page' => $results->currentPage(),
                'per_page' => $results->perPage(),
                'total' => $results->total(),
                'total_pages' => $results->lastPage(),
            ],
        ]);
    }

    /**
     * Add series to favorites.
     *
     * POST /api/v1/manga/{id}/favorite
     */
    public function store(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $series = Series::findOrFail($id);

        // Check if already favorited
        $existing = UserFavorite::where('user_id', $user->id)
            ->where('series_id', $id)
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Series already in favorites',
                'is_favorited' => true,
            ], 200);
        }

        UserFavorite::create([
            'user_id' => $user->id,
            'series_id' => $id,
        ]);

        // Clear user favorites cache
        Cache::forget("user:{$user->id}:favorites");

        return response()->json([
            'message' => 'Added to favorites',
            'is_favorited' => true,
        ], 201);
    }

    /**
     * Remove series from favorites.
     *
     * DELETE /api/v1/manga/{id}/favorite
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $deleted = UserFavorite::where('user_id', $user->id)
            ->where('series_id', $id)
            ->delete();

        // Clear user favorites cache
        Cache::forget("user:{$user->id}:favorites");

        return response()->json([
            'message' => $deleted ? 'Removed from favorites' : 'Series was not in favorites',
            'is_favorited' => false,
        ]);
    }

    /**
     * Toggle favorite status.
     *
     * POST /api/v1/manga/{id}/favorite/toggle
     */
    public function toggle(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        Series::findOrFail($id);

        $isFavorited = $user->toggleFavorite($id);

        // Clear user favorites cache
        Cache::forget("user:{$user->id}:favorites");

        return response()->json([
            'message' => $isFavorited ? 'Added to favorites' : 'Removed from favorites',
            'is_favorited' => $isFavorited,
        ]);
    }

    /**
     * Check if series is favorited.
     *
     * GET /api/v1/manga/{id}/favorite/check
     */
    public function check(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'is_favorited' => false,
            ]);
        }

        $isFavorited = $user->hasFavorited($id);

        return response()->json([
            'is_favorited' => $isFavorited,
        ]);
    }
}
