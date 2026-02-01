<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChapterPage extends Model
{
    use HasFactory;

    protected $fillable = [
        'chapter_id',
        'page_number',
        'image_url',
        'original_filename',
        'width',
        'height',
        'file_size',
    ];

    protected $casts = [
        'page_number' => 'integer',
        'width' => 'integer',
        'height' => 'integer',
        'file_size' => 'integer',
    ];

    /**
     * Get the chapter that owns the page.
     */
    public function chapter(): BelongsTo
    {
        return $this->belongsTo(Chapter::class);
    }
}

