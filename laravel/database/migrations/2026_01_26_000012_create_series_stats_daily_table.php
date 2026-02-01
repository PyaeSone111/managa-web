<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('series_stats_daily', function (Blueprint $table) {
            $table->id();
            $table->foreignId('series_id')->constrained('series')->onDelete('cascade');
            $table->date('stat_date');
            $table->integer('views')->default(0);
            $table->integer('unique_viewers')->default(0);
            $table->integer('favorites_added')->default(0);
            $table->integer('favorites_removed')->default(0);
            $table->integer('ratings_count')->default(0);
            $table->integer('ratings_sum')->default(0);
            $table->integer('chapters_read')->default(0);
            $table->bigInteger('reading_time_seconds')->default(0);
            $table->timestamps();

            $table->unique(['series_id', 'stat_date']);
            $table->index('stat_date');
            $table->index(['series_id', 'stat_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('series_stats_daily');
    }
};
