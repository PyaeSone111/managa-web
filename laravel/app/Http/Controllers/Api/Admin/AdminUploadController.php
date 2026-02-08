<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Branding;
use App\Models\Series;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class AdminUploadController extends Controller
{
    /**
     * Get the storage disk (R2)
     */
    protected function getStorageDisk()
    {
        $disk = config('filesystems.cloud', 'r2');
        
        // Validate R2 configuration BEFORE trying to use it
        if ($disk === 'r2') {
            // Check config values (which reads from .env)
            $r2Config = config('filesystems.disks.r2');
            
            $missing = [];
            if (empty($r2Config['bucket'])) $missing[] = 'R2_BUCKET';
            if (empty($r2Config['key'])) $missing[] = 'R2_ACCESS_KEY_ID';
            if (empty($r2Config['secret'])) $missing[] = 'R2_SECRET_ACCESS_KEY';
            if (empty($r2Config['endpoint'])) $missing[] = 'R2_ENDPOINT';
            
            if (!empty($missing)) {
                throw new \RuntimeException(
                    'R2 configuration is incomplete. Missing: ' . implode(', ', $missing) . '. ' .
                    'Please add these to your laravel/.env file and run: php artisan config:clear. ' .
                    'Run: php check-r2-config.php to verify your configuration.'
                );
            }
        }
        
        return Storage::disk($disk);
    }

    /**
     * Get image dimensions from file content
     */
    protected function getImageDimensions($file)
    {
        try {
            $imageInfo = @getimagesize($file->getRealPath());
            return [
                'width' => $imageInfo ? $imageInfo[0] : null,
                'height' => $imageInfo ? $imageInfo[1] : null,
            ];
        } catch (\Exception $e) {
            return ['width' => null, 'height' => null];
        }
    }

    /**
     * Upload a single image
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:10240', // 10MB max
            'type' => 'nullable|in:thumbnail,cover,chapter',
        ]);

        $file = $request->file('file');
        $type = $request->input('type', 'chapter');
        $disk = $this->getStorageDisk();
        
        // Generate unique filename
        $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        $path = "uploads/{$type}/" . $filename;

        // Get image dimensions before upload
        $dimensions = $this->getImageDimensions($file);
        $fileSize = $file->getSize();

        // Store file to R2 or local storage
        $storedPath = $disk->putFileAs("uploads/{$type}", $file, $filename, 'public');
        
        // Get public URL
        $url = $disk->url($storedPath);
        
        // If using R2 with custom domain, use the configured public URL
        if (!empty(env('R2_PUBLIC_URL'))) {
            $url = rtrim(env('R2_PUBLIC_URL'), '/') . '/' . $storedPath;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'url' => $url,
                'path' => $storedPath,
                'width' => $dimensions['width'],
                'height' => $dimensions['height'],
                'file_size' => $fileSize,
            ],
            'message' => 'Image uploaded successfully'
        ]);
    }

    /**
     * Upload multiple images (bulk)
     */
    public function bulkUpload(Request $request): JsonResponse
    {
        // Validate request - Laravel handles files[] automatically
        $request->validate([
            'files' => 'required|array|min:1|max:50',
            'files.*' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:10240',
            'type' => 'nullable|in:thumbnail,cover,chapter',
        ], [
            'files.required' => 'At least one file is required.',
            'files.array' => 'Files must be an array.',
            'files.min' => 'At least one file is required.',
            'files.max' => 'Maximum 50 files allowed.',
            'files.*.required' => 'Each file is required.',
            'files.*.image' => 'Each file must be an image.',
            'files.*.mimes' => 'Each file must be a jpeg, png, jpg, gif, or webp.',
            'files.*.max' => 'Each file must not exceed 10MB.',
        ]);

        // Get files - $request->file('files') works for both 'files' and 'files[]'
        $files = $request->file('files');
        
        // Ensure files is an array
        if (!is_array($files)) {
            $files = [$files];
        }

        $type = $request->input('type', 'chapter');
        $disk = $this->getStorageDisk();
        $uploaded = [];

        foreach ($files as $file) {
            $filename = time() . '_' . uniqid() . '_' . $file->getClientOriginalName();
            
            // Get image dimensions before upload
            $dimensions = $this->getImageDimensions($file);
            
            // Store file to R2 or local storage
            $storedPath = $disk->putFileAs("uploads/{$type}", $file, $filename, 'public');
            
            // Get public URL
            $url = $disk->url($storedPath);
            
            // If using R2 with custom domain, use the configured public URL
            if (!empty(env('R2_PUBLIC_URL'))) {
                $url = rtrim(env('R2_PUBLIC_URL'), '/') . '/' . $storedPath;
            }

            $uploaded[] = [
                'url' => $url,
                'path' => $storedPath,
                'width' => $dimensions['width'],
                'height' => $dimensions['height'],
                'file_size' => $file->getSize(),
                'original_filename' => $file->getClientOriginalName(),
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $uploaded,
            'message' => count($uploaded) . ' image(s) uploaded successfully'
        ]);
    }

    /**
     * List existing images for reuse: branding (logo, hero) + series covers/thumbnails.
     * GET /api/v1/admin/existing-images
     */
    public function existingImages(Request $request): JsonResponse
    {
        $branding = Branding::current();
        $brandingImages = [];
        if ($branding->logo_url) {
            $brandingImages[] = ['url' => $branding->logo_url, 'label' => 'Branding: Logo'];
        }
        if ($branding->hero_background_url) {
            $brandingImages[] = ['url' => $branding->hero_background_url, 'label' => 'Branding: Hero background'];
        }
        if ($branding->hero_image_url) {
            $brandingImages[] = ['url' => $branding->hero_image_url, 'label' => 'Branding: Hero image'];
        }

        $seriesImages = Series::query()
            ->select('id', 'title', 'cover_url', 'thumbnail_url')
            ->where(function ($q) {
                $q->whereNotNull('cover_url')->where('cover_url', '!=', '')
                    ->orWhereNotNull('thumbnail_url')->where('thumbnail_url', '!=', '');
            })
            ->orderBy('updated_at', 'desc')
            ->limit(100)
            ->get()
            ->flatMap(function ($s) {
                $items = [];
                if (!empty($s->cover_url)) {
                    $items[] = ['url' => $s->cover_url, 'label' => $s->title ? "Cover: {$s->title}" : 'Cover'];
                }
                if (!empty($s->thumbnail_url) && $s->thumbnail_url !== $s->cover_url) {
                    $items[] = ['url' => $s->thumbnail_url, 'label' => $s->title ? "Thumb: {$s->title}" : 'Thumbnail'];
                }
                return $items;
            })
            ->unique('url')
            ->values()
            ->all();

        return response()->json([
            'branding' => $brandingImages,
            'series_images' => $seriesImages,
        ]);
    }
}

