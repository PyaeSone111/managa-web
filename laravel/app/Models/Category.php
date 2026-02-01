<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'icon',
    ];

    /**
     * Get the series for the category.
     */
    public function series(): BelongsToMany
    {
        return $this->belongsToMany(Series::class, 'series_category');
    }
}

