import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import LoadingSpinner from './LoadingSpinner';
import { MONETAG_SMART_LINK } from '../utils/constants';
import colors from '../theme/colors';

const CLOSE_DELAY_SEC = 15;
const WEBVIEW_USER_AGENT =
  'Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';

function getAdUrl() {
  const url = MONETAG_SMART_LINK?.trim();
  if (!url || !/^https?:\/\//i.test(url)) {
    return null;
  }
  return url;
}

function isWebUrl(url) {
  return /^https?:\/\//i.test(url) || url === 'about:blank';
}

function getIntentFallbackUrl(intentUrl) {
  const match = intentUrl.match(/S\.browser_fallback_url=([^;]+)/i);
  if (!match?.[1]) {
    return null;
  }
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

export default function MonetagAdView({ visible = true, onClose }) {
  const [secondsLeft, setSecondsLeft] = useState(CLOSE_DELAY_SEC);
  const [sessionKey, setSessionKey] = useState(0);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(null);

  const adUrl = useMemo(() => getAdUrl(), []);
  const canClose = secondsLeft <= 0;
  const showSpinner = Boolean(adUrl) && !pageLoaded;

  useEffect(() => {
    if (!visible) {
      setSecondsLeft(CLOSE_DELAY_SEC);
      setPageLoaded(false);
      setCurrentUrl(null);
      return undefined;
    }

    setSessionKey((key) => key + 1);
    setPageLoaded(false);
    setCurrentUrl(adUrl);
    setSecondsLeft(CLOSE_DELAY_SEC);

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [visible, adUrl]);

  const finishLoading = useCallback(() => setPageLoaded(true), []);

  const openExternalUrl = useCallback(
    async (url) => {
      if (!url) {
        return;
      }

      if (Platform.OS === 'android' && url.startsWith('intent://')) {
        try {
          await Linking.openURL(url);
        } catch {
          // Ad intent redirects are optional; keep the current WebView page.
        }
        finishLoading();
        return;
      }

      try {
        await Linking.openURL(url);
      } catch {
        // Ignore unsupported custom schemes from ad redirects.
      }

      finishLoading();
    },
    [finishLoading],
  );

  const handleShouldStartLoadWithRequest = useCallback(
    (request) => {
      const { url } = request;
      if (!url || isWebUrl(url)) {
        return true;
      }

      if (Platform.OS === 'android' && url.startsWith('intent://')) {
        const fallback = getIntentFallbackUrl(url);
        if (fallback && isWebUrl(fallback)) {
          setCurrentUrl(fallback);
          return false;
        }
      }

      openExternalUrl(url);
      return false;
    },
    [openExternalUrl],
  );

  const handleWebViewError = useCallback(
    (event) => {
      const { description, code } = event.nativeEvent;
      const isUnknownScheme =
        code === -10 ||
        String(description || '').includes('ERR_UNKNOWN_URL_SCHEME');

      if (isUnknownScheme) {
        finishLoading();
        return;
      }

      finishLoading();
    },
    [finishLoading],
  );

  if (!visible) {
    return null;
  }

  const handleClose = () => {
    if (!canClose) {
      return;
    }
    setPageLoaded(false);
    setCurrentUrl(null);
    onClose?.();
  };

  const webViewSource = currentUrl ? { uri: currentUrl } : null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Advertisement</Text>
            {canClose ? (
              <Pressable
                onPress={handleClose}
                style={styles.closeBtn}
                accessibilityRole="button"
                accessibilityLabel="Close advertisement"
              >
                <Text style={styles.closeBtnText}>Close Ad ✕</Text>
              </Pressable>
            ) : (
              <View style={styles.timerBadge}>
                <Text style={styles.timerText}>{secondsLeft}s</Text>
              </View>
            )}
          </View>

          <View style={styles.webviewWrap}>
            {showSpinner ? (
              <View style={styles.loadingOverlay}>
                <LoadingSpinner style={styles.loadingSpinner} />
              </View>
            ) : null}
            {webViewSource ? (
              <WebView
                key={sessionKey}
                source={webViewSource}
                style={[styles.webview, showSpinner && styles.webviewHidden]}
                userAgent={WEBVIEW_USER_AGENT}
                javaScriptEnabled
                domStorageEnabled
                thirdPartyCookiesEnabled
                sharedCookiesEnabled
                originWhitelist={['http://*', 'https://*']}
                setSupportMultipleWindows={false}
                onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
                onLoadStart={() => setPageLoaded(false)}
                onLoadEnd={finishLoading}
                onError={handleWebViewError}
                onHttpError={finishLoading}
                renderError={() => <View style={styles.webview} />}
              />
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(30, 61, 89, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    height: '78%',
    maxHeight: 640,
    backgroundColor: colors.almond,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.almondBorder,
    overflow: 'hidden',
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.almondBorder,
    backgroundColor: colors.navy,
    minHeight: 48,
  },
  headerTitle: {
    color: colors.almond,
    fontWeight: '600',
    fontSize: 14,
  },
  closeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.redOrange,
  },
  closeBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  timerBadge: {
    minWidth: 44,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
  },
  timerText: {
    color: colors.almond,
    fontWeight: '700',
    fontSize: 14,
    fontVariant: ['tabular-nums'],
  },
  webviewWrap: {
    flex: 1,
    backgroundColor: colors.almond,
  },
  webview: {
    flex: 1,
    backgroundColor: colors.almond,
  },
  webviewHidden: {
    opacity: 0,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    backgroundColor: colors.almond,
  },
  loadingSpinner: {
    flex: 1,
    backgroundColor: colors.almond,
  },
});
