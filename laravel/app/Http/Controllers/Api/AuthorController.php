<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Author;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AuthorController extends Controller
{
    /**
     * List all authors with caching (1 hour)
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min($request->input('per_page', 50), 100);
        $page = $request->input('page', 1);
        $search = $request->input('search');

        $cacheKey = "authors:list:v2:{$page}:{$perPage}:" . md5($search ?? '');

        $result = Cache::remember($cacheKey, 3600, function () use ($perPage, $search) {
            $query = Author::query()
                ->select(['id', 'name', 'slug']);

            if ($search) {
                $query->where('name', 'like', "%{$search}%");
            }

            return $query->orderBy('name')->paginate($perPage);
        });

        return response()->json([
            'data' => $result->items(),
            'meta' => [
                'current_page' => $result->currentPage(),
                'per_page' => $result->perPage(),
                'total' => $result->total(),
                'total_pages' => $result->lastPage(),
            ],
        ])->header('Cache-Control', 'public, max-age=3600');
    }

    /**
     * Get author details with caching
     */
    public function show(int $id): JsonResponse
    {
        $author = Cache::remember("author:{$id}:v2", 3600, function () use ($id) {
            return Author::select(['id', 'name', 'slug'])->findOrFail($id);
        });

        return response()->json([
            'data' => $author,
        ]);
    }

    /**
     * Get series by author with caching
     */
    public function series(Request $request, int $id): JsonResponse
    {
        $perPage = min($request->input('per_page', 20), 50);
        $page = $request->input('page', 1);

        $cacheKey = "author:{$id}:series:{$page}:{$perPage}";

        $result = Cache::remember($cacheKey, 300, function () use ($id, $perPage) {
            $author = Author::select(['id', 'name', 'slug'])->findOrFail($id);

            $series = $author->series()
                ->select([
                    'series.id', 'title', 'slug', 'cover_url', 'thumbnail_url',
                    'status', 'rating', 'total_views', 'last_chapter_at'
                ])
                ->where('is_active', true)
                ->with(['categories:id,name,slug', 'mangaTypes:id,name,slug'])
                ->withPivot('role')
                ->orderBy('title')
                ->paginate($perPage);

            return ['series' => $series, 'author' => $author];
        });

        return response()->json([
            'data' => $result['series']->items(),
            'meta' => [
                'current_page' => $result['series']->currentPage(),
                'per_page' => $result['series']->perPage(),
                'total' => $result['series']->total(),
                'total_pages' => $result['series']->lastPage(),
            ],
            'author' => [
                'id' => $result['author']->id,
                'name' => $result['author']->name,
                'slug' => $result['author']->slug,
            ],
        ]);
    }
}
