<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SeriesRanking extends Model
{
    use HasFactory;

    protected $fillable = [
        'series_id',
        'views_7d',
        'viewers_7d',
        'favorites_7d',
        'chapters_read_7d',
        'reading_time_7d',
        'top_score',
        'reading_score',
        'trending_score',
        'top_rank',
        'reading_rank',
        'trending_rank',
        'computed_at',
    ];

    protected $casts = [
        'views_7d' => 'integer',
        'viewers_7d' => 'integer',
        'favorites_7d' => 'integer',
        'chapters_read_7d' => 'integer',
        'reading_time_7d' => 'integer',
        'top_score' => 'decimal:4',
        'reading_score' => 'decimal:4',
        'trending_score' => 'decimal:4',
        'top_rank' => 'integer',
        'reading_rank' => 'integer',
        'trending_rank' => 'integer',
        'computed_at' => 'datetime',
    ];

    /**
     * Get the series for this ranking.
     */
    public function series(): BelongsTo
    {
        return $this->belongsTo(Series::class);
    }

    /**
     * Get top manga by score.
     */
    public static function getTopManga(int $limit = 20, int $offset = 0)
    {
        return self::with(['series' => function ($query) {
            $query->where('is_active', true)
                ->with(['categories', 'mangaTypes', 'authors']);
        }])
            ->whereHas('series', fn($q) => $q->where('is_active', true))
            ->orderBy('top_score', 'desc')
            ->offset($offset)
            ->limit($limit)
            ->get();
    }

    /**
     * Get top reading manga.
     */
    public static function getTopReading(int $limit = 20, int $offset = 0)
    {
        return self::with(['series' => function ($query) {
            $query->where('is_active', true)
                ->with(['categories', 'mangaTypes', 'authors']);
        }])
            ->whereHas('series', fn($q) => $q->where('is_active', true))
            ->orderBy('reading_score', 'desc')
            ->offset($offset)
            ->limit($limit)
            ->get();
    }

    /**
     * Get trending manga.
     */
    public static function getTrending(int $limit = 20, int $offset = 0)
    {
        return self::with(['series' => function ($query) {
            $query->where('is_active', true)
                ->with(['categories', 'mangaTypes', 'authors']);
        }])
            ->whereHas('series', fn($q) => $q->where('is_active', true))
            ->orderBy('trending_score', 'desc')
            ->offset($offset)
            ->limit($limit)
            ->get();
    }
}
