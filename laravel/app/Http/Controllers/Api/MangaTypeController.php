<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MangaType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class MangaTypeController extends Controller
{
    /**
     * List all manga types.
     *
     * GET /api/v1/types
     */
    public function index(): JsonResponse
    {
        $types = Cache::remember('manga_types:all', 3600, function () {
            return MangaType::withCount('series')
                ->orderBy('name')
                ->get();
        });

        return response()->json([
            'data' => $types,
        ]);
    }

    /**
     * Get manga type details.
     *
     * GET /api/v1/types/{id}
     */
    public function show(int $id): JsonResponse
    {
        $cacheKey = "manga_type:{$id}";

        $type = Cache::remember($cacheKey, 3600, function () use ($id) {
            return MangaType::withCount('series')->findOrFail($id);
        });

        return response()->json([
            'data' => $type,
        ]);
    }

    /**
     * Get series by manga type.
     *
     * GET /api/v1/types/{id}/series
     */
    public function series(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:50',
            'sort' => 'nullable|in:title,latest,rating,views',
        ]);

        $type = MangaType::findOrFail($id);
        $perPage = min($request->input('per_page', 20), 50);
        $sort = $request->input('sort', 'title');

        $query = $type->series()
            ->where('is_active', true)
            ->with(['categories', 'authors']);

        switch ($sort) {
            case 'latest':
                $query->orderBy('last_chapter_at', 'desc');
                break;
            case 'rating':
                $query->orderBy('rating', 'desc');
                break;
            case 'views':
                $query->orderBy('total_views', 'desc');
                break;
            default:
                $query->orderBy('title');
        }

        $series = $query->paginate($perPage);

        return response()->json([
            'data' => $series->items(),
            'meta' => [
                'current_page' => $series->currentPage(),
                'per_page' => $series->perPage(),
                'total' => $series->total(),
                'total_pages' => $series->lastPage(),
            ],
            'type' => [
                'id' => $type->id,
                'name' => $type->name,
                'slug' => $type->slug,
            ],
        ]);
    }
}
