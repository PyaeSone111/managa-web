<?php

namespace App\Services;

use App\Models\Chapter;
use App\Models\ChapterPage;
use App\Models\Series;
use App\Services\CacheInvalidator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ChapterImportService
{
    public function __construct(
        private MediaFireService $mediaFireService,
        private CacheInvalidator $cacheInvalidator
    ) {}

    /**
     * @param  array{series_id: int, chapter_number: float|int, title?: string, mediafire_folder_url: string, row_number?: int}  $row
     * @return array{status: string, message?: string, chapter_id?: int, page_count?: int}
     */
    public function importRow(array $row, bool $isPublished = true): array
    {
        if (!str_contains($row['mediafire_folder_url'] ?? '', 'mediafire.com')) {
            return ['status' => 'failed', 'message' => 'Invalid MediaFire folder URL'];
        }

        $series = Series::find($row['series_id']);
        if (!$series) {
            return ['status' => 'failed', 'message' => 'Manga ID not found'];
        }

        if (Chapter::where('series_id', $row['series_id'])
            ->where('chapter_number', $row['chapter_number'])
            ->exists()) {
            return ['status' => 'skipped', 'message' => 'Chapter number already exists for this series'];
        }

        try {
            $images = $this->mediaFireService->getFolderImages($row['mediafire_folder_url']);
        } catch (\Exception $e) {
            return ['status' => 'failed', 'message' => $e->getMessage()];
        }

        $seriesSlug = $series->slug;
        $chapterNum = $row['chapter_number'];
        $slug = Str::slug("{$seriesSlug}-chapter-{$chapterNum}");
        $counter = 1;
        $originalSlug = $slug;
        while (Chapter::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        $pages = [];
        foreach ($images as $i => $image) {
            $dimensions = $this->mediaFireService->getImageDimensions($image['image_url']);
            $pages[] = [
                'page_number' => $i + 1,
                'image_url' => $this->encodeUrlPath($image['image_url']),
                'original_filename' => $image['original_filename'],
                'width' => $dimensions['width'],
                'height' => $dimensions['height'],
            ];
        }

        DB::beginTransaction();
        try {
            $chapter = Chapter::create([
                'series_id' => $row['series_id'],
                'chapter_number' => $row['chapter_number'],
                'title' => $row['title'] ?? null,
                'slug' => $slug,
                'is_published' => $isPublished,
                'published_at' => now(),
            ]);

            foreach ($pages as $pageData) {
                ChapterPage::create([
                    'chapter_id' => $chapter->id,
                    'page_number' => $pageData['page_number'],
                    'image_url' => $pageData['image_url'],
                    'original_filename' => $pageData['original_filename'],
                    'width' => $pageData['width'],
                    'height' => $pageData['height'],
                ]);
            }

            $chapter->update(['page_count' => count($pages)]);
            $series->increment('total_chapters');

            DB::commit();

            $chapter->setRelation('series', $series);
            $this->cacheInvalidator->invalidateChapter($chapter);

            return [
                'status' => 'success',
                'chapter_id' => $chapter->id,
                'page_count' => count($pages),
            ];
        } catch (\Exception $e) {
            DB::rollBack();

            return ['status' => 'failed', 'message' => 'Failed to create chapter: ' . $e->getMessage()];
        }
    }

    private function encodeUrlPath(string $url): string
    {
        $parsed = parse_url($url);
        if (!isset($parsed['path'])) {
            return $url;
        }

        $segments = array_map('rawurlencode', explode('/', trim($parsed['path'], '/')));
        $path = '/' . implode('/', $segments);
        $scheme = $parsed['scheme'] ?? 'https';
        $host = $parsed['host'] ?? '';
        $port = isset($parsed['port']) ? ':' . $parsed['port'] : '';
        $query = isset($parsed['query']) ? '?' . $parsed['query'] : '';
        $fragment = isset($parsed['fragment']) ? '#' . $parsed['fragment'] : '';

        return $scheme . '://' . $host . $port . $path . $query . $fragment;
    }
}
