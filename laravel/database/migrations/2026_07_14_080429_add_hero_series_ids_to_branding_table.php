<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('branding', function (Blueprint $table) {
            $table->json('hero_series_ids')->nullable()->after('hero_image_url');
        });
    }

    public function down(): void
    {
        Schema::table('branding', function (Blueprint $table) {
            $table->dropColumn('hero_series_ids');
        });
    }
};
