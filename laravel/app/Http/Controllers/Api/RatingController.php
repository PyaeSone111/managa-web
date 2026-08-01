<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Series;
use App\Models\UserRating;
use App\Services\CacheInvalidator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RatingController extends Controller
{
    /**
     * Recalculate and update series.rating and series.rating_count from user_ratings.
     * Ensures overall rating is shown on MySQL (PostgreSQL has a trigger).
     */
    private function updateSeriesRating(int $seriesId): void
    {
        $avg = UserRating::where('series_id', $seriesId)->avg('rating');
        $cnt = UserRating::where('series_id', $seriesId)->count();
        Series::where('id', $seriesId)->update([
            'rating' => $cnt > 0 ? round((float) $avg, 2) : null,
            'rating_count' => $cnt,
        ]);
    }

    /**
     * Rate a manga.
     *
     * POST /api/v1/manga/{id}/rate
     */
    public function store(Request $request, int $id, CacheInvalidator $cacheInvalidator): JsonResponse
    {
        $user = $request->user();
        $series = Series::findOrFail($id);

        $request->validate([
            'rating' => 'required|integer|min:1|max:10',
        ]);

        $rating = $user->rateSeries($id, $request->rating);
        $this->updateSeriesRating($id);
        $series->refresh();

        $cacheInvalidator->invalidateSeries($series);

        return response()->json([
            'message' => 'Rating submitted',
            'data' => [
                'user_rating' => $rating->rating,
                'series_average_rating' => $series->rating,
                'series_rating_count' => $series->rating_count,
            ],
        ]);
    }

    /**
     * Get user's rating for a manga.
     *
     * GET /api/v1/manga/{id}/rate
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        Series::findOrFail($id);

        $rating = UserRating::where('user_id', $user->id)
            ->where('series_id', $id)
            ->first();

        return response()->json([
            'data' => [
                'rating' => $rating?->rating,
                'rated_at' => $rating?->created_at,
            ],
        ]);
    }

    /**
     * Delete user's rating for a manga.
     *
     * DELETE /api/v1/manga/{id}/rate
     */
    public function destroy(Request $request, int $id, CacheInvalidator $cacheInvalidator): JsonResponse
    {
        $user = $request->user();
        $series = Series::findOrFail($id);

        $deleted = UserRating::where('user_id', $user->id)
            ->where('series_id', $id)
            ->delete();

        $this->updateSeriesRating($id);
        $cacheInvalidator->invalidateSeries($series);

        return response()->json([
            'message' => $deleted ? 'Rating removed' : 'No rating to remove',
        ]);
    }

    /**
     * Get user's all ratings.
     *
     * GET /api/v1/user/ratings
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);

        $perPage = min($request->input('per_page', 20), 50);

        $ratings = UserRating::where('user_id', $user->id)
            ->with('series')
            ->orderBy('updated_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'data' => $ratings->items(),
            'meta' => [
                'current_page' => $ratings->currentPage(),
                'per_page' => $ratings->perPage(),
                'total' => $ratings->total(),
                'total_pages' => $ratings->lastPage(),
            ],
        ]);
    }
}
