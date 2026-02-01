<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserReadingSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'series_id',
        'chapter_id',
        'session_token',
        'started_at',
        'ended_at',
        'duration_seconds',
        'pages_read',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
        'duration_seconds' => 'integer',
        'pages_read' => 'integer',
    ];

    public $timestamps = false;

    /**
     * Get the user for this reading session.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the series for this reading session.
     */
    public function series(): BelongsTo
    {
        return $this->belongsTo(Series::class);
    }

    /**
     * Get the chapter for this reading session.
     */
    public function chapter(): BelongsTo
    {
        return $this->belongsTo(Chapter::class);
    }

    /**
     * End the reading session.
     */
    public function end(): void
    {
        $this->ended_at = now();
        $this->duration_seconds = $this->started_at->diffInSeconds($this->ended_at);
        $this->save();
    }
}
