import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { toAbsoluteImageUrl } from '../../utils/helpers';
import colors from '../../theme/colors';

const DOUBLE_TAP_MS = 280;

/**
 * Full-bleed page image. Double-tap toggles fullscreen.
 * Keep loaded state across width/zoom changes — only reload when URI changes.
 */
export default function ReaderPageImage({
  uri,
  width,
  onDoubleTap,
  style,
}) {
  const [aspectRatio, setAspectRatio] = useState(2 / 3);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const lastTapRef = useRef(0);
  const measuredUriRef = useRef(null);
  const displayWidth = Math.max(1, width);

  useEffect(() => {
    if (!uri) return undefined;
    if (measuredUriRef.current === uri) return undefined;

    let cancelled = false;
    measuredUriRef.current = uri;
    setLoaded(false);
    setFailed(false);

    Image.getSize(
      uri,
      (w, h) => {
        if (!cancelled && w > 0 && h > 0) {
          setAspectRatio(w / h);
        }
      },
      () => {
        if (!cancelled) setAspectRatio(2 / 3);
      }
    );

    return () => {
      cancelled = true;
    };
  }, [uri]);

  const handlePress = () => {
    if (!onDoubleTap) return;
    const now = Date.now();
    if (now - lastTapRef.current < DOUBLE_TAP_MS) {
      lastTapRef.current = 0;
      onDoubleTap();
    } else {
      lastTapRef.current = now;
    }
  };

  return (
    <Pressable onPress={handlePress} style={[styles.wrap, { width: displayWidth }, style]}>
      {!loaded && !failed ? (
        <View style={[styles.placeholder, { width: displayWidth, aspectRatio }]}>
          <ActivityIndicator color={colors.navy} size="large" />
        </View>
      ) : null}
      {failed ? (
        <View style={[styles.placeholder, { width: displayWidth, aspectRatio }]} />
      ) : (
        <Image
          source={{ uri }}
          style={{ width: displayWidth, aspectRatio, opacity: loaded ? 1 : 0 }}
          resizeMode="contain"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      )}
    </Pressable>
  );
}

export function pageUri(page) {
  return toAbsoluteImageUrl(page?.image_url);
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'stretch',
    backgroundColor: '#000',
  },
  placeholder: {
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
