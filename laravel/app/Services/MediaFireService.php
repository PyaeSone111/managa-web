<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class MediaFireService
{
    private const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];

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
            throw new RuntimeException('Invalid MediaFire folder URL');
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
            throw new RuntimeException('No image files found in MediaFire folder');
        }

        usort($images, fn ($a, $b) => strnatcasecmp($a['original_filename'], $b['original_filename']));

        return array_values($images);
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
            $response = Http::timeout(30)->get('https://www.mediafire.com/api/1.4/folder/get_content.php', [
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
                throw new RuntimeException('Failed to connect to MediaFire');
            }

            $data = $response->json();
            $result = $data['response'] ?? null;

            if (!$result || ($result['result'] ?? '') !== 'Success') {
                $message = $result['message'] ?? 'Unknown MediaFire error';
                throw new RuntimeException('MediaFire error: ' . $message);
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
