<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('series', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('thumbnail_url')->nullable();
            $table->string('cover_url')->nullable();
            $table->enum('type', ['manga', 'manhwa', 'manhua'])->default('manga');
            $table->enum('status', ['ongoing', 'completed', 'hiatus', 'cancelled'])->default('ongoing');
            $table->string('author')->nullable();
            $table->string('artist')->nullable();
            $table->year('year')->nullable();
            $table->decimal('rating', 3, 2)->default(0.00);
            $table->unsignedBigInteger('total_views')->default(0);
            $table->unsignedInteger('total_chapters')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Indexes
            $table->index('slug');
            $table->index('status');
            $table->index('type');
            $table->index('is_featured');
            $table->index('is_active');
            
            // Fulltext index only for MySQL/PostgreSQL (not SQLite)
            if (DB::getDriverName() !== 'sqlite') {
                $table->fullText(['title', 'description']);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('series');
    }
};

