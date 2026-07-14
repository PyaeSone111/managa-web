<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chapter;
use App\Models\Series;
use App\Models\UserReadingProgress;
use App\Models\UserReadingSession;
use App\Models\ViewEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReadingProgressController extends Controller
{
    /**
     * Get continue-reading list (latest chapter per series).
     *
     * GET /api/v1/reading/continue
     */
    public function continueReading(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'limit' => 'nullable|integer|min:1|max:50',
        ]);

        $limit = min($request->input('limit', 20), 50);

        $progress = UserReadingProgress::where('user_id', $user->id)
            ->with(['series', 'chapter'])
            ->orderByDesc('updated_at')
            ->get()
            ->unique('series_id')
            ->take($limit)
            ->values();

        return response()->json([
            'data' => $progress->map(fn (UserReadingProgress $p) => [
                'id' => $p->id,
                'series_id' => $p->series_id,
                'chapter_id' => $p->chapter_id,
                'last_page' => $p->last_page,
                'completed' => $p->completed,
                'updated_at' => $p->updated_at,
                'series' => $p->series ? [
                    'id' => $p->series->id,
                    'title' => $p->series->title,
                    'slug' => $p->series->slug,
                    'cover_url' => $p->series->cover_url,
                    'thumbnail_url' => $p->series->thumbnail_url,
                ] : null,
                'chapter' => $p->chapter ? [
                    'id' => $p->chapter->id,
                    'chapter_number' => $p->chapter->chapter_number,
                    'title' => $p->chapter->title,
                    'page_count' => $p->chapter->page_count,
                ] : null,
            ]),
        ]);
    }

    /**
     * Get user's reading history.
     *
     * GET /api/v1/reading/history
     */
    public function history(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);

        $perPage = min($request->input('per_page', 20), 50);

        $progress = UserReadingProgress::where('user_id', $user->id)
            ->with(['series', 'chapter'])
            ->orderBy('updated_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'data' => $progress->items(),
            'meta' => [
                'current_page' => $progress->currentPage(),
                'per_page' => $progress->perPage(),
                'total' => $progress->total(),
                'total_pages' => $progress->lastPage(),
            ],
        ]);
    }

    /**
     * Get progress for a specific series.
     *
     * GET /api/v1/manga/{id}/progress
     */
    public function getSeriesProgress(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        Series::findOrFail($id);

        $progress = UserReadingProgress::where('user_id', $user->id)
            ->where('series_id', $id)
            ->with('chapter')
            ->orderBy('updated_at', 'desc')
            ->get();

        // Get the most recently read chapter
        $lastRead = $progress->first();

        // Count completed chapters
        $completedCount = $progress->where('completed', true)->count();

        return response()->json([
            'data' => [
                'last_read_chapter' => $lastRead ? [
                    'chapter_id' => $lastRead->chapter_id,
                    'chapter_number' => $lastRead->chapter?->chapter_number,
                    'last_page' => $lastRead->last_page,
                    'completed' => $lastRead->completed,
                    'read_at' => $lastRead->updated_at,
                ] : null,
                'completed_chapters' => $completedCount,
                'chapters_progress' => $progress->map(fn($p) => [
                    'chapter_id' => $p->chapter_id,
                    'chapter_number' => $p->chapter?->chapter_number,
                    'last_page' => $p->last_page,
                    'completed' => $p->completed,
                ]),
            ],
        ]);
    }

    /**
     * Update reading progress.
     *
     * POST /api/v1/reading/progress
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'series_id' => 'required|integer|exists:series,id',
            'chapter_id' => 'required|integer|exists:chapters,id',
            'last_page' => 'required|integer|min:1',
            'completed' => 'nullable|boolean',
        ]);

        $chapter = Chapter::findOrFail($request->chapter_id);

        // Verify chapter belongs to series
        if ($chapter->series_id !== $request->series_id) {
            return response()->json([
                'message' => 'Chapter does not belong to specified series',
            ], 422);
        }

        $progress = $user->updateReadingProgress(
            $request->series_id,
            $request->chapter_id,
            $request->last_page,
            $request->input('completed', false)
        );

        return response()->json([
            'message' => 'Progress updated',
            'data' => $progress,
        ]);
    }

    /**
     * Start a reading session.
     *
     * POST /api/v1/reading/session/start
     */
    public function startSession(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'series_id' => 'required|integer|exists:series,id',
            'chapter_id' => 'required|integer|exists:chapters,id',
        ]);

        $chapter = Chapter::findOrFail($request->chapter_id);

        // Verify chapter belongs to series
        if ($chapter->series_id !== $request->series_id) {
            return response()->json([
                'message' => 'Chapter does not belong to specified series',
            ], 422);
        }

        // Create reading session
        $session = UserReadingSession::create([
            'user_id' => $user?->id,
            'series_id' => $request->series_id,
            'chapter_id' => $request->chapter_id,
            'session_token' => $user ? null : bin2hex(random_bytes(16)),
            'started_at' => now(),
        ]);

        // Record view event
        ViewEvent::createFromRequest(
            $request->series_id,
            $request->chapter_id,
            $user?->id,
            session()->getId()
        );

        // Increment chapter views
        $chapter->increment('views');

        return response()->json([
            'message' => 'Reading session started',
            'session_id' => $session->id,
            'session_token' => $session->session_token,
        ]);
    }

    /**
     * End a reading session.
     *
     * POST /api/v1/reading/session/end
     */
    public function endSession(Request $request): JsonResponse
    {
        $request->validate([
            'session_id' => 'required|integer|exists:user_reading_sessions,id',
            'pages_read' => 'nullable|integer|min:0',
        ]);

        $session = UserReadingSession::findOrFail($request->session_id);

        // Verify ownership (for logged-in users) or session token match
        $user = $request->user();
        if ($user && $session->user_id && $session->user_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $session->update([
            'ended_at' => now(),
            'duration_seconds' => $session->started_at->diffInSeconds(now()),
            'pages_read' => $request->input('pages_read', 0),
        ]);

        return response()->json([
            'message' => 'Reading session ended',
            'duration_seconds' => $session->duration_seconds,
        ]);
    }

    /**
     * Mark chapter as completed.
     *
     * POST /api/v1/chapters/{id}/complete
     */
    public function markChapterComplete(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $chapter = Chapter::findOrFail($id);

        $existing = UserReadingProgress::where('user_id', $user->id)
            ->where('chapter_id', $id)
            ->first();

        $progress = UserReadingProgress::updateOrCreate(
            [
                'user_id' => $user->id,
                'chapter_id' => $id,
            ],
            [
                'series_id' => $chapter->series_id,
                'last_page' => $chapter->page_count,
                'completed' => true,
                'started_at' => $existing?->started_at ?? now(),
                'completed_at' => now(),
            ]
        );

        return response()->json([
            'message' => 'Chapter marked as completed',
            'data' => $progress,
        ]);
    }

    /**
     * Clear reading history for a series.
     *
     * DELETE /api/v1/manga/{id}/progress
     */
    public function clearSeriesProgress(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $deleted = UserReadingProgress::where('user_id', $user->id)
            ->where('series_id', $id)
            ->delete();

        return response()->json([
            'message' => "Cleared {$deleted} reading progress records",
        ]);
    }
}
