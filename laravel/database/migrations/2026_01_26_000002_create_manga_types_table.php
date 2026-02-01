<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('manga_types', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50)->unique();
            $table->string('slug', 50)->unique();
            $table->string('description', 255)->nullable();
            $table->timestamps();
        });

        // Seed default manga types
        DB::table('manga_types')->insert([
            ['name' => 'Manga', 'slug' => 'manga', 'description' => 'Japanese comics', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Manhwa', 'slug' => 'manhwa', 'description' => 'Korean comics', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Manhua', 'slug' => 'manhua', 'description' => 'Chinese comics', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Webtoon', 'slug' => 'webtoon', 'description' => 'Digital comics optimized for scrolling', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Light Novel', 'slug' => 'light-novel', 'description' => 'Illustrated Japanese novels', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('manga_types');
    }
};
