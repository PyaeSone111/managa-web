<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'pgsql') {
            DB::statement('ALTER TABLE series ALTER COLUMN thumbnail_url TYPE VARCHAR(2000)');
            DB::statement('ALTER TABLE series ALTER COLUMN cover_url TYPE VARCHAR(2000)');
        } else {
            DB::statement('ALTER TABLE series MODIFY thumbnail_url VARCHAR(2000) NULL');
            DB::statement('ALTER TABLE series MODIFY cover_url VARCHAR(2000) NULL');
        }
    }

    public function down(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'pgsql') {
            DB::statement('ALTER TABLE series ALTER COLUMN thumbnail_url TYPE VARCHAR(255)');
            DB::statement('ALTER TABLE series ALTER COLUMN cover_url TYPE VARCHAR(255)');
        } else {
            DB::statement('ALTER TABLE series MODIFY thumbnail_url VARCHAR(255) NULL');
            DB::statement('ALTER TABLE series MODIFY cover_url VARCHAR(255) NULL');
        }
    }
};
