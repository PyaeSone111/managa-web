<?php

namespace App\Jobs;

use App\Models\SeriesImportBatch;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class StartSeriesBulkImportJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 120;

    public function __construct(
        public int $batchId,
    ) {
        $this->onConnection('database');
    }

    public function handle(): void
    {
        $batch = SeriesImportBatch::find($this->batchId);
        if (!$batch) {
            return;
        }

        $rows = $batch->rows ?? [];
        foreach (array_keys($rows) as $index) {
            ImportSeriesRowJob::dispatch($batch->id, $index)->onConnection('database');
        }
    }
}
