<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations - add performance indexes for API queries.
     */
    public function up(): void
    {
        // Chapters indexes for recent updates ordering
        Schema::table('chapters', function (Blueprint $table) {
            $table->index('published_at', 'idx_chapters_published_at');
            $table->index(['series_id', 'published_at', 'is_published'], 'idx_chapters_series_published');
        });

        // User favorites for trending calculations
        Schema::table('user_favorites', function (Blueprint $table) {
            $table->index(['series_id', 'created_at'], 'idx_user_favorites_series_created');
        });

        // User ratings for rating lookups
        Schema::table('user_ratings', function (Blueprint $table) {
            $table->index(['series_id', 'rating'], 'idx_user_ratings_series_rating');
        });

        // Reading progress for reading rankings
        Schema::table('user_reading_progress', function (Blueprint $table) {
            $table->index(['series_id', 'updated_at'], 'idx_user_reading_progress_series_updated');
        });

        // Junction table reverse lookups (for filtering by category/tag)
        Schema::table('series_category', function (Blueprint $table) {
            $table->index('category_id', 'idx_series_category_category');
        });

        Schema::table('series_tag', function (Blueprint $table) {
            $table->index('tag_id', 'idx_series_tag_tag');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chapters', function (Blueprint $table) {
            $table->dropIndex('idx_chapters_published_at');
            $table->dropIndex('idx_chapters_series_published');
        });

        Schema::table('user_favorites', function (Blueprint $table) {
            $table->dropIndex('idx_user_favorites_series_created');
        });

        Schema::table('user_ratings', function (Blueprint $table) {
            $table->dropIndex('idx_user_ratings_series_rating');
        });

        Schema::table('user_reading_progress', function (Blueprint $table) {
            $table->dropIndex('idx_user_reading_progress_series_updated');
        });

        Schema::table('series_category', function (Blueprint $table) {
            $table->dropIndex('idx_series_category_category');
        });

        Schema::table('series_tag', function (Blueprint $table) {
            $table->dropIndex('idx_series_tag_tag');
        });
    }
};
