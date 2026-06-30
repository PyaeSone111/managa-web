<?php

namespace App\Http\Controllers;

use Symfony\Component\HttpFoundation\BinaryFileResponse;

class AppDownloadController extends Controller
{
    private const APK_FILENAME = 'myangarread00121v1.apk';

    public function download(): BinaryFileResponse
    {
        $path = public_path('downloads/' . self::APK_FILENAME);

        abort_unless(is_file($path), 404, 'App download is not available.');

        return response()->file($path, [
            'Content-Type' => 'application/vnd.android.package-archive',
            'Content-Disposition' => 'attachment; filename="' . self::APK_FILENAME . '"',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }
}
