import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { AD_BANNER_URL } from '../../utils/constants';
import {
  adWebViewProps,
  createAdNavigationHandler,
  isUnknownSchemeError,
} from '../../utils/adWebViewUtils';
import colors from '../../theme/colors';

const BANNER_HEIGHT = 90;
const BANNER_PADDING_V = 10;
const BANNER_PADDING_H = 12;

export default function BottomAdBanner() {
  const adUrl = AD_BANNER_URL?.trim();
  const [sessionKey, setSessionKey] = useState(0);
  const [currentUrl, setCurrentUrl] = useState(adUrl);

  const webViewSource = useMemo(() => {
    const url = currentUrl?.trim();
    if (!url || !/^https?:\/\//i.test(url)) return null;
    return { uri: url };
  }, [currentUrl]);

  const handleNavigation = useMemo(
    () =>
      createAdNavigationHandler({
        onFallbackUrl: (fallback) => {
          setCurrentUrl(fallback);
          setSessionKey((k) => k + 1);
        },
      }),
    [],
  );

  const handleWebViewError = useCallback((event) => {
    const { code, description } = event.nativeEvent;
    if (isUnknownSchemeError(code, description)) return;
  }, []);

  if (!webViewSource) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.inner}>
        <WebView
          key={sessionKey}
          source={webViewSource}
          style={styles.webview}
          scrollEnabled={false}
          bounces={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          {...adWebViewProps}
          onShouldStartLoadWithRequest={handleNavigation}
          onError={handleWebViewError}
          onHttpError={() => {}}
          renderError={() => <View style={styles.webview} />}
        />
      </View>
    </View>
  );
}

export const BOTTOM_AD_BANNER_HEIGHT = BANNER_HEIGHT + BANNER_PADDING_V * 2;

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    paddingVertical: BANNER_PADDING_V,
    paddingHorizontal: BANNER_PADDING_H,
    backgroundColor: colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.almondBorder,
  },
  inner: {
    width: '100%',
    height: BANNER_HEIGHT,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: colors.almond,
    borderWidth: 1,
    borderColor: `${colors.almondBorder}99`,
  },
  webview: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.almond,
  },
});
