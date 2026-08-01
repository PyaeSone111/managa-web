<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SeriesController;
use App\Http\Controllers\Api\ChapterController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\TagController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\AdvancedSearchController;
use App\Http\Controllers\Api\RankingsController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\ReadingProgressController;
use App\Http\Controllers\Api\RatingController;
use App\Http\Controllers\Api\AuthorController;
use App\Http\Controllers\Api\MangaTypeController;
use App\Http\Controllers\Api\Admin\AdminSeriesController;
use App\Http\Controllers\Api\Admin\AdminChapterController;
use App\Http\Controllers\Api\Admin\AdminCategoryController;
use App\Http\Controllers\Api\Admin\AdminTagController;
use App\Http\Controllers\Api\Admin\AdminUploadController;
use App\Http\Controllers\Api\Admin\AdminAuthorController;
use App\Http\Controllers\Api\Admin\AdminMangaTypeController;
use App\Http\Controllers\Api\Admin\AdminThemeController;
use App\Http\Controllers\Api\ThemeController;
use App\Http\Controllers\Api\BrandingController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\Admin\AdminBrandingController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// ==========================================================================
// Public API Routes (No Authentication Required)
// ==========================================================================
Route::prefix('v1')->middleware('cache-public-api')->group(function () {

    // ======================================================================
    // Series/Manga Routes
    // ======================================================================
    Route::get('/series', [SeriesController::class, 'index']);
    Route::get('/series/{series}', [SeriesController::class, 'show']);
    Route::get('/series/{series}/chapters', [SeriesController::class, 'chapters']);

    // Alias: /manga routes point to same controllers (specific paths before {series})
    Route::get('/manga', [SeriesController::class, 'index']);
    Route::get('/manga/recent', [RankingsController::class, 'recentlyUpdated']);
    Route::get('/manga/new', [RankingsController::class, 'recentlyAdded']);
    Route::get('/manga/{series}', [SeriesController::class, 'show']);
    Route::get('/manga/{series}/chapters', [SeriesController::class, 'chapters']);

    // ======================================================================
    // Chapter Routes
    // ======================================================================
    Route::get('/chapters/{id}', [ChapterController::class, 'show']);
    Route::get('/chapters/{id}/pages', [ChapterController::class, 'pages']);
    Route::get('/series/{series}/chapters/{chapterNumber}', [ChapterController::class, 'showBySeriesAndNumber']);

    // ======================================================================
    // Category Routes
    // ======================================================================
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{id}', [CategoryController::class, 'show']);
    Route::get('/categories/{id}/series', [CategoryController::class, 'series']);

    // ======================================================================
    // Tag Routes
    // ======================================================================
    Route::get('/tags', [TagController::class, 'index']);
    Route::get('/tags/{id}', [TagController::class, 'show']);
    Route::get('/tags/{id}/series', [TagController::class, 'series']);

    // ======================================================================
    // Author Routes
    // ======================================================================
    Route::get('/authors', [AuthorController::class, 'index']);
    Route::get('/authors/{id}', [AuthorController::class, 'show']);
    Route::get('/authors/{id}/series', [AuthorController::class, 'series']);

    // ======================================================================
    // Theme (public: active theme for frontend)
    // ======================================================================
    Route::get('/theme/active', [ThemeController::class, 'active']);

    // ======================================================================
    // Branding (public: logo, hero background, hero image for frontend)
    // ======================================================================
    Route::get('/branding', [BrandingController::class, 'show']);

    // ======================================================================
    // Dashboard (consolidated homepage data in a single call)
    // ======================================================================
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // ======================================================================
    // Manga Type Routes
    // ======================================================================
    Route::get('/types', [MangaTypeController::class, 'index']);
    Route::get('/types/{id}', [MangaTypeController::class, 'show']);
    Route::get('/types/{id}/series', [MangaTypeController::class, 'series']);

    // ======================================================================
    // Search Routes
    // ======================================================================
    Route::get('/search', [AdvancedSearchController::class, 'search']);
    Route::get('/search/suggestions', [AdvancedSearchController::class, 'suggestions']);

    // Legacy search endpoint (backward compatibility)
    Route::get('/search/legacy', [SearchController::class, 'search']);

    // ======================================================================
    // Rankings Routes
    // ======================================================================
    Route::prefix('rankings')->group(function () {
        Route::get('/top', [RankingsController::class, 'top']);
        Route::get('/reading', [RankingsController::class, 'reading']);
        Route::get('/trending', [RankingsController::class, 'trending']);
    });

    // Legacy routes (backward compatibility)
    Route::get('/latest', [SeriesController::class, 'latest']);
    Route::get('/popular', [SeriesController::class, 'popular']);
    Route::get('/trending', [SeriesController::class, 'trending']);
});

// ==========================================================================
// Authentication Routes
// ==========================================================================
Route::prefix('v1/auth')->middleware('prevent-api-cache')->group(function () {
    Route::post('/login', [\App\Http\Controllers\Api\AuthController::class, 'login']);
    Route::post('/register', [\App\Http\Controllers\Api\AuthController::class, 'register']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [\App\Http\Controllers\Api\AuthController::class, 'logout']);
        Route::get('/me', [\App\Http\Controllers\Api\AuthController::class, 'me']);
    });
});

// ==========================================================================
// Authenticated User Routes
// ==========================================================================
Route::prefix('v1')->middleware(['auth:sanctum', 'prevent-api-cache'])->group(function () {

    // ======================================================================
    // Favorites
    // ======================================================================
    Route::get('/user/favorites', [FavoriteController::class, 'index']);
    Route::post('/manga/{id}/favorite', [FavoriteController::class, 'store']);
    Route::delete('/manga/{id}/favorite', [FavoriteController::class, 'destroy']);
    Route::post('/manga/{id}/favorite/toggle', [FavoriteController::class, 'toggle']);
    Route::get('/manga/{id}/favorite/check', [FavoriteController::class, 'check']);

    // ======================================================================
    // Ratings
    // ======================================================================
    Route::get('/user/ratings', [RatingController::class, 'index']);
    Route::get('/manga/{id}/rate', [RatingController::class, 'show']);
    Route::post('/manga/{id}/rate', [RatingController::class, 'store']);
    Route::delete('/manga/{id}/rate', [RatingController::class, 'destroy']);

    // ======================================================================
    // Reading Progress
    // ======================================================================
    Route::get('/reading/continue', [ReadingProgressController::class, 'continueReading']);
    Route::get('/reading/history', [ReadingProgressController::class, 'history']);
    Route::get('/manga/{id}/progress', [ReadingProgressController::class, 'getSeriesProgress']);
    Route::post('/reading/progress', [ReadingProgressController::class, 'update']);
    Route::delete('/manga/{id}/progress', [ReadingProgressController::class, 'clearSeriesProgress']);

    // Reading Sessions
    Route::post('/reading/session/start', [ReadingProgressController::class, 'startSession']);
    Route::post('/reading/session/end', [ReadingProgressController::class, 'endSession']);

    // Mark chapter complete
    Route::post('/chapters/{id}/complete', [ReadingProgressController::class, 'markChapterComplete']);
});

// ==========================================================================
// Admin API Routes (Authentication + Admin Role Required)
// ==========================================================================
Route::prefix('v1/admin')->middleware(['auth:sanctum', 'admin', 'prevent-api-cache'])->group(function () {

    // ======================================================================
    // Series Management
    // ======================================================================
    Route::get('/series', [AdminSeriesController::class, 'index']);
    Route::post('/series', [AdminSeriesController::class, 'store']);
    Route::post('/series/bulk-import', [AdminSeriesController::class, 'bulkImport']);
    Route::get('/series/bulk-import/{batchId}', [AdminSeriesController::class, 'bulkImportStatus'])
        ->whereNumber('batchId');
    Route::get('/series/{id}', [AdminSeriesController::class, 'show']);
    Route::put('/series/{id}', [AdminSeriesController::class, 'update']);
    Route::delete('/series/{id}', [AdminSeriesController::class, 'destroy']);

    // ======================================================================
    // Chapter Management
    // ======================================================================
    Route::get('/chapters', [AdminChapterController::class, 'index']);
    Route::post('/chapters', [AdminChapterController::class, 'store']);
    Route::post('/chapters/bulk-import', [AdminChapterController::class, 'bulkImport']);
    Route::get('/chapters/bulk-import/{batchId}', [AdminChapterController::class, 'bulkImportStatus'])
        ->whereNumber('batchId');
    Route::get('/chapters/{id}', [AdminChapterController::class, 'show']);
    Route::put('/chapters/{id}', [AdminChapterController::class, 'update']);
    Route::delete('/chapters/{id}', [AdminChapterController::class, 'destroy']);

    // ======================================================================
    // Category Management
    // ======================================================================
    Route::get('/categories', [AdminCategoryController::class, 'index']);
    Route::post('/categories', [AdminCategoryController::class, 'store']);
    Route::get('/categories/{id}', [AdminCategoryController::class, 'show']);
    Route::put('/categories/{id}', [AdminCategoryController::class, 'update']);
    Route::delete('/categories/{id}', [AdminCategoryController::class, 'destroy']);

    // ======================================================================
    // Tag Management
    // ======================================================================
    Route::get('/tags', [AdminTagController::class, 'index']);
    Route::post('/tags', [AdminTagController::class, 'store']);
    Route::get('/tags/{id}', [AdminTagController::class, 'show']);
    Route::put('/tags/{id}', [AdminTagController::class, 'update']);
    Route::delete('/tags/{id}', [AdminTagController::class, 'destroy']);

    // ======================================================================
    // Author Management
    // ======================================================================
    Route::get('/authors', [AdminAuthorController::class, 'index']);
    Route::post('/authors/bulk-import', [AdminAuthorController::class, 'bulkImport']);
    Route::post('/authors', [AdminAuthorController::class, 'store']);
    Route::get('/authors/{id}', [AdminAuthorController::class, 'show']);
    Route::put('/authors/{id}', [AdminAuthorController::class, 'update']);
    Route::delete('/authors/{id}', [AdminAuthorController::class, 'destroy']);

    // ======================================================================
    // Manga Type Management
    // ======================================================================
    Route::get('/manga-types', [AdminMangaTypeController::class, 'index']);
    Route::post('/manga-types', [AdminMangaTypeController::class, 'store']);
    Route::get('/manga-types/{id}', [AdminMangaTypeController::class, 'show']);
    Route::put('/manga-types/{id}', [AdminMangaTypeController::class, 'update']);
    Route::delete('/manga-types/{id}', [AdminMangaTypeController::class, 'destroy']);

    // ======================================================================
    // Theme Management
    // ======================================================================
    Route::get('/themes', [AdminThemeController::class, 'index']);

    // ======================================================================
    // Branding Management (logo, hero background, hero image)
    // ======================================================================
    Route::get('/branding', [AdminBrandingController::class, 'show']);
    Route::put('/branding', [AdminBrandingController::class, 'update']);
    Route::post('/branding', [AdminBrandingController::class, 'update']);
    Route::post('/themes', [AdminThemeController::class, 'store']);
    Route::get('/themes/{id}', [AdminThemeController::class, 'show']);
    Route::put('/themes/{id}', [AdminThemeController::class, 'update']);
    Route::delete('/themes/{id}', [AdminThemeController::class, 'destroy']);
    Route::post('/themes/{id}/activate', [AdminThemeController::class, 'activate']);

    // ======================================================================
    // Image Upload & existing images for reuse
    // ======================================================================
    Route::get('/existing-images', [AdminUploadController::class, 'existingImages']);
    Route::post('/upload', [AdminUploadController::class, 'upload']);
    Route::post('/upload/bulk', [AdminUploadController::class, 'bulkUpload']);
});
