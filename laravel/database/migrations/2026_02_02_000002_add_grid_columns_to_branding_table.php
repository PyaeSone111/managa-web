<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('branding', function (Blueprint $table) {
            $table->json('grid_columns')->nullable()->after('card_layout');
        });
    }

    public function down(): void
    {
        Schema::table('branding', function (Blueprint $table) {
            $table->dropColumn('grid_columns');
        });
    }
};
