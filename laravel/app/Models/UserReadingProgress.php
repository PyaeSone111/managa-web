<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserReadingProgress extends Model
{
    use HasFactory;

    protected $table = 'user_reading_progress';

    protected $fillable = [
        'user_id',
        'series_id',
        'chapter_id',
        'last_page',
        'completed',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'last_page' => 'integer',
        'completed' => 'boolean',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    /**
     * Get the user that owns this progress.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the series for this progress.
     */
    public function series(): BelongsTo
    {
        return $this->belongsTo(Series::class);
    }

    /**
     * Get the chapter for this progress.
     */
    public function chapter(): BelongsTo
    {
        return $this->belongsTo(Chapter::class);
    }

    /**
     * Mark as completed.
     */
    public function markCompleted(): void
    {
        $this->update([
            'completed' => true,
            'completed_at' => now(),
        ]);
    }
}
