import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { toAbsoluteImageUrl } from '../../utils/helpers';
import colors from '../../theme/colors';

/** Persist measured ratios so reopen / chapter rewind doesn't reflow. */
const ASPECT_CACHE = new Map();
const DEFAULT_ASPECT = 2 / 3;
/** Keep spinner on screen long enough to actually paint (onLoad is often <50ms). */
const MIN_SPINNER_MS = 280;

/**
 * Page image only — orange spinner + "Loading page…" for *image* decode.
 * Bitmap mount is delayed one frame so the spinner always paints first.
 */
export default function ReaderPageImage({
  uri,
  width,
  naturalWidth,
  naturalHeight,
  active = true,
  onTap,
  onDoubleTap,
  style,
}) {
  const displayWidth = Math.max(1, width);
  const tapHandler = onTap || onDoubleTap;

  /** API-provided dimensions skip the extra getSize() probe request entirely. */
  const apiAspect =
    naturalWidth > 0 && naturalHeight > 0 ? naturalWidth / naturalHeight : null;
  const cached = uri ? ASPECT_CACHE.get(uri) : null;
  const [aspectRatio, setAspectRatio] = useState(apiAspect ?? cached ?? DEFAULT_ASPECT);
  const [phase, setPhase] = useState('loading');
  const [attempt, setAttempt] = useState(0);
  /** Delay Image mount so overlay paints before decode / instant onLoad. */
  const [mountImage, setMountImage] = useState(false);
  const loadStartedAtRef = useRef(0);
  const readyTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (readyTimerRef.current) clearTimeout(readyTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (readyTimerRef.current) {
      clearTimeout(readyTimerRef.current);
      readyTimerRef.current = null;
    }

    if (!active) {
      setMountImage(false);
      setPhase('loading');
      return undefined;
    }

    if (!uri) {
      setMountImage(false);
      setPhase('error');
      return undefined;
    }

    loadStartedAtRef.current = Date.now();
    setPhase('loading');
    setMountImage(false);

    // Paint spinner this frame; mount Image on the next frame.
    let cancelled = false;
    const raf = requestAnimationFrame(() => {
      if (cancelled) return;
      requestAnimationFrame(() => {
        if (cancelled) return;
        setMountImage(true);
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [active, uri, attempt]);

  useEffect(() => {
    if (!uri) return undefined;

    // API already supplied dimensions — no need to probe the image separately.
    if (apiAspect) {
      ASPECT_CACHE.set(uri, apiAspect);
      setAspectRatio(apiAspect);
      return undefined;
    }

    let cancelled = false;
    const known = ASPECT_CACHE.get(uri);
    if (known) {
      setAspectRatio(known);
      return undefined;
    }

    // Fallback for pages imported before dimensions were backfilled.
    Image.getSize(
      uri,
      (w, h) => {
        if (cancelled || !(w > 0 && h > 0)) return;
        const ar = w / h;
        ASPECT_CACHE.set(uri, ar);
        setAspectRatio(ar);
      },
      () => {
        if (!cancelled) setAspectRatio(DEFAULT_ASPECT);
      }
    );

    return () => {
      cancelled = true;
    };
  }, [uri, apiAspect]);

  const frameHeight = useMemo(() => {
    const ar = aspectRatio > 0 ? aspectRatio : DEFAULT_ASPECT;
    return Math.max(160, displayWidth / ar);
  }, [aspectRatio, displayWidth]);

  const frameStyle = useMemo(
    () => ({ width: displayWidth, height: frameHeight }),
    [displayWidth, frameHeight]
  );

  const markReady = () => {
    const elapsed = Date.now() - (loadStartedAtRef.current || Date.now());
    const wait = Math.max(0, MIN_SPINNER_MS - elapsed);
    if (readyTimerRef.current) clearTimeout(readyTimerRef.current);
    readyTimerRef.current = setTimeout(() => {
      setPhase('ready');
      readyTimerRef.current = null;
    }, wait);
  };

  const handleReload = () => {
    if (uri) ASPECT_CACHE.delete(uri);
    setAttempt((n) => n + 1);
  };

  const showSpinner = active && phase === 'loading';
  const showError = active && phase === 'error';
  const showImage = active && mountImage && Boolean(uri) && phase !== 'error';

  return (
    <View style={[styles.wrap, frameStyle, style]} collapsable={false}>
      {showImage ? (
        <FastImage
          key={`img-${attempt}-${uri}`}
          source={{
            uri,
            priority: FastImage.priority.normal,
            cache: FastImage.cacheControl.immutable,
          }}
          style={styles.image}
          resizeMode={FastImage.resizeMode.contain}
          pointerEvents="none"
          onLoad={markReady}
          onError={() => {
            if (readyTimerRef.current) {
              clearTimeout(readyTimerRef.current);
              readyTimerRef.current = null;
            }
            setPhase('error');
          }}
        />
      ) : null}

      {!active ? (
        <View style={styles.inactivePlaceholder} pointerEvents="none">
          <Text style={styles.inactiveHint}>…</Text>
        </View>
      ) : null}

      {/* Always catch taps to restore chrome (fullscreen), except on Reload. */}
      {!showError && tapHandler ? (
        <Pressable
          onPress={tapHandler}
          style={styles.tapCatcher}
          accessibilityRole="button"
          accessibilityLabel="Toggle reader controls"
        />
      ) : null}

      {showSpinner ? (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color={colors.redOrange} />
          <Text style={styles.loadingHint}>Loading page…</Text>
        </View>
      ) : null}

      {showError ? (
        <View style={styles.failedBox} collapsable={false}>
          {tapHandler ? (
            <Pressable
              onPress={tapHandler}
              style={StyleSheet.absoluteFillObject}
              accessibilityRole="button"
              accessibilityLabel="Toggle reader controls"
            />
          ) : null}
          <Ionicons
            name="cloud-offline-outline"
            size={28}
            color="rgba(255,255,255,0.55)"
          />
          <Text style={styles.failedText}>Image failed to load</Text>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handleReload}
            style={styles.reloadBtn}
            accessibilityRole="button"
            accessibilityLabel="Reload image"
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Ionicons name="refresh" size={16} color={colors.white} />
            <Text style={styles.reloadText}>Reload</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

export function pageUri(page) {
  return toAbsoluteImageUrl(page?.image_url);
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'stretch',
    backgroundColor: '#111',
    overflow: 'hidden',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  inactivePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0d0d0d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveHint: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 24,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    elevation: 20,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingHint: {
    color: colors.redOrange,
    fontSize: 14,
    fontWeight: '600',
  },
  failedBox: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 25,
    elevation: 25,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  failedText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    textAlign: 'center',
  },
  reloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.redOrange,
  },
  reloadText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  tapCatcher: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
    elevation: 5,
  },
});
