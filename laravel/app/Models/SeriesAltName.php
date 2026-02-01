<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SeriesAltName extends Model
{
    use HasFactory;

    protected $fillable = [
        'series_id',
        'name',
        'language',
    ];

    /**
     * Get the series that owns this alternate name.
     */
    public function series(): BelongsTo
    {
        return $this->belongsTo(Series::class);
    }
}
