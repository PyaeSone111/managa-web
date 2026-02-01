<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Author;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class AdminAuthorController extends Controller
{
    /**
     * List all authors (admin view).
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'search' => 'nullable|string|max:100',
        ]);

        $perPage = min($request->input('per_page', 20), 100);

        $query = Author::withCount('series');

        if ($request->has('search')) {
            $query->where('name', 'ILIKE', '%' . $request->search . '%');
        }

        $authors = $query->orderBy('name')->paginate($perPage);

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
     * Create a new author.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:authors,slug',
            'bio' => 'nullable|string',
            'image_url' => 'nullable|url|max:1000',
        ]);

        $author = Author::create([
            'name' => $request->name,
            'slug' => $request->slug ?? Str::slug($request->name),
            'bio' => $request->bio,
            'image_url' => $request->image_url,
        ]);

        Cache::forget('authors:list:*');

        return response()->json([
            'message' => 'Author created successfully',
            'data' => $author,
        ], 201);
    }

    /**
     * Update an author.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $author = Author::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|string|max:255|unique:authors,slug,' . $id,
            'bio' => 'nullable|string',
            'image_url' => 'nullable|url|max:1000',
        ]);

        $author->update($request->only(['name', 'slug', 'bio', 'image_url']));

        Cache::forget("author:{$id}");
        Cache::forget('authors:list:*');

        return response()->json([
            'message' => 'Author updated successfully',
            'data' => $author,
        ]);
    }

    /**
     * Delete an author.
     */
    public function destroy(int $id): JsonResponse
    {
        $author = Author::findOrFail($id);

        // Check if author has series
        if ($author->series()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete author with associated series',
            ], 422);
        }

        $author->delete();

        Cache::forget("author:{$id}");
        Cache::forget('authors:list:*');

        return response()->json([
            'message' => 'Author deleted successfully',
        ]);
    }
}
