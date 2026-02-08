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
     * List all manga types with caching (1 hour)
     */
    public function index(): JsonResponse
    {
        $types = Cache::remember('manga_types:all:v2', 3600, function () {
            return MangaType::query()
                ->select(['id', 'name', 'slug'])
                ->orderBy('name')
                ->get();
        });

        return response()->json([
            'data' => $types,
        ])->header('Cache-Control', 'public, max-age=3600');
    }

    /**
     * Get manga type details with caching
     */
    public function show(int $id): JsonResponse
    {
        $type = Cache::remember("manga_type:{$id}:v2", 3600, function () use ($id) {
            return MangaType::select(['id', 'name', 'slug'])->findOrFail($id);
        });

        return response()->json([
            'data' => $type,
        ]);
    }

    /**
     * Get series by manga type with caching
     */
    public function series(Request $request, int $id): JsonResponse
    {
        $perPage = min($request->input('per_page', 20), 50);
        $page = $request->input('page', 1);
        $sort = $request->input('sort', 'title');

        $cacheKey = "manga_type:{$id}:series:{$page}:{$perPage}:{$sort}";

        $result = Cache::remember($cacheKey, 300, function () use ($id, $perPage, $sort) {
            $type = MangaType::select(['id', 'name', 'slug'])->findOrFail($id);

            $query = $type->series()
                ->select([
                    'series.id', 'title', 'slug', 'cover_url', 'thumbnail_url',
                    'status', 'rating', 'total_views', 'last_chapter_at'
                ])
                ->where('is_active', true)
                ->with(['categories:id,name,slug']);

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

            return [
                'series' => $query->paginate($perPage),
                'type' => $type,
            ];
        });

        return response()->json([
            'data' => $result['series']->items(),
            'meta' => [
                'current_page' => $result['series']->currentPage(),
                'per_page' => $result['series']->perPage(),
                'total' => $result['series']->total(),
                'total_pages' => $result['series']->lastPage(),
            ],
            'type' => [
                'id' => $result['type']->id,
                'name' => $result['type']->name,
                'slug' => $result['type']->slug,
            ],
        ]);
    }
}
