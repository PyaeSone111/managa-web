<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Allow browsers/CDNs (e.g. Cloudflare) to briefly cache public, read-only API
 * responses. Server-side data still refreshes via Cache::remember TTLs; this
 * just lets clients skip a round trip for a few seconds on repeat requests.
 */
class CachePublicApi
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Respect controller-specific headers (e.g. BrandingController forces no-store,
        // some controllers already set a longer max-age) — only fill in a default.
        if ($request->isMethod('GET') && $response->isSuccessful() && !$response->headers->has('Cache-Control')) {
            $response->headers->set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
        }

        return $response;
    }
}
