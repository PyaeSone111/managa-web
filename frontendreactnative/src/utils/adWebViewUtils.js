import { Linking, Platform } from 'react-native';

export const AD_WEBVIEW_USER_AGENT =
  'Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';

export const AD_CLOSE_DELAY_SEC = 15;

export function isWebUrl(url) {
  return /^https?:\/\//i.test(url) || url === 'about:blank';
}

export function getIntentFallbackUrl(intentUrl) {
  const match = intentUrl.match(/S\.browser_fallback_url=([^;]+)/i);
  if (!match?.[1]) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

export function isUnknownSchemeError(code, description) {
  return (
    code === -10 ||
    String(description || '').includes('ERR_UNKNOWN_URL_SCHEME') ||
    String(description || '').toLowerCase().includes('webpage not available')
  );
}

export async function openAdExternalUrl(url) {
  if (!url) return;
  try {
    await Linking.openURL(url);
  } catch {
    // Ignore unsupported custom schemes from ad redirects.
  }
}

/** Returns handler for onShouldStartLoadWithRequest. Pass onFallbackUrl when URL should reload in-webview. */
export function createAdNavigationHandler({ onFallbackUrl, onBlocked } = {}) {
  return (request) => {
    const { url } = request;
    if (!url || isWebUrl(url)) {
      return true;
    }

    if (Platform.OS === 'android' && url.startsWith('intent://')) {
      const fallback = getIntentFallbackUrl(url);
      if (fallback && isWebUrl(fallback)) {
        onFallbackUrl?.(fallback);
        return false;
      }
    }

    openAdExternalUrl(url);
    onBlocked?.();
    return false;
  };
}

export const adWebViewProps = {
  userAgent: AD_WEBVIEW_USER_AGENT,
  javaScriptEnabled: true,
  domStorageEnabled: true,
  thirdPartyCookiesEnabled: true,
  sharedCookiesEnabled: true,
  originWhitelist: ['http://*', 'https://*'],
  setSupportMultipleWindows: false,
  mixedContentMode: 'compatibility',
  androidLayerType: 'hardware',
  cacheEnabled: true,
  startInLoadingState: false,
};
