<?php

namespace App\Providers;

use App\Models\Chapter;
use App\Observers\ChapterObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        // Keep series.last_chapter_at and total_chapters in sync on MySQL (Hostinger / PHPMyAdmin)
        Chapter::observe(ChapterObserver::class);
    }
}
