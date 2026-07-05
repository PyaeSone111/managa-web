<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('series_import_batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('status', 20)->default('pending');
            $table->unsignedSmallInteger('total_rows');
            $table->unsignedSmallInteger('processed_rows')->default(0);
            $table->unsignedSmallInteger('imported_count')->default(0);
            $table->unsignedSmallInteger('skipped_count')->default(0);
            $table->unsignedSmallInteger('failed_count')->default(0);
            $table->boolean('is_published')->default(true);
            $table->json('rows');
            $table->json('results')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('series_import_batches');
    }
};
