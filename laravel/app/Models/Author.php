<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

class Author extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'bio',
        'image_url',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($author) {
            if (empty($author->slug)) {
                $author->slug = Str::slug($author->name);
            }
        });
    }

    /**
     * Get the series for this author.
     */
    public function series(): BelongsToMany
    {
        return $this->belongsToMany(Series::class, 'series_author')
            ->withPivot('role');
    }

    /**
     * Scope for searching by name.
     */
    public function scopeSearch($query, string $term)
    {
        return $query->where('name', 'ILIKE', "%{$term}%");
    }
}
