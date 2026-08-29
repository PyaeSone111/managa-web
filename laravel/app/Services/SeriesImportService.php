<?php

namespace App\Services;

use App\Models\Author;
use App\Models\Chapter;
use App\Models\ChapterPage;
use App\Models\MangaType;
use App\Models\Series;
use App\Services\CacheInvalidator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SeriesImportService
{
    public function __construct(
        private MediaFireService $mediaFireService,
        private CacheInvalidator $cacheInvalidator
    ) {}

    /**
     * Import one series row: create series, authors, and chapters from a MediaFire folder.
     *
     * @param  array{title: string, description?: string, authors?: string, image_url?: string, mediafire_folder_url: string, pages_per_chapter?: int|null, type?: string, type_ids?: int[], status?: string, row_number?: int}  $row
     * @return array{status: string, message?: string, series_id?: int, chapters_created?: int, total_pages?: int, pages_per_chapter?: int}
     */
    public function importRow(array $row, bool $isPublished = true): array
    {
        $title = trim($row['title'] ?? '');
        if ($title === '') {
            return ['status' => 'failed', 'message' => 'Title is required'];
        }

        if (!str_contains($row['mediafire_folder_url'] ?? '', 'mediafire.com')) {
            return ['status' => 'failed', 'message' => 'Invalid MediaFire folder URL'];
        }

        $requestedPagesPerChapter = isset($row['pages_per_chapter']) && $row['pages_per_chapter'] !== '' && $row['pages_per_chapter'] !== null
            ? (int) $row['pages_per_chapter']
            : null;

        if ($requestedPagesPerChapter !== null && $requestedPagesPerChapter < 1) {
            return ['status' => 'failed', 'message' => 'Pages per chapter must be at least 1'];
        }

        $slug = $this->uniqueSlugForTitle($title);
        $originalSlug = $slug;
        $counter = 1;
        while (Series::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        if (Series::where('title', $title)->exists()) {
            return ['status' => 'skipped', 'message' => 'Series with this title already exists'];
        }

        try {
            $this->progress("Fetching MediaFire folder for \"{$title}\"...");
            $images = $this->mediaFireService->getFolderImages($row['mediafire_folder_url']);
            $pagesPerChapter = $requestedPagesPerChapter
                ?? $this->mediaFireService->calculateOptimalPagesPerChapter(count($images));
            $chapterPlans = $this->mediaFireService->splitImagesIntoChapters($images, $pagesPerChapter);
            $this->progress('Found '.count($images).' images → '.count($chapterPlans).' chapter(s). Saving...');
        } catch (\Exception $e) {
            return ['status' => 'failed', 'message' => $e->getMessage()];
        }

        $imageUrl = trim($row['image_url'] ?? '') ?: null;
        if ($imageUrl !== null) {
            $imageUrl = $this->normalizeExternalUrl($imageUrl);
        } elseif (!empty($images[0]['image_url'])) {
            $imageUrl = $this->normalizeExternalUrl($images[0]['image_url']);
        }
        $authorsCsv = trim($row['authors'] ?? '');
        $legacyAuthor = $authorsCsv !== '' ? explode(',', $authorsCsv)[0] : null;
        $typeIds = array_values(array_filter(array_map('intval', $row['type_ids'] ?? [])));
        $legacyType = $this->resolveLegacyType($row['type'] ?? null, $typeIds);

        DB::beginTransaction();
        try {
            $series = Series::create([
                'title' => $title,
                'slug' => $slug,
                'description' => trim($row['description'] ?? '') ?: null,
                'thumbnail_url' => $imageUrl,
                'cover_url' => $imageUrl,
                'type' => $legacyType,
                'status' => $row['status'] ?? 'ongoing',
                'author' => $legacyAuthor ? trim($legacyAuthor) : null,
                'total_chapters' => 0,
            ]);

            $this->syncAuthors($series, $authorsCsv);

            if (!empty($typeIds)) {
                $series->mangaTypes()->sync($typeIds);
            }

            $chaptersCreated = 0;
            $totalPages = 0;

            foreach ($chapterPlans as $plan) {
                $this->createChapter($series, $plan, $isPublished);
                $chaptersCreated++;
                $totalPages += count($plan['pages']);
            }

            DB::commit();

            $this->cacheInvalidator->invalidateSeries($series);

            return [
                'status' => 'success',
                'series_id' => $series->id,
                'chapters_created' => $chaptersCreated,
                'total_pages' => $totalPages,
                'pages_per_chapter' => $pagesPerChapter,
            ];
        } catch (\Exception $e) {
            DB::rollBack();

            return ['status' => 'failed', 'message' => 'Import failed: ' . $e->getMessage()];
        }
    }

    private function resolveLegacyType(?string $type, array $typeIds): string
    {
        $value = strtolower(trim((string) $type));
        if (in_array($value, ['manga', 'manhwa', 'manhua'], true)) {
            return $value;
        }

        if (!empty($typeIds)) {
            $mangaType = MangaType::find($typeIds[0]);
            if ($mangaType) {
                $slug = strtolower($mangaType->slug);
                if (in_array($slug, ['manga', 'manhwa', 'manhua'], true)) {
                    return $slug;
                }
            }
        }

        return 'manga';
    }

    private function syncAuthors(Series $series, string $authorsCsv): void
    {
        if ($authorsCsv === '') {
            return;
        }

        $names = array_filter(array_map('trim', explode(',', $authorsCsv)));
        $sync = [];

        foreach ($names as $name) {
            $author = $this->findOrCreateAuthorByName($name);
            $sync[$author->id] = ['role' => 'author'];
        }

        if (!empty($sync)) {
            $series->authors()->sync($sync);
        }
    }

    /**
     * @param  array{chapter_number: int|float, title: string, pages: array<int, array{image_url: string, original_filename: string}>}  $plan
     */
    private function createChapter(Series $series, array $plan, bool $isPublished): Chapter
    {
        $chapterNum = $plan['chapter_number'];
        $seriesSlug = $series->slug;
        $slug = Str::slug("{$seriesSlug}-chapter-{$chapterNum}");
        $originalSlug = $slug;
        $counter = 1;

        while (Chapter::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        $chapter = Chapter::create([
            'series_id' => $series->id,
            'chapter_number' => $chapterNum,
            'title' => $plan['title'],
            'slug' => $slug,
            'is_published' => $isPublished,
            'published_at' => now(),
        ]);

        foreach ($plan['pages'] as $i => $image) {
            ChapterPage::create([
                'chapter_id' => $chapter->id,
                'page_number' => $i + 1,
                'image_url' => $this->encodeUrlPath($image['image_url']),
                'original_filename' => $image['original_filename'],
                'width' => null,
                'height' => null,
            ]);
        }

        $chapter->update(['page_count' => count($plan['pages'])]);
        $series->increment('total_chapters');

        return $chapter;
    }

    public function normalizeExternalUrl(?string $url): ?string
    {
        $url = trim((string) $url);
        if ($url === '') {
            return null;
        }

        if (!preg_match('#^https?://#i', $url)) {
            $url = 'https://' . $url;
        }

        $url = $this->mediaFireService->resolveImageUrl($url);

        return $this->encodeUrlPath($url);
    }

    private function encodeUrlPath(string $url): string
    {
        $parsed = parse_url($url);
        if (!isset($parsed['path'])) {
            return $url;
        }

        $segments = array_map(
            static fn (string $segment) => rawurlencode(rawurldecode($segment)),
            explode('/', trim($parsed['path'], '/'))
        );
        $path = '/' . implode('/', $segments);
        $scheme = $parsed['scheme'] ?? 'https';
        $host = $parsed['host'] ?? '';
        $port = isset($parsed['port']) ? ':' . $parsed['port'] : '';
        $query = isset($parsed['query']) ? '?' . $parsed['query'] : '';
        $fragment = isset($parsed['fragment']) ? '#' . $parsed['fragment'] : '';

        return $scheme . '://' . $host . $port . $path . $query . $fragment;
    }

    private function findOrCreateAuthorByName(string $name): Author
    {
        $existing = Author::where('name', $name)->first();
        if ($existing) {
            return $existing;
        }

        $slug = Str::slug($name);
        if ($slug === '') {
            $slug = 'author-' . substr(md5($name), 0, 12);
        }

        $baseSlug = $slug;
        $counter = 1;
        while (Author::where('slug', $slug)->where('name', '!=', $name)->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        return Author::create([
            'name' => $name,
            'slug' => $slug,
        ]);
    }

    private function uniqueSlugForTitle(string $title): string
    {
        $slug = Str::slug($title);
        if ($slug !== '') {
            return $slug;
        }

        return 'series-' . substr(md5($title), 0, 12);
    }

    private function progress(string $message): void
    {
        Log::info($message);
        if (defined('STDOUT')) {
            fwrite(STDOUT, '    '.$message.PHP_EOL);
        }
    }
}
