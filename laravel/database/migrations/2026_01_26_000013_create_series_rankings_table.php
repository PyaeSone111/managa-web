<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // This table stores pre-computed ranking scores, refreshed periodically
        Schema::create('series_rankings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('series_id')->constrained('series')->onDelete('cascade');

            // 7-day stats
            $table->integer('views_7d')->default(0);
            $table->integer('viewers_7d')->default(0);
            $table->integer('favorites_7d')->default(0);
            $table->integer('chapters_read_7d')->default(0);
            $table->bigInteger('reading_time_7d')->default(0);

            // Computed scores
            $table->decimal('top_score', 15, 4)->default(0);
            $table->decimal('reading_score', 15, 4)->default(0);
            $table->decimal('trending_score', 15, 4)->default(0);

            // Ranks (computed from scores)
            $table->integer('top_rank')->nullable();
            $table->integer('reading_rank')->nullable();
            $table->integer('trending_rank')->nullable();

            $table->timestamp('computed_at')->useCurrent();
            $table->timestamps();

            $table->unique('series_id');
            $table->index('top_score');
            $table->index('reading_score');
            $table->index('trending_score');
            $table->index('top_rank');
            $table->index('reading_rank');
            $table->index('trending_rank');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('series_rankings');
    }
};
