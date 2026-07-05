<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SeriesImportBatch extends Model
{
    public const STATUS_PENDING = 'pending';

    public const STATUS_PROCESSING = 'processing';

    public const STATUS_COMPLETED = 'completed';

    public const STATUS_FAILED = 'failed';

    protected $fillable = [
        'user_id',
        'status',
        'total_rows',
        'processed_rows',
        'imported_count',
        'skipped_count',
        'failed_count',
        'is_published',
        'rows',
        'results',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'rows' => 'array',
        'results' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function progressPercent(): int
    {
        if ($this->total_rows < 1) {
            return 0;
        }

        return (int) round(($this->processed_rows / $this->total_rows) * 100);
    }

    public function toStatusPayload(): array
    {
        return [
            'batch_id' => $this->id,
            'status' => $this->status,
            'total' => $this->total_rows,
            'processed' => $this->processed_rows,
            'imported' => $this->imported_count,
            'skipped' => $this->skipped_count,
            'failed' => $this->failed_count,
            'progress_percent' => $this->progressPercent(),
            'results' => $this->results ?? [],
        ];
    }
}
