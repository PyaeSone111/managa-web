<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\MangaType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class AdminMangaTypeController extends Controller
{
    /**
     * List all manga types (admin view).
     */
    public function index(): JsonResponse
    {
        $types = MangaType::withCount('series')
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $types,
        ]);
    }

    /**
     * Create a new manga type.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:50|unique:manga_types,name',
            'slug' => 'nullable|string|max:50|unique:manga_types,slug',
            'description' => 'nullable|string|max:255',
        ]);

        $type = MangaType::create([
            'name' => $request->name,
            'slug' => $request->slug ?? Str::slug($request->name),
            'description' => $request->description,
        ]);

        Cache::forget('manga_types:all');

        return response()->json([
            'message' => 'Manga type created successfully',
            'data' => $type,
        ], 201);
    }

    /**
     * Update a manga type.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $type = MangaType::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|required|string|max:50|unique:manga_types,name,' . $id,
            'slug' => 'sometimes|string|max:50|unique:manga_types,slug,' . $id,
            'description' => 'nullable|string|max:255',
        ]);

        $type->update($request->only(['name', 'slug', 'description']));

        Cache::forget('manga_types:all');
        Cache::forget("manga_type:{$id}");

        return response()->json([
            'message' => 'Manga type updated successfully',
            'data' => $type,
        ]);
    }

    /**
     * Delete a manga type.
     */
    public function destroy(int $id): JsonResponse
    {
        $type = MangaType::findOrFail($id);

        // Check if type has series
        if ($type->series()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete manga type with associated series',
            ], 422);
        }

        $type->delete();

        Cache::forget('manga_types:all');
        Cache::forget("manga_type:{$id}");

        return response()->json([
            'message' => 'Manga type deleted successfully',
        ]);
    }
}
