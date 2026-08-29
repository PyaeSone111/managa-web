<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        // Process queued bulk imports every minute (requires schedule:run or schedule:work)
        $schedule->command('queue:work', [
            'database',
            '--stop-when-empty',
            '--max-jobs' => 100,
            '--max-time' => 3600,
            '--timeout' => 600,
            '--tries' => 1,
        ])
            ->everyMinute()
            ->withoutOverlapping(70)
            ->runInBackground();

        // Aggregate daily stats every hour
        $schedule->command('stats:aggregate')
            ->hourly()
            ->withoutOverlapping()
            ->runInBackground();

        // Refresh rankings every 15 minutes
        $schedule->command('rankings:refresh')
            ->everyFifteenMinutes()
            ->withoutOverlapping()
            ->runInBackground();

        // Warm ranking caches every 15 minutes
        $schedule->command('cache:warm --rankings')
            ->everyFifteenMinutes()
            ->withoutOverlapping()
            ->runInBackground();

        // Full cache warm once a day at 3 AM
        $schedule->command('cache:warm')
            ->dailyAt('03:00')
            ->withoutOverlapping()
            ->runInBackground();

        // Clean up old view events monthly (keep last 6 months)
        $schedule->command('model:prune', ['--model' => 'App\\Models\\ViewEvent'])
            ->monthly()
            ->withoutOverlapping();
    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
