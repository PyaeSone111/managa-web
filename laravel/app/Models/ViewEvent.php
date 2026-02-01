<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\MassPrunable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ViewEvent extends Model
{
    use HasFactory, MassPrunable;

    /**
     * Get the prunable model query.
     */
    public function prunable()
    {
        $days = config('manga.retention.view_events', 180);
        return static::where('viewed_at', '<', now()->subDays($days));
    }

    protected $fillable = [
        'series_id',
        'chapter_id',
        'user_id',
        'session_id',
        'ip_hash',
        'user_agent',
        'country_code',
        'viewed_at',
    ];

    protected $casts = [
        'viewed_at' => 'datetime',
    ];

    public $timestamps = false;

    /**
     * Get the series for this view event.
     */
    public function series(): BelongsTo
    {
        return $this->belongsTo(Series::class);
    }

    /**
     * Get the chapter for this view event.
     */
    public function chapter(): BelongsTo
    {
        return $this->belongsTo(Chapter::class);
    }

    /**
     * Get the user for this view event.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Create a view event from a request.
     */
    public static function createFromRequest(
        int $seriesId,
        ?int $chapterId = null,
        ?int $userId = null,
        ?string $sessionId = null
    ): self {
        return self::create([
            'series_id' => $seriesId,
            'chapter_id' => $chapterId,
            'user_id' => $userId,
            'session_id' => $sessionId,
            'ip_hash' => hash('sha256', request()->ip()),
            'user_agent' => substr(request()->userAgent(), 0, 500),
            'viewed_at' => now(),
        ]);
    }
}
