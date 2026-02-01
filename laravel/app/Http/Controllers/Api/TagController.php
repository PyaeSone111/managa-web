<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TagController extends Controller
{
    /**
     * Get all tags
     */
    public function index(): JsonResponse
    {
        $tags = Tag::orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => $tags
        ]);
    }

    /**
     * Get single tag
     */
    public function show($id): JsonResponse
    {
        $tag = Tag::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $tag
        ]);
    }

    /**
     * Get series with a tag
     */
    public function series($id, Request $request): JsonResponse
    {
        $perPage = min($request->get('per_page', 20), 100);
        
        $tag = Tag::findOrFail($id);
        
        $series = $tag->series()
            ->where('is_active', true)
            ->with(['categories', 'tags'])
            ->orderBy('updated_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
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

