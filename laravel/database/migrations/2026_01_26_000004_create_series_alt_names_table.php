<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('series_alt_names', function (Blueprint $table) {
            $table->id();
            $table->foreignId('series_id')->constrained('series')->onDelete('cascade');
            $table->string('name', 500);
            $table->string('language', 10)->nullable(); // 'en', 'jp', 'kr', 'cn', etc.
            $table->timestamps();

            $table->unique(['series_id', 'name']);
            $table->index('name');
        });

        // Add trigram index for PostgreSQL
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('CREATE EXTENSION IF NOT EXISTS pg_trgm');
            DB::statement('CREATE INDEX IF NOT EXISTS idx_series_alt_names_trgm ON series_alt_names USING GIN(name gin_trgm_ops)');
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('DROP INDEX IF EXISTS idx_series_alt_names_trgm');
        }
        Schema::dropIfExists('series_alt_names');
    }
};
