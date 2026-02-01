<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SeriesStatsDaily extends Model
{
    use HasFactory;

    protected $table = 'series_stats_daily';

    protected $fillable = [
        'series_id',
        'stat_date',
        'views',
        'unique_viewers',
        'favorites_added',
        'favorites_removed',
        'ratings_count',
        'ratings_sum',
        'chapters_read',
        'reading_time_seconds',
    ];

    protected $casts = [
        'stat_date' => 'date',
        'views' => 'integer',
        'unique_viewers' => 'integer',
        'favorites_added' => 'integer',
        'favorites_removed' => 'integer',
        'ratings_count' => 'integer',
        'ratings_sum' => 'integer',
        'chapters_read' => 'integer',
        'reading_time_seconds' => 'integer',
    ];

    /**
     * Get the series for these stats.
     */
    public function series(): BelongsTo
    {
        return $this->belongsTo(Series::class);
    }

    /**
     * Get stats for a date range.
     */
    public static function getForDateRange(int $seriesId, string $startDate, string $endDate)
    {
        return self::where('series_id', $seriesId)
            ->whereBetween('stat_date', [$startDate, $endDate])
            ->orderBy('stat_date')
            ->get();
    }
}
