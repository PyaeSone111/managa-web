import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { toAbsoluteImageUrl } from '../../utils/helpers';
import colors from '../../theme/colors';

/**
 * Single page image with optional double-tap zoom bump and measured aspect ratio.
 */
export default function ReaderPageImage({
  uri,
  width,
  scale = 1,
  onPress,
  style,
}) {
  const [aspectRatio, setAspectRatio] = useState(2 / 3);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const displayWidth = Math.max(1, width * scale);

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    setFailed(false);

    if (!uri) return undefined;

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

  return (
    <Pressable
      onPress={onPress}
      style={[styles.wrap, { width: displayWidth }, style]}
    >
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
    alignSelf: 'center',
    backgroundColor: colors.white,
  },
  placeholder: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.almondBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
