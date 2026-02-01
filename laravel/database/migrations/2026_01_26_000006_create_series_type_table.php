<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('series_type', function (Blueprint $table) {
            $table->foreignId('series_id')->constrained('series')->onDelete('cascade');
            $table->foreignId('manga_type_id')->constrained('manga_types')->onDelete('cascade');

            $table->primary(['series_id', 'manga_type_id']);
            $table->index('manga_type_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('series_type');
    }
};
