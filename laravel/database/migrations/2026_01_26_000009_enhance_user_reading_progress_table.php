<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_reading_progress', function (Blueprint $table) {
            // Add series_id for easier querying
            $table->foreignId('series_id')->nullable()->after('user_id');
            $table->timestamp('started_at')->nullable()->after('completed');
            $table->timestamp('completed_at')->nullable()->after('started_at');

            $table->index(['user_id', 'updated_at']);
            $table->index(['series_id', 'user_id']);
        });

        // Backfill series_id from chapters
        DB::statement('
            UPDATE user_reading_progress urp
            SET series_id = (
                SELECT series_id FROM chapters c WHERE c.id = urp.chapter_id
            )
            WHERE series_id IS NULL
        ');

        // Add foreign key constraint after backfill
        Schema::table('user_reading_progress', function (Blueprint $table) {
            $table->foreign('series_id')->references('id')->on('series')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('user_reading_progress', function (Blueprint $table) {
            $table->dropForeign(['series_id']);
            $table->dropIndex(['user_id', 'updated_at']);
            $table->dropIndex(['series_id', 'user_id']);

            $table->dropColumn(['series_id', 'started_at', 'completed_at']);
        });
    }
};
