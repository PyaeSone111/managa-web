<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds a composite index on (series_id, is_published, published_at DESC) so MySQL can
 * resolve the correlated subquery in scopeOrderByLatestChapter in a single index scan
 * instead of a full table scan per series row.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('chapters', function (Blueprint $table) {
            // Covers: WHERE series_id = ? AND is_published = 1 ORDER BY published_at DESC
            $table->index(['series_id', 'is_published', 'published_at'], 'idx_chapters_series_published_at');
        });
    }

    public function down(): void
    {
        Schema::table('chapters', function (Blueprint $table) {
            $table->dropIndex('idx_chapters_series_published_at');
        });
    }
};
