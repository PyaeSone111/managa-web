<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('view_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('series_id')->constrained('series')->onDelete('cascade');
            $table->foreignId('chapter_id')->nullable()->constrained('chapters')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('session_id', 100)->nullable();
            $table->string('ip_hash', 64)->nullable(); // Hashed for privacy
            $table->string('user_agent', 500)->nullable();
            $table->char('country_code', 2)->nullable();
            $table->timestamp('viewed_at')->useCurrent();

            $table->index(['series_id', 'viewed_at']);
            $table->index(['chapter_id', 'viewed_at']);
            $table->index('viewed_at');
        });

        // For PostgreSQL, consider using table partitioning for view_events
        // This would be done separately using raw SQL or a dedicated migration
    }

    public function down(): void
    {
        Schema::dropIfExists('view_events');
    }
};
