<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('chapters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('series_id')->constrained()->onDelete('cascade');
            $table->decimal('chapter_number', 8, 2);
            $table->string('title')->nullable();
            $table->string('slug')->unique();
            $table->unsignedInteger('page_count')->default(0);
            $table->unsignedBigInteger('views')->default(0);
            $table->boolean('is_published')->default(true);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            // Indexes
            $table->index('series_id');
            $table->index('chapter_number');
            $table->index('is_published');
            $table->unique(['series_id', 'chapter_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chapters');
    }
};

