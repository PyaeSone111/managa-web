<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Series;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class AdminSeriesController extends Controller
{
    /**
     * Store an image file to Cloudflare R2 and return the public URL.
     */
    protected function storeImageToR2(Request $request, string $key, string $folder): ?string
    {
        if (!$request->hasFile($key)) {
            return null;
        }
        $file = $request->file($key);
        $disk = Storage::disk(config('filesystems.cloud', 'r2'));
        $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        $storedPath = $disk->putFileAs('uploads/' . $folder, $file, $filename, 'public');
        $url = $disk->url($storedPath);
        if (!empty(env('R2_PUBLIC_URL'))) {
            $url = rtrim(env('R2_PUBLIC_URL'), '/') . '/' . $storedPath;
        }
        return $url;
    }

    /**
     * Create a new series
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:series,slug',
            'description' => 'nullable|string',
            'thumbnail_url' => 'nullable|url',
            'cover_url' => 'nullable|url',
            'thumbnail_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:10240',
            'cover_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:10240',
            'type' => ['required', Rule::in(['manga', 'manhwa', 'manhua'])],
            'status' => ['required', Rule::in(['ongoing', 'completed', 'hiatus', 'cancelled'])],
            'author' => 'nullable|string|max:255',
            'artist' => 'nullable|string|max:255',
            'year' => 'nullable|integer|min:1900|max:' . date('Y'),
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'exists:categories,id',
            'tag_ids' => 'nullable|array',
            'tag_ids.*' => 'exists:tags,id',
            'is_featured' => 'nullable|boolean',
        ]);

        // Upload images to R2 when provided (override URL if both sent)
        $coverUrl = $this->storeImageToR2($request, 'cover_image', 'cover');
        if ($coverUrl !== null) {
            $validated['cover_url'] = $coverUrl;
        }
        $thumbUrl = $this->storeImageToR2($request, 'thumbnail_image', 'thumbnail');
        if ($thumbUrl !== null) {
            $validated['thumbnail_url'] = $thumbUrl;
        }
        unset($validated['cover_image'], $validated['thumbnail_image']);

        // Generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
            // Ensure uniqueness
            $counter = 1;
            $originalSlug = $validated['slug'];
            while (Series::where('slug', $validated['slug'])->exists()) {
                $validated['slug'] = $originalSlug . '-' . $counter;
                $counter++;
            }
        }

        $categoryIds = $validated['category_ids'] ?? [];
        $tagIds = $validated['tag_ids'] ?? [];
        unset($validated['category_ids'], $validated['tag_ids']);

        $series = Series::create($validated);

        if (!empty($categoryIds)) {
            $series->categories()->attach($categoryIds);
        }

        if (!empty($tagIds)) {
            $series->tags()->attach($tagIds);
        }

        $series->load(['categories', 'tags']);

        return response()->json([
            'success' => true,
            'data' => $series,
            'message' => 'Series created successfully'
        ], 201);
    }

    /**
     * Update a series
     */
    public function update(Request $request, $id): JsonResponse
    {
        $series = Series::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'slug' => ['sometimes', 'string', 'max:255', Rule::unique('series', 'slug')->ignore($id)],
            'description' => 'nullable|string',
            'thumbnail_url' => 'nullable|url',
            'cover_url' => 'nullable|url',
            'thumbnail_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:10240',
            'cover_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:10240',
            'type' => ['sometimes', Rule::in(['manga', 'manhwa', 'manhua'])],
            'status' => ['sometimes', Rule::in(['ongoing', 'completed', 'hiatus', 'cancelled'])],
            'author' => 'nullable|string|max:255',
            'artist' => 'nullable|string|max:255',
            'year' => 'nullable|integer|min:1900|max:' . date('Y'),
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'exists:categories,id',
            'tag_ids' => 'nullable|array',
            'tag_ids.*' => 'exists:tags,id',
            'is_featured' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
        ]);

        // Upload images to R2 when provided
        $coverUrl = $this->storeImageToR2($request, 'cover_image', 'cover');
        if ($coverUrl !== null) {
            $validated['cover_url'] = $coverUrl;
        }
        $thumbUrl = $this->storeImageToR2($request, 'thumbnail_image', 'thumbnail');
        if ($thumbUrl !== null) {
            $validated['thumbnail_url'] = $thumbUrl;
        }
        unset($validated['cover_image'], $validated['thumbnail_image']);

        $categoryIds = $validated['category_ids'] ?? null;
        $tagIds = $validated['tag_ids'] ?? null;
        unset($validated['category_ids'], $validated['tag_ids']);

        $series->update($validated);

        if ($categoryIds !== null) {
            $series->categories()->sync($categoryIds);
        }

        if ($tagIds !== null) {
            $series->tags()->sync($tagIds);
        }

        $series->load(['categories', 'tags']);

        return response()->json([
            'success' => true,
            'data' => $series,
            'message' => 'Series updated successfully'
        ]);
    }

    /**
     * Delete a series
     */
    public function destroy($id): JsonResponse
    {
        $series = Series::findOrFail($id);
        $series->delete();

        return response()->json([
            'success' => true,
            'message' => 'Series deleted successfully'
        ]);
    }
}

