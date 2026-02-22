<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Chapter extends Model
{
    use HasFactory;

    protected $fillable = [
        'series_id',
        'chapter_number',
        'title',
        'slug',
        'page_count',
        'views',
        'is_published',
        'published_at',
    ];

    protected $casts = [
        'chapter_number' => 'decimal:2',
        'page_count' => 'integer',
        'views' => 'integer',
        'is_published' => 'boolean',
        'published_at' => 'datetime',
    ];

    /**
     * Get the series that owns the chapter.
     */
    public function series(): BelongsTo
    {
        return $this->belongsTo(Series::class);
    }

    /**
     * Get the pages for the chapter.
     */
    public function pages(): HasMany
    {
        return $this->hasMany(ChapterPage::class)->orderBy('page_number');
    }

    /**
     * Increment the view counter via Eloquent (no raw DB facade needed in controllers).
     */
    public function incrementViews(): void
    {
        $this->increment('views');
    }
}

