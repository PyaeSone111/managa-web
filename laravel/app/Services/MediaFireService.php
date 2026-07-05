<?php

namespace App\Services;

class MediaFireService
{
    private const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];

    /**
     * Accept MediaFire view/file page URLs and return a direct image URL when possible.
     * Example: https://www.mediafire.com/view/bya154gqmz2iod9/A_Kyin_Nar.jpg/file
     */
    public function resolveImageUrl(string $url): string
    {
        $url = trim($url);
        if ($url === '') {
            return $url;
        }

        if (!preg_match('#^https?://#i', $url)) {
            $url = 'https://' . $url;
        }

        $quickKey = $this->extractFileQuickKey($url);
        if ($quickKey === null) {
            return $url;
        }

        $directUrl = $this->fetchFileDirectUrl($quickKey);

        return $directUrl ?? $url;
    }

    public function isMediaFireViewOrFileUrl(string $url): bool
    {
        return $this->extractFileQuickKey($url) !== null;
    }

    /**
     * @return string|null MediaFire quick_key from view/file URLs
     */
    public function extractFileQuickKey(string $url): ?string
    {
        if (preg_match('#mediafire\.com/view/([a-zA-Z0-9]+)/#i', $url, $matches)) {
            return $matches[1];
        }

        if (preg_match('#mediafire\.com/file/([a-zA-Z0-9]+)/#i', $url, $matches)) {
            return $matches[1];
        }

        return null;
    }

    /**
     * @return string|null direct_download or normal_download link
     */
    public function fetchFileDirectUrl(string $quickKey): ?string
    {
        $response = \Illuminate\Support\Facades\Http::timeout(20)->get(
            'https://www.mediafire.com/api/1.4/file/get_info.php',
            [
                'quick_key' => $quickKey,
                'response_format' => 'json',
            ]
        );

        if (!$response->successful()) {
            return null;
        }

        $data = $response->json();
        $fileInfo = $data['response']['file_info'] ?? null;

        if (!$fileInfo || ($data['response']['result'] ?? '') !== 'Success') {
            return null;
        }

        return $fileInfo['links']['direct_download']
            ?? $fileInfo['links']['normal_download']
            ?? null;
    }

    /**
     * Extract folder key from a MediaFire folder URL.
     */
    public function extractFolderKey(string $url): ?string
    {
        if (preg_match('#mediafire\.com/folder/([a-zA-Z0-9]+)#', $url, $matches)) {
            return $matches[1];
        }

        return null;
    }

    /**
     * Fetch image files from a MediaFire folder URL, sorted by filename.
     *
     * @return array<int, array{image_url: string, original_filename: string}>
     */
    public function getFolderImages(string $folderUrl): array
    {
        $folderKey = $this->extractFolderKey($folderUrl);
        if (!$folderKey) {
            throw new \RuntimeException('Invalid MediaFire folder URL');
        }

        $files = $this->fetchFolderFiles($folderKey);
        $images = [];

        foreach ($files as $file) {
            $filename = $file['filename'] ?? '';
            if (!$this->isImageFile($filename)) {
                continue;
            }

            $downloadUrl = $file['links']['direct_download']
                ?? $file['links']['normal_download']
                ?? null;

            if (!$downloadUrl) {
                continue;
            }

            $images[] = [
                'image_url' => $downloadUrl,
                'original_filename' => $filename,
            ];
        }

        if (empty($images)) {
            throw new \RuntimeException('No image files found in MediaFire folder');
        }

        usort($images, fn ($a, $b) => strnatcasecmp($a['original_filename'], $b['original_filename']));

        return array_values($images);
    }

    /**
     * Split sorted page images into chapters by page count.
     *
     * @param  array<int, array{image_url: string, original_filename: string}>  $images
     * @return array<int, array{chapter_number: int, title: string, pages: array<int, array{image_url: string, original_filename: string}>}>
     */
    public function splitImagesIntoChapters(array $images, int $pagesPerChapter): array
    {
        if ($pagesPerChapter < 1) {
            throw new \RuntimeException('Pages per chapter must be at least 1');
        }

        $chapters = [];
        $chunks = array_chunk($images, $pagesPerChapter);

        foreach ($chunks as $index => $chunk) {
            if (empty($chunk)) {
                continue;
            }

            $chapterNumber = $index + 1;
            $chapters[] = [
                'chapter_number' => $chapterNumber,
                'title' => 'chapter-' . $chapterNumber,
                'pages' => $chunk,
            ];
        }

        if (empty($chapters)) {
            throw new \RuntimeException('No chapters could be created from folder images');
        }

        return $chapters;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function fetchFolderFiles(string $folderKey): array
    {
        $allFiles = [];
        $chunk = 1;
        $chunkSize = 100;

        do {
            $response = \Illuminate\Support\Facades\Http::timeout(30)->get('https://www.mediafire.com/api/1.4/folder/get_content.php', [
                'folder_key' => $folderKey,
                'content_type' => 'files',
                'sort_by' => 'name',
                'sort_direction' => 'asc',
                'chunk' => $chunk,
                'chunk_size' => $chunkSize,
                'version' => '1.5',
                'response_format' => 'json',
            ]);

            if (!$response->successful()) {
                throw new \RuntimeException('Failed to connect to MediaFire');
            }

            $data = $response->json();
            $result = $data['response'] ?? null;

            if (!$result || ($result['result'] ?? '') !== 'Success') {
                $message = $result['message'] ?? 'Unknown MediaFire error';
                throw new \RuntimeException('MediaFire error: ' . $message);
            }

            $content = $result['folder_content'] ?? [];
            $files = $content['files'] ?? [];
            $allFiles = array_merge($allFiles, $files);

            $moreChunks = ($content['more_chunks'] ?? 'no') === 'yes';
            $chunk++;
        } while ($moreChunks && $chunk <= 50);

        return $allFiles;
    }

    private function isImageFile(string $filename): bool
    {
        $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

        return in_array($ext, self::IMAGE_EXTENSIONS, true);
    }
}
