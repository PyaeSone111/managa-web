<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class Series extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'thumbnail_url',
        'cover_url',
        'type',
        'status',
        'author',
        'artist',
        'year',
        'release_date',
        'rating',
        'rating_count',
        'total_views',
        'total_favorites',
        'total_chapters',
        'is_featured',
        'is_active',
        'last_chapter_at',
    ];

    protected $casts = [
        'rating' => 'decimal:2',
        'total_views' => 'integer',
        'total_favorites' => 'integer',
        'total_chapters' => 'integer',
        'rating_count' => 'integer',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
        'year' => 'integer',
        'release_date' => 'date',
        'last_chapter_at' => 'datetime',
    ];

    /**
     * Get the chapters for the series.
     */
    public function chapters(): HasMany
    {
        return $this->hasMany(Chapter::class);
    }

    /**
     * Get the categories for the series.
     */
    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'series_category');
    }

    /**
     * Get the tags for the series.
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'series_tag');
    }

    /**
     * Get the authors for the series (many-to-many).
     */
    public function authors(): BelongsToMany
    {
        return $this->belongsToMany(Author::class, 'series_author')
            ->withPivot('role');
    }

    /**
     * Get the manga types for the series (many-to-many).
     */
    public function mangaTypes(): BelongsToMany
    {
        return $this->belongsToMany(MangaType::class, 'series_type');
    }

    /**
     * Get alternate names for the series.
     */
    public function altNames(): HasMany
    {
        return $this->hasMany(SeriesAltName::class);
    }

    /**
     * Get user favorites for this series.
     */
    public function favorites(): HasMany
    {
        return $this->hasMany(UserFavorite::class);
    }

    /**
     * Get user ratings for this series.
     */
    public function ratings(): HasMany
    {
        return $this->hasMany(UserRating::class);
    }

    /**
     * Get reading progress records.
     */
    public function readingProgress(): HasMany
    {
        return $this->hasMany(UserReadingProgress::class);
    }

    /**
     * Get the ranking for this series.
     */
    public function ranking(): HasOne
    {
        return $this->hasOne(SeriesRanking::class);
    }

    /**
     * Get daily stats for this series.
     */
    public function statsDaily(): HasMany
    {
        return $this->hasMany(SeriesStatsDaily::class);
    }

    /**
     * Check if a user has favorited this series.
     */
    public function isFavoritedBy(?User $user): bool
    {
        if (!$user) {
            return false;
        }
        return $this->favorites()->where('user_id', $user->id)->exists();
    }

    /**
     * Get user's rating for this series.
     */
    public function getUserRating(?User $user): ?int
    {
        if (!$user) {
            return null;
        }
        $rating = $this->ratings()->where('user_id', $user->id)->first();
        return $rating?->rating;
    }

    /**
     * Increment total_views via Eloquent (no raw DB facade needed in controllers).
     */
    public function incrementTotalViews(): void
    {
        $this->increment('total_views');
    }

    // ============ SCOPES ============

    /**
     * Scope to only active series.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to featured series.
     */
    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true)->active();
    }

    /**
     * Scope for status filter.
     */
    public function scopeStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for recently updated (by last chapter).
     */
    public function scopeRecentlyUpdated(Builder $query): Builder
    {
        return $query->active()
            ->whereNotNull('last_chapter_at')
            ->orderBy('last_chapter_at', 'desc');
    }

    /**
     * Scope for recently added.
     */
    public function scopeRecentlyAdded(Builder $query): Builder
    {
        return $query->active()
            ->orderBy('created_at', 'desc');
    }

    /**
     * Scope for popular (by views).
     */
    public function scopePopular(Builder $query): Builder
    {
        return $query->active()
            ->orderBy('total_views', 'desc');
    }

    /**
     * Scope for top rated.
     */
    public function scopeTopRated(Builder $query): Builder
    {
        return $query->active()
            ->orderBy('rating', 'desc')
            ->orderBy('rating_count', 'desc');
    }

    /**
     * Scope: order by latest published chapter.
     * Uses last_chapter_at column (fast index scan) when populated by the ChapterObserver.
     * Falls back to a correlated subquery only for rows where last_chapter_at is still NULL.
     * Requires series to have at least one published chapter.
     */
    public function scopeOrderByLatestChapter(Builder $query): Builder
    {
        return $query
            ->whereHas('chapters', fn ($q) => $q->where('is_published', true))
            ->orderByRaw(
                'COALESCE(last_chapter_at,
                    (SELECT MAX(c.published_at) FROM chapters c
                     WHERE c.series_id = series.id AND c.is_published = 1)
                ) DESC'
            );
    }

    /**
     * Scope: compute composite top-score and order by it (MySQL; fallback when SeriesRanking is empty).
     * Score = views*0.3 + favorites*25 + rating*ratingCount*2.5 + recency bonus.
     */
    public function scopeOrderByTopScore(Builder $query): Builder
    {
        return $query->selectRaw('series.*, (
            COALESCE(total_views, 0) * 0.3 +
            COALESCE(total_favorites, 0) * 100 * 0.25 +
            COALESCE(rating, 0) * COALESCE(rating_count, 0) * 10 * 0.25 +
            CASE
                WHEN last_chapter_at > NOW() - INTERVAL 7 DAY  THEN 1000
                WHEN last_chapter_at > NOW() - INTERVAL 30 DAY THEN 500
                ELSE 0
            END * 0.2
        ) AS top_score')
        ->orderByRaw('top_score DESC');
    }

    /**
     * Scope for category filter.
     */
    public function scopeInCategory(Builder $query, $categoryIds): Builder
    {
        if (is_array($categoryIds)) {
            return $query->whereHas('categories', function ($q) use ($categoryIds) {
                $q->whereIn('categories.id', $categoryIds);
            });
        }
        return $query->whereHas('categories', function ($q) use ($categoryIds) {
            $q->where('categories.id', $categoryIds);
        });
    }

    /**
     * Scope for type filter.
     */
    public function scopeOfType(Builder $query, $typeIds): Builder
    {
        if (is_array($typeIds)) {
            return $query->whereHas('mangaTypes', function ($q) use ($typeIds) {
                $q->whereIn('manga_types.id', $typeIds);
            });
        }
        return $query->whereHas('mangaTypes', function ($q) use ($typeIds) {
            $q->where('manga_types.id', $typeIds);
        });
    }

    /**
     * Scope for author filter.
     */
    public function scopeByAuthor(Builder $query, $authorIds): Builder
    {
        if (is_array($authorIds)) {
            return $query->whereHas('authors', function ($q) use ($authorIds) {
                $q->whereIn('authors.id', $authorIds);
            });
        }
        return $query->whereHas('authors', function ($q) use ($authorIds) {
            $q->where('authors.id', $authorIds);
        });
    }

    /**
     * Scope for release date range.
     */
    public function scopeReleasedBetween(Builder $query, ?string $from, ?string $to): Builder
    {
        if ($from) {
            $query->where('release_date', '>=', $from);
        }
        if ($to) {
            $query->where('release_date', '<=', $to);
        }
        return $query;
    }

    /**
     * Scope for text search (PostgreSQL optimized).
     */
    public function scopeSearch(Builder $query, string $term): Builder
    {
        $driver = DB::getDriverName();

        if ($driver === 'pgsql') {
            // PostgreSQL: Use full-text search + trigram
            return $query->where(function ($q) use ($term) {
                $q->whereRaw("search_vector @@ websearch_to_tsquery('english', ?)", [$term])
                    ->orWhereRaw("title % ?", [$term])
                    ->orWhereHas('altNames', function ($altQ) use ($term) {
                        $altQ->whereRaw("name % ?", [$term]);
                    });
            });
        }

        // Fallback for MySQL/SQLite: LIKE search
        return $query->where(function ($q) use ($term) {
            $q->where('title', 'LIKE', "%{$term}%")
                ->orWhere('description', 'LIKE', "%{$term}%")
                ->orWhereHas('altNames', function ($altQ) use ($term) {
                    $altQ->where('name', 'LIKE', "%{$term}%");
                });
        });
    }

    // ============ STATIC METHODS ============

    /**
     * Advanced search with all filters.
     */
    public static function advancedSearch(array $filters): Builder
    {
        $query = self::query()->active()->with(['categories', 'mangaTypes', 'authors']);

        // Text search
        if (!empty($filters['q'])) {
            $query->search($filters['q']);
        }

        // Status filter
        if (!empty($filters['status'])) {
            $query->status($filters['status']);
        }

        // Category filter
        if (!empty($filters['categories'])) {
            $query->inCategory($filters['categories']);
        }

        // Type filter
        if (!empty($filters['types'])) {
            $query->ofType($filters['types']);
        }

        // Author filter
        if (!empty($filters['authors'])) {
            $query->byAuthor($filters['authors']);
        }

        // Release date range
        if (!empty($filters['release_from']) || !empty($filters['release_to'])) {
            $query->releasedBetween(
                $filters['release_from'] ?? null,
                $filters['release_to'] ?? null
            );
        }

        // Sorting
        $sort = $filters['sort'] ?? 'relevance';
        switch ($sort) {
            case 'latest':
                $query->orderByDesc('last_chapter_at')->orderByDesc('updated_at');
                break;
            case 'newest':
                $query->orderBy('created_at', 'desc');
                break;
            case 'oldest':
                $query->orderBy('created_at', 'asc');
                break;
            case 'rating':
                $query->orderBy('rating', 'desc')->orderBy('rating_count', 'desc');
                break;
            case 'views':
                $query->orderBy('total_views', 'desc');
                break;
            case 'favorites':
                $query->orderBy('total_favorites', 'desc');
                break;
            case 'title_desc':
                $query->orderBy('title', 'desc');
                break;
            case 'title_asc':
            case 'title':
                $query->orderBy('title', 'asc');
                break;
            default:
                // relevance - use default ordering from search
                $query->orderBy('total_views', 'desc');
        }

        return $query;
    }
}
