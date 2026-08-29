<?php

namespace App\Jobs;

use App\Models\ChapterImportBatch;
use App\Services\ChapterImportService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Throwable;

class ImportChapterRowJob implements ShouldQueue
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

    public function handle(ChapterImportService $importService): void
    {
        $payload = DB::transaction(function () {
            $batch = ChapterImportBatch::lockForUpdate()->find($this->batchId);

            if (!$batch || $batch->status === ChapterImportBatch::STATUS_COMPLETED) {
                return null;
            }

            $rows = $batch->rows ?? [];
            $row = $rows[$this->rowIndex] ?? null;

            if ($this->alreadyRecorded($batch, $this->rowNumber($row ?? []))) {
                return null;
            }

            if ($batch->status === ChapterImportBatch::STATUS_PENDING) {
                $batch->status = ChapterImportBatch::STATUS_PROCESSING;
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
            $batch = ChapterImportBatch::lockForUpdate()->find($this->batchId);

            if (!$batch || $batch->status === ChapterImportBatch::STATUS_COMPLETED) {
                return;
            }

            $this->recordResult($batch, $result);
        });
    }

    public function failed(?Throwable $exception): void
    {
        DB::transaction(function () use ($exception) {
            $batch = ChapterImportBatch::lockForUpdate()->find($this->batchId);

            if (!$batch || $batch->status === ChapterImportBatch::STATUS_COMPLETED) {
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
     * @param  array{row?: int, status: string, message?: string, chapter_id?: int, page_count?: int}  $result
     */
    private function recordResult(ChapterImportBatch $batch, array $result): void
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
            $batch->status = ChapterImportBatch::STATUS_COMPLETED;
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

    private function alreadyRecorded(ChapterImportBatch $batch, mixed $rowNumber): bool
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
