<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('branding', function (Blueprint $table) {
            $table->string('app_download_url', 500)->nullable()->after('hero_image_url');
            $table->string('app_download_filename', 120)->nullable()->after('app_download_url');
            $table->string('app_version', 20)->nullable()->after('app_download_filename');
            $table->string('app_size_mb', 10)->nullable()->after('app_version');
        });
    }

    public function down(): void
    {
        Schema::table('branding', function (Blueprint $table) {
            $table->dropColumn([
                'app_download_url',
                'app_download_filename',
                'app_version',
                'app_size_mb',
            ]);
        });
    }
};
