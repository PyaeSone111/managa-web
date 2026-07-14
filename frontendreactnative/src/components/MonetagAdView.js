import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { WebView } from 'react-native-webview';
import AdCountdownRing from './ads/AdCountdownRing';
import {
  AD_CLOSE_DELAY_SEC,
  adWebViewProps,
  createAdNavigationHandler,
  isUnknownSchemeError,
} from '../utils/adWebViewUtils';
import { MONETAG_SMART_LINK } from '../utils/constants';
import colors from '../theme/colors';

function getAdUrl() {
  const url = MONETAG_SMART_LINK?.trim();
  if (!url || !/^https?:\/\//i.test(url)) {
    return null;
  }
  return url;
}

export default function MonetagAdView({ visible = true, onClose }) {
  const [canClose, setCanClose] = useState(false);
  const [countdownKey, setCountdownKey] = useState(0);
  const [sessionKey, setSessionKey] = useState(0);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(null);

  const adUrl = useMemo(() => getAdUrl(), []);
  const showLoadingOverlay = Boolean(currentUrl) && !pageLoaded;

  useEffect(() => {
    if (!visible) {
      setCanClose(false);
      setPageLoaded(false);
      setCurrentUrl(null);
      return undefined;
    }

    setSessionKey((key) => key + 1);
    setCountdownKey((key) => key + 1);
    setPageLoaded(false);
    setCurrentUrl(adUrl);
    setCanClose(false);

    const timer = setTimeout(() => setCanClose(true), AD_CLOSE_DELAY_SEC * 1000);
    return () => clearTimeout(timer);
  }, [visible, adUrl]);

  const finishLoading = useCallback(() => setPageLoaded(true), []);

  const handleNavigation = useMemo(
    () =>
      createAdNavigationHandler({
        onFallbackUrl: (fallback) => {
          setCurrentUrl(fallback);
          setPageLoaded(false);
        },
        onBlocked: finishLoading,
      }),
    [finishLoading],
  );

  const handleWebViewError = useCallback(
    (event) => {
      const { description, code } = event.nativeEvent;
      if (isUnknownSchemeError(code, description)) {
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
                style={styles.closeIconBtn}
                accessibilityRole="button"
                accessibilityLabel="Close advertisement"
              >
                <Ionicons name="close" size={16} color={colors.white} />
              </Pressable>
            ) : (
              <AdCountdownRing
                durationSeconds={AD_CLOSE_DELAY_SEC}
                active={!canClose}
                resetKey={countdownKey}
                size={34}
              />
            )}
          </View>

          <View style={styles.webviewWrap}>
            {showLoadingOverlay ? (
              <View style={styles.loadingOverlay}>
                <AdCountdownRing
                  durationSeconds={AD_CLOSE_DELAY_SEC}
                  active={!canClose}
                  resetKey={countdownKey}
                  size={64}
                />
                <Text style={styles.loadingHint}>Loading advertisement…</Text>
              </View>
            ) : null}
            {webViewSource ? (
              <WebView
                key={sessionKey}
                source={webViewSource}
                style={[styles.webview, showLoadingOverlay && styles.webviewHidden]}
                {...adWebViewProps}
                onShouldStartLoadWithRequest={handleNavigation}
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
    minHeight: 52,
  },
  headerTitle: {
    color: colors.almond,
    fontWeight: '600',
    fontSize: 14,
  },
  closeIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.redOrange,
    alignItems: 'center',
    justifyContent: 'center',
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
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
  },
  loadingHint: {
    color: colors.muted,
    fontSize: 13,
    textAlign: 'center',
  },
});
