<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserRating extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'series_id',
        'rating',
    ];

    protected $casts = [
        'rating' => 'integer',
    ];

    /**
     * Get the user that created the rating.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the series that was rated.
     */
    public function series(): BelongsTo
    {
        return $this->belongsTo(Series::class);
    }
}
