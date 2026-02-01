<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('series_id')->constrained('series')->onDelete('cascade');
            $table->smallInteger('rating')->unsigned(); // 1-10
            $table->timestamps();

            $table->unique(['user_id', 'series_id']);
            $table->index('series_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_ratings');
    }
};
