<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    /**
     * Check if user is admin.
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Check if user is moderator.
     */
    public function isModerator(): bool
    {
        return in_array($this->role, ['admin', 'moderator']);
    }

    /**
     * Get user's favorites.
     */
    public function favorites(): HasMany
    {
        return $this->hasMany(UserFavorite::class);
    }

    /**
     * Get user's favorited series.
     */
    public function favoriteSeries()
    {
        return $this->hasManyThrough(
            Series::class,
            UserFavorite::class,
            'user_id',
            'id',
            'id',
            'series_id'
        );
    }

    /**
     * Get user's ratings.
     */
    public function ratings(): HasMany
    {
        return $this->hasMany(UserRating::class);
    }

    /**
     * Get user's reading progress.
     */
    public function readingProgress(): HasMany
    {
        return $this->hasMany(UserReadingProgress::class);
    }

    /**
     * Get user's reading sessions.
     */
    public function readingSessions(): HasMany
    {
        return $this->hasMany(UserReadingSession::class);
    }

    /**
     * Check if user has favorited a series.
     */
    public function hasFavorited(int $seriesId): bool
    {
        return $this->favorites()->where('series_id', $seriesId)->exists();
    }

    /**
     * Toggle favorite for a series.
     */
    public function toggleFavorite(int $seriesId): bool
    {
        $favorite = $this->favorites()->where('series_id', $seriesId)->first();

        if ($favorite) {
            $favorite->delete();
            return false;
        }

        $this->favorites()->create(['series_id' => $seriesId]);
        return true;
    }

    /**
     * Rate a series.
     */
    public function rateSeries(int $seriesId, int $rating): UserRating
    {
        return $this->ratings()->updateOrCreate(
            ['series_id' => $seriesId],
            ['rating' => $rating]
        );
    }

    /**
     * Update reading progress.
     */
    public function updateReadingProgress(int $seriesId, int $chapterId, int $lastPage, bool $completed = false): UserReadingProgress
    {
        return $this->readingProgress()->updateOrCreate(
            ['chapter_id' => $chapterId],
            [
                'series_id' => $seriesId,
                'last_page' => $lastPage,
                'completed' => $completed,
                'completed_at' => $completed ? now() : null,
            ]
        );
    }

    /**
     * Get reading history (recently read).
     */
    public function getReadingHistory(int $limit = 20)
    {
        return $this->readingProgress()
            ->with(['series', 'chapter'])
            ->orderBy('updated_at', 'desc')
            ->limit($limit)
            ->get();
    }
}
