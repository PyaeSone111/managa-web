<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Series;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class SeriesController extends Controller
{
    /**
     * Get paginated list of series with caching
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min($request->get('per_page', 20), 100);
        $page = $request->get('page', 1);
        $category = $request->get('category');
        $types = $request->get('types');
        $authors = $request->get('authors');
        $status = $request->get('status');
        $search = $request->get('search');
        $sort = $request->get('sort', 'latest');

        // Build cache key from all parameters
        $cacheKey = 'series:list:' . md5(serialize([
            'page' => $page,
            'perPage' => $perPage,
            'category' => $category,
            'types' => $types,
            'authors' => $authors,
            'status' => $status,
            'search' => $search,
            'sort' => $sort,
        ]));

        $result = Cache::remember($cacheKey, 120, function () use (
            $perPage, $category, $types, $authors, $status, $search, $sort
        ) {
            $query = Series::query()
                ->select([
                    'id', 'title', 'slug', 'cover_url', 'thumbnail_url',
                    'status', 'rating', 'rating_count', 'total_views',
                    'total_favorites', 'total_chapters', 'last_chapter_at', 'created_at'
                ])
                ->with(['categories:id,name,slug', 'mangaTypes:id,name,slug'])
                ->where('is_active', true);

            if ($category) {
                $query->whereHas('categories', fn($q) => $q->where('slug', $category));
            }

            if ($types) {
                $typeIds = array_filter(explode(',', $types));
                if (!empty($typeIds)) {
                    $query->whereHas('mangaTypes', fn($q) => $q->whereIn('manga_types.id', $typeIds));
                }
            }

            if ($authors) {
                $authorIds = array_filter(explode(',', $authors));
                if (!empty($authorIds)) {
                    $query->whereHas('authors', fn($q) => $q->whereIn('authors.id', $authorIds));
                }
            }

            if ($status) {
                $query->where('status', $status);
            }

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('author', 'like', "%{$search}%");
                });
            }

            switch ($sort) {
                case 'popular':
                    $query->orderBy('total_views', 'desc');
                    break;
                case 'rating':
                    $query->orderBy('rating', 'desc');
                    break;
                case 'alphabetical':
                    $query->orderBy('title', 'asc');
                    break;
                case 'newest':
                    $query->orderBy('created_at', 'desc');
                    break;
                case 'latest':
                default:
                    $query->orderBy('last_chapter_at', 'desc')->orderBy('updated_at', 'desc');
                    break;
            }

            return $query->paginate($perPage);
        });

        return response()->json([
            'success' => true,
            'data' => $result->items(),
            'pagination' => [
                'current_page' => $result->currentPage(),
                'last_page' => $result->lastPage(),
                'per_page' => $result->perPage(),
                'total' => $result->total(),
            ]
        ]);
    }

    /**
     * Get single series details by ID or slug with caching
     */
    public function show($series): JsonResponse
    {
        $cacheKey = "series:show:{$series}";

        $seriesModel = Cache::remember($cacheKey, 300, function () use ($series) {
            return Series::query()
                ->with([
                    'categories:id,name,slug',
                    'mangaTypes:id,name,slug',
                    'authors:id,name,slug',
                    'tags:id,name,slug'
                ])
                ->where('is_active', true)
                ->where(function ($query) use ($series) {
                    $query->where('slug', $series);
                    if (is_numeric($series)) {
                        $query->orWhere('id', (int) $series);
                    }
                })
                ->firstOrFail();
        });

        $seriesModel->incrementTotalViews();

        return response()->json([
            'success' => true,
            'data' => $seriesModel
        ]);
    }

    /**
     * Get chapters for a series with caching
     */
    public function chapters($series, Request $request): JsonResponse
    {
        $perPage = min($request->get('per_page', 50), 100);
        $page = $request->get('page', 1);

        $cacheKey = "series:chapters:{$series}:{$page}:{$perPage}";

        $result = Cache::remember($cacheKey, 180, function () use ($series, $perPage) {
            $seriesModel = Series::query()
                ->select('id')
                ->where(function ($query) use ($series) {
                    $query->where('slug', $series);
                    if (is_numeric($series)) {
                        $query->orWhere('id', (int) $series);
                    }
                })
                ->firstOrFail();

            return $seriesModel->chapters()
                ->select(['id', 'series_id', 'chapter_number', 'title', 'published_at', 'views'])
                ->where('is_published', true)
                ->orderBy('chapter_number', 'desc')
                ->paginate($perPage);
        });

        return response()->json([
            'success' => true,
            'data' => $result->items(),
            'pagination' => [
                'current_page' => $result->currentPage(),
                'last_page' => $result->lastPage(),
                'per_page' => $result->perPage(),
                'total' => $result->total(),
            ]
        ]);
    }

    /**
     * Get latest updated series with caching
     */
    public function latest(Request $request): JsonResponse
    {
        $limit = min($request->get('limit', 20), 50);

        $series = Cache::remember("series:latest:{$limit}", 300, function () use ($limit) {
            return Series::query()
                ->select(['id', 'title', 'slug', 'cover_url', 'thumbnail_url', 'status', 'rating', 'total_views'])
                ->with(['categories:id,name,slug'])
                ->where('is_active', true)
                ->orderBy('last_chapter_at', 'desc')
                ->limit($limit)
                ->get();
        });

        return response()->json([
            'success' => true,
            'data' => $series
        ]);
    }

    /**
     * Get popular series with caching
     */
    public function popular(Request $request): JsonResponse
    {
        $limit = min($request->get('limit', 20), 50);

        $series = Cache::remember("series:popular:{$limit}", 300, function () use ($limit) {
            return Series::query()
                ->select(['id', 'title', 'slug', 'cover_url', 'thumbnail_url', 'status', 'rating', 'total_views'])
                ->with(['categories:id,name,slug'])
                ->where('is_active', true)
                ->orderBy('total_views', 'desc')
                ->limit($limit)
                ->get();
        });

        return response()->json([
            'success' => true,
            'data' => $series
        ]);
    }

    /**
     * Get trending series with caching
     */
    public function trending(Request $request): JsonResponse
    {
        $limit = min($request->get('limit', 20), 50);

        $series = Cache::remember("series:trending:{$limit}", 300, function () use ($limit) {
            return Series::query()
                ->select(['id', 'title', 'slug', 'cover_url', 'thumbnail_url', 'status', 'rating', 'total_views'])
                ->with(['categories:id,name,slug'])
                ->where('is_active', true)
                ->where('updated_at', '>=', now()->subDays(7))
                ->orderBy('total_views', 'desc')
                ->limit($limit)
                ->get();
        });

        return response()->json([
            'success' => true,
            'data' => $series
        ]);
    }
}

