<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('series_author', function (Blueprint $table) {
            $table->foreignId('series_id')->constrained('series')->onDelete('cascade');
            $table->foreignId('author_id')->constrained('authors')->onDelete('cascade');
            $table->string('role', 50)->default('author'); // 'author', 'artist', 'both'

            $table->primary(['series_id', 'author_id']);
            $table->index('author_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('series_author');
    }
};
