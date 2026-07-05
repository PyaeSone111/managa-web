<?php

namespace App\Jobs;

use App\Models\SeriesImportBatch;
use App\Services\SeriesImportService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Throwable;

class ImportSeriesRowJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 600;

    public int $tries = 1;

    public function __construct(
        public int $batchId,
        public int $rowIndex,
    ) {
        $this->onConnection('database');
    }

    public function handle(SeriesImportService $importService): void
    {
        DB::transaction(function () use ($importService) {
            $batch = SeriesImportBatch::lockForUpdate()->find($this->batchId);

            if (!$batch || $batch->status === SeriesImportBatch::STATUS_COMPLETED) {
                return;
            }

            if ($batch->status === SeriesImportBatch::STATUS_PENDING) {
                $batch->status = SeriesImportBatch::STATUS_PROCESSING;
            }

            $rows = $batch->rows ?? [];
            $row = $rows[$this->rowIndex] ?? null;

            if (!$row) {
                $this->recordResult($batch, [
                    'row' => $this->rowIndex + 2,
                    'status' => 'failed',
                    'message' => 'Row data not found in import batch',
                ]);

                return;
            }

            try {
                $result = $importService->importRow($row, (bool) $batch->is_published);
            } catch (Throwable $e) {
                $result = [
                    'status' => 'failed',
                    'message' => $e->getMessage(),
                ];
            }

            $result['row'] = $row['row_number'] ?? ($this->rowIndex + 2);
            $this->recordResult($batch, $result);
        });
    }

    public function failed(?Throwable $exception): void
    {
        DB::transaction(function () use ($exception) {
            $batch = SeriesImportBatch::lockForUpdate()->find($this->batchId);

            if (!$batch || $batch->status === SeriesImportBatch::STATUS_COMPLETED) {
                return;
            }

            $rows = $batch->rows ?? [];
            $row = $rows[$this->rowIndex] ?? [];

            $this->recordResult($batch, [
                'row' => $row['row_number'] ?? ($this->rowIndex + 2),
                'status' => 'failed',
                'message' => $exception?->getMessage() ?? 'Import job failed',
            ]);
        });
    }

    /**
     * @param  array{row?: int, status: string, message?: string, series_id?: int, chapters_created?: int, total_pages?: int}  $result
     */
    private function recordResult(SeriesImportBatch $batch, array $result): void
    {
        $results = $batch->results ?? [];
        $results[] = $result;

        $batch->results = $results;
        $batch->processed_rows++;

        match ($result['status']) {
            'success' => $batch->imported_count++,
            'skipped' => $batch->skipped_count++,
            default => $batch->failed_count++,
        };

        if ($batch->processed_rows >= $batch->total_rows) {
            $batch->status = SeriesImportBatch::STATUS_COMPLETED;
        }

        $batch->save();
    }
}
