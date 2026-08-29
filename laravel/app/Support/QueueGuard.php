<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;

class QueueGuard
{
    public static function ensureAsyncQueue(): ?JsonResponse
    {
        if (config('queue.default') === 'sync') {
            return response()->json([
                'success' => false,
                'message' => 'Bulk import requires a background queue. Set QUEUE_CONNECTION=database in .env, run php artisan migrate, then start the worker with: php artisan queue:work database --timeout=600 --tries=1',
            ], 503);
        }

        return null;
    }
}
