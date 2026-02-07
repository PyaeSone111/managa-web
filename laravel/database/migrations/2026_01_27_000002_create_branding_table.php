<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('branding', function (Blueprint $table) {
            $table->id();
            $table->string('logo_url', 500)->nullable();
            $table->string('hero_background_url', 500)->nullable();
            $table->string('hero_image_url', 500)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('branding');
    }
};
