<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_reading_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('series_id')->constrained('series')->onDelete('cascade');
            $table->foreignId('chapter_id')->constrained('chapters')->onDelete('cascade');
            $table->string('session_token', 100)->nullable(); // For anonymous users
            $table->timestamp('started_at')->useCurrent();
            $table->timestamp('ended_at')->nullable();
            $table->integer('duration_seconds')->nullable();
            $table->integer('pages_read')->default(0);

            $table->index(['series_id', 'started_at']);
            $table->index(['user_id', 'started_at']);
            $table->index('session_token');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_reading_sessions');
    }
};
