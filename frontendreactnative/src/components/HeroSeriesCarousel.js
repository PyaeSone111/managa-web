import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useBranding } from '../context/BrandingContext';
import { getCardKeyForSection, isPortraitCard } from '../utils/cardLayout';
import { toAbsoluteImageUrl } from '../utils/helpers';
import { CARD_MAP } from './cards/MangaCard';
import { seriesToManga } from '../lib/seriesToManga';
import colors from '../theme/colors';

const SLIDE_MS = 800;
const AUTO_PAUSE_MS = 1200;

function mod(n, m) {
  return ((n % m) + m) % m;
}

/** Shortest signed distance on a ring. */
function ringDelta(itemIndex, centerIndex, count) {
  let d = itemIndex - centerIndex;
  if (count <= 1) return 0;
  if (d > count / 2) d -= count;
  if (d < -count / 2) d += count;
  return d;
}

/**
 * Seamless hero carousel.
 * Cards keep stable keys; only a 0→1 progress animates.
 * On finish we bump centerIndex first and clear direction before resetting
 * progress — never reset progress while the old center is still on screen.
 */
export default function HeroSeriesCarousel({ series = [], onSeriesPress }) {
  const { width: screenWidth } = useWindowDimensions();
  const { cardLayout, layoutVersion } = useBranding();
  const centerRef = useRef(0);
  const [centerIndex, setCenterIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(0);
  const busyRef = useRef(false);
  const autoRef = useRef(null);
  const animRef = useRef(null);
  const progress = useRef(new Animated.Value(0)).current;
  const scheduleAutoRef = useRef(() => {});

  let cardKey = getCardKeyForSection('home_hero', cardLayout);
  if (!isPortraitCard(cardKey)) cardKey = 'card_01';
  const CardComponent = CARD_MAP[cardKey] || CARD_MAP.card_01;

  const source = useMemo(
    () => (Array.isArray(series) ? series.filter((s) => s?.id || s?.slug) : []),
    [series]
  );
  const count = source.length;

  const cardWidth = Math.round(Math.min(142, screenWidth * 0.36));
  const step = Math.round(cardWidth * 0.52);
  const stageHeight = Math.round(cardWidth * 0.95 + 12);
  const centerX = screenWidth / 2;

  const clearAuto = useCallback(() => {
    if (autoRef.current) {
      clearTimeout(autoRef.current);
      autoRef.current = null;
    }
  }, []);

  const runSlide = useCallback(
    (direction) => {
      if (busyRef.current || count < 2 || direction === 0) return;
      busyRef.current = true;
      clearAuto();
      progress.setValue(0);
      setSlideDirection(direction);
    },
    [clearAuto, count, progress]
  );

  // Drive the slide after direction is committed to React state.
  useEffect(() => {
    if (slideDirection === 0) return undefined;

    const direction = slideDirection;
    animRef.current?.stop?.();
    progress.setValue(0);

    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: SLIDE_MS,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    });
    animRef.current = anim;

    anim.start(({ finished }) => {
      if (!finished) {
        busyRef.current = false;
        return;
      }
      // Commit new center + clear direction. Do NOT reset progress here —
      // with direction=0, multiply(progress, 0) is already identity and
      // ringDelta(..., newCenter) matches the end of the slide (no snap-back).
      centerRef.current = mod(centerRef.current + direction, count);
      setCenterIndex(centerRef.current);
      setSlideDirection(0);
      busyRef.current = false;
      scheduleAutoRef.current();
    });

    return undefined;
  }, [slideDirection, count, progress]);

  // Reset progress only after the new center is painted.
  useLayoutEffect(() => {
    if (slideDirection !== 0) return;
    progress.setValue(0);
  }, [centerIndex, slideDirection, progress]);

  const scheduleAuto = useCallback(() => {
    clearAuto();
    if (count < 2) return;
    autoRef.current = setTimeout(() => runSlide(1), AUTO_PAUSE_MS);
  }, [clearAuto, count, runSlide]);

  scheduleAutoRef.current = scheduleAuto;

  useEffect(() => {
    animRef.current?.stop?.();
    centerRef.current = 0;
    setCenterIndex(0);
    setSlideDirection(0);
    progress.setValue(0);
    busyRef.current = false;
    scheduleAuto();
    return clearAuto;
  }, [count, cardKey, layoutVersion, clearAuto, scheduleAuto, progress]);

  const goTo = useCallback(
    (target) => {
      if (!count || busyRef.current) return;
      const clamped = mod(target, count);
      if (clamped === centerRef.current) return;
      const forward = mod(clamped - centerRef.current, count);
      const backward = mod(centerRef.current - clamped, count);
      runSlide(forward <= backward ? 1 : -1);
    },
    [count, runSlide]
  );

  // Stable paint order — no per-frame resorted (that was the lag).
  const paintOrder = useMemo(() => {
    return [...source]
      .map((item, itemIndex) => ({ item, itemIndex }))
      .sort((a, b) => {
        // Prefer the card that will sit at center after this slide.
        const prefer = slideDirection !== 0 ? slideDirection : 0;
        const va = Math.abs(ringDelta(a.itemIndex, centerIndex, count) - prefer);
        const vb = Math.abs(ringDelta(b.itemIndex, centerIndex, count) - prefer);
        return vb - va;
      });
  }, [source, centerIndex, count, slideDirection]);

  if (!count) return null;

  return (
    <View style={styles.wrap}>
      <View style={[styles.stage, { height: stageHeight }]}>
        {paintOrder.map(({ item, itemIndex }) => {
          const baseDelta = ringDelta(itemIndex, centerIndex, count);
          // When slideDirection is 0, multiply cancels progress — no snap even if progress is still 1.
          const pos = Animated.add(
            baseDelta,
            Animated.multiply(progress, -slideDirection)
          );

          const scale = pos.interpolate({
            inputRange: [-2, -1, 0, 1, 2],
            outputRange: [0.58, 0.76, 1, 0.76, 0.58],
            extrapolate: 'clamp',
          });
          const rotateY = pos.interpolate({
            inputRange: [-2, -1, 0, 1, 2],
            outputRange: ['26deg', '14deg', '0deg', '-14deg', '-26deg'],
            extrapolate: 'clamp',
          });
          const translateY = pos.interpolate({
            inputRange: [-2, -1, 0, 1, 2],
            outputRange: [8, 4, 0, 4, 8],
            extrapolate: 'clamp',
          });
          const translateX = pos.interpolate({
            inputRange: [-2, -1, 0, 1, 2],
            outputRange: [-2 * step, -step, 0, step, 2 * step],
            extrapolate: 'clamp',
          });
          const opacity = pos.interpolate({
            inputRange: [-2.6, -2, -1, 0, 1, 2, 2.6],
            outputRange: [0, 0.55, 0.82, 1, 0.82, 0.55, 0],
            extrapolate: 'clamp',
          });

          const manga = seriesToManga(item);
          const coverUri = toAbsoluteImageUrl(
            item.cover_url || item.thumbnail_url
          );
          const prefer = slideDirection !== 0 ? slideDirection : 0;
          const visualAbs = Math.abs(baseDelta - prefer);
          const zIndex = Math.round(30 - visualAbs * 10);
          const isCenter = itemIndex === centerIndex && slideDirection === 0;

          return (
            <Animated.View
              key={String(item.id ?? item.slug ?? itemIndex)}
              pointerEvents={isCenter ? 'auto' : 'none'}
              style={[
                styles.cardAbs,
                {
                  width: cardWidth,
                  left: centerX - cardWidth / 2,
                  zIndex,
                  elevation: Math.max(1, zIndex),
                  opacity,
                  transform: [
                    { perspective: 900 },
                    { translateX },
                    { translateY },
                    { scale },
                    { rotateY },
                  ],
                },
              ]}
            >
              <View style={styles.cardShadow}>
                <Pressable
                  onPress={() => onSeriesPress?.(item)}
                  style={styles.cardPress}
                >
                  {manga ? (
                    <CardComponent
                      manga={manga}
                      numColumns={4}
                      screenWidth={screenWidth}
                    />
                  ) : coverUri ? (
                    <FastImage
                      source={{ uri: coverUri, cache: FastImage.cacheControl.immutable }}
                      style={[styles.fallbackCover, { width: cardWidth }]}
                      resizeMode={FastImage.resizeMode.cover}
                    />
                  ) : (
                    <View
                      style={[styles.fallbackCover, { width: cardWidth }]}
                    />
                  )}
                </Pressable>
              </View>
            </Animated.View>
          );
        })}
      </View>

      {source[centerIndex]?.title ? (
        <Text style={styles.caption} numberOfLines={1}>
          {source[centerIndex].title}
        </Text>
      ) : null}

      <View style={styles.controls}>
        <Pressable onPress={() => runSlide(-1)} hitSlop={10} style={styles.arrowBtn}>
          <Ionicons name="chevron-back" size={18} color={colors.navy} />
        </Pressable>

        <View style={styles.dots}>
          {source.map((item, i) => (
            <Pressable
              key={String(item.id ?? i)}
              onPress={() => goTo(i)}
              style={[styles.dot, i === centerIndex && styles.dotActive]}
            />
          ))}
        </View>

        <Pressable onPress={() => runSlide(1)} hitSlop={10} style={styles.arrowBtn}>
          <Ionicons name="chevron-forward" size={18} color={colors.navy} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: 'transparent',
    marginBottom: 0,
    paddingTop: 12,
    paddingBottom: 12,
  },
  stage: {
    width: '100%',
    position: 'relative',
    overflow: 'visible',
  },
  cardAbs: {
    position: 'absolute',
    top: 0,
  },
  cardShadow: {
    borderRadius: 10,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  cardPress: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  fallbackCover: {
    aspectRatio: 2 / 3,
    borderRadius: 10,
    backgroundColor: colors.almondBorder,
  },
  caption: {
    textAlign: 'center',
    color: colors.navy,
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 4,
    paddingBottom: 2,
  },
  arrowBtn: {
    padding: 2,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: `${colors.muted}55`,
  },
  dotActive: {
    backgroundColor: colors.redOrange,
    width: 7,
    height: 7,
  },
});
