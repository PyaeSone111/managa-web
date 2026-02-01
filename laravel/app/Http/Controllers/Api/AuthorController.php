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
     * List all authors.
     *
     * GET /api/v1/authors
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'search' => 'nullable|string|max:100',
        ]);

        $perPage = min($request->input('per_page', 50), 100);
        $search = $request->input('search');

        $cacheKey = "authors:list:{$perPage}:" . md5($search ?? '');

        $authors = Cache::remember($cacheKey, 1800, function () use ($perPage, $search) {
            $query = Author::query()
                ->withCount('series');

            if ($search) {
                $query->search($search);
            }

            return $query->orderBy('name')
                ->paginate($perPage);
        });

        return response()->json([
            'data' => $authors->items(),
            'meta' => [
                'current_page' => $authors->currentPage(),
                'per_page' => $authors->perPage(),
                'total' => $authors->total(),
                'total_pages' => $authors->lastPage(),
            ],
        ]);
    }

    /**
     * Get author details.
     *
     * GET /api/v1/authors/{id}
     */
    public function show(int $id): JsonResponse
    {
        $cacheKey = "author:{$id}";

        $author = Cache::remember($cacheKey, 1800, function () use ($id) {
            return Author::withCount('series')->findOrFail($id);
        });

        return response()->json([
            'data' => $author,
        ]);
    }

    /**
     * Get series by author.
     *
     * GET /api/v1/authors/{id}/series
     */
    public function series(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);

        $author = Author::findOrFail($id);
        $perPage = min($request->input('per_page', 20), 50);

        $series = $author->series()
            ->where('is_active', true)
            ->with(['categories', 'mangaTypes'])
            ->withPivot('role')
            ->orderBy('title')
            ->paginate($perPage);

        return response()->json([
            'data' => $series->items(),
            'meta' => [
                'current_page' => $series->currentPage(),
                'per_page' => $series->perPage(),
                'total' => $series->total(),
                'total_pages' => $series->lastPage(),
            ],
            'author' => [
                'id' => $author->id,
                'name' => $author->name,
                'slug' => $author->slug,
            ],
        ]);
    }
}
