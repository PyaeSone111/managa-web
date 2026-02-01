<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('series', function (Blueprint $table) {
            // Add new columns for enhanced functionality
            $table->date('release_date')->nullable()->after('year');
            $table->bigInteger('total_favorites')->default(0)->after('total_views');
            $table->integer('rating_count')->default(0)->after('rating');
            $table->timestamp('last_chapter_at')->nullable()->after('updated_at');

            // Add index for last_chapter_at (recently updated queries)
            $table->index('last_chapter_at');
            $table->index('created_at');
            $table->index(['is_active', 'last_chapter_at']);
            $table->index(['is_active', 'total_views']);
            $table->index(['is_active', 'rating']);
        });

        // Add search vector column for PostgreSQL (if using PostgreSQL)
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE series ADD COLUMN IF NOT EXISTS search_vector tsvector');
            DB::statement('CREATE INDEX IF NOT EXISTS idx_series_search ON series USING GIN(search_vector)');
        }
    }

    public function down(): void
    {
        Schema::table('series', function (Blueprint $table) {
            $table->dropIndex(['last_chapter_at']);
            $table->dropIndex(['created_at']);
            $table->dropIndex(['is_active', 'last_chapter_at']);
            $table->dropIndex(['is_active', 'total_views']);
            $table->dropIndex(['is_active', 'rating']);

            $table->dropColumn([
                'release_date',
                'total_favorites',
                'rating_count',
                'last_chapter_at',
            ]);
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('DROP INDEX IF EXISTS idx_series_search');
            DB::statement('ALTER TABLE series DROP COLUMN IF EXISTS search_vector');
        }
    }
};
