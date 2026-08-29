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

    public bool $failOnTimeout = true;

    public function __construct(
        public int $batchId,
        public int $rowIndex,
    ) {
        $this->onConnection('database');
    }

    public function handle(SeriesImportService $importService): void
    {
        $payload = DB::transaction(function () {
            $batch = SeriesImportBatch::lockForUpdate()->find($this->batchId);

            if (!$batch || $batch->status === SeriesImportBatch::STATUS_COMPLETED) {
                return null;
            }

            $rows = $batch->rows ?? [];
            $row = $rows[$this->rowIndex] ?? null;

            if ($this->alreadyRecorded($batch, $this->rowNumber($row ?? []))) {
                return null;
            }

            if ($batch->status === SeriesImportBatch::STATUS_PENDING) {
                $batch->status = SeriesImportBatch::STATUS_PROCESSING;
                $batch->save();
            }

            if (!$row) {
                $this->recordResult($batch, [
                    'row' => $this->rowIndex + 2,
                    'status' => 'failed',
                    'message' => 'Row data not found in import batch',
                ]);

                return null;
            }

            return [
                'row' => $row,
                'is_published' => (bool) $batch->is_published,
            ];
        });

        if ($payload === null) {
            return;
        }

        $title = $payload['row']['title'] ?? ('row '.($this->rowIndex + 2));
        if (defined('STDOUT')) {
            fwrite(STDOUT, '    Starting import: '.$title.PHP_EOL);
        }

        try {
            $result = $importService->importRow($payload['row'], $payload['is_published']);
        } catch (Throwable $e) {
            $result = [
                'status' => 'failed',
                'message' => $e->getMessage(),
            ];
        }

        $result['row'] = $payload['row']['row_number'] ?? ($this->rowIndex + 2);

        DB::transaction(function () use ($result) {
            $batch = SeriesImportBatch::lockForUpdate()->find($this->batchId);

            if (!$batch || $batch->status === SeriesImportBatch::STATUS_COMPLETED) {
                return;
            }

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
        if ($this->alreadyRecorded($batch, $result['row'] ?? null)) {
            return;
        }

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

    /**
     * @param  array<string, mixed>  $row
     */
    private function rowNumber(array $row): int
    {
        return (int) ($row['row_number'] ?? ($this->rowIndex + 2));
    }

    private function alreadyRecorded(SeriesImportBatch $batch, mixed $rowNumber): bool
    {
        if ($rowNumber === null) {
            return false;
        }

        foreach ($batch->results ?? [] as $existing) {
            if (($existing['row'] ?? null) == $rowNumber) {
                return true;
            }
        }

        return false;
    }
}
