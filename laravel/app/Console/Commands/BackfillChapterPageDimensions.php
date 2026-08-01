<?php

namespace App\Console\Commands;

use App\Models\ChapterPage;
use App\Services\MediaFireService;
use Illuminate\Console\Command;

class BackfillChapterPageDimensions extends Command
{
    protected $signature = 'chapters:backfill-dimensions {--limit=0 : Max pages to process (0 = no limit)}';
    protected $description = 'Fetch width/height for existing chapter pages that are missing dimensions';

    public function handle(MediaFireService $mediaFireService): int
    {
        $query = ChapterPage::whereNull('width')->orWhereNull('height');
        $limit = (int) $this->option('limit');
        $total = $limit > 0 ? min($limit, $query->count()) : $query->count();

        if ($total === 0) {
            $this->info('No chapter pages are missing dimensions.');
            return Command::SUCCESS;
        }

        $this->info("Backfilling dimensions for {$total} chapter page(s)...");
        $this->output->progressStart($total);

        $processed = 0;
        $updated = 0;

        $query->orderBy('id')->chunkById(200, function ($pages) use ($mediaFireService, &$processed, &$updated, $limit) {
            foreach ($pages as $page) {
                if ($limit > 0 && $processed >= $limit) {
                    return false;
                }

                $dimensions = $mediaFireService->getImageDimensions($page->image_url);
                if ($dimensions['width'] && $dimensions['height']) {
                    $page->update($dimensions);
                    $updated++;
                }

                $processed++;
                $this->output->progressAdvance();
            }

            return true;
        });

        $this->output->progressFinish();
        $this->info("Done. Updated {$updated} of {$processed} processed page(s).");

        return Command::SUCCESS;
    }
}
