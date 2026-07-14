import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MangaCard from './cards/MangaCard';
import { useBranding } from '../context/BrandingContext';
import { getCardKeyForSection } from '../utils/cardLayout';
import colors from '../theme/colors';

/**
 * Peek-side carousel with scale + rotateY 3D, portrait MangaCard from branding home_hero.
 */
export default function HeroSeriesCarousel({ series = [], onSeriesPress }) {
  const { width: screenWidth } = useWindowDimensions();
  const { cardLayout, heroBackgroundUrl } = useBranding();
  const cardKey = getCardKeyForSection('home_hero', cardLayout);
  const scrollX = useRef(new Animated.Value(0)).current;
  const listRef = useRef(null);
  const [index, setIndex] = useState(0);

  const itemWidth = Math.round(Math.min(220, screenWidth * 0.52));
  const sidePad = Math.max(24, (screenWidth - itemWidth) / 2);
  const snapInterval = itemWidth;

  const data = useMemo(
    () => (Array.isArray(series) ? series.filter(Boolean) : []),
    [series]
  );

  useEffect(() => {
    setIndex(0);
    listRef.current?.scrollToOffset?.({ offset: 0, animated: false });
  }, [data.length]);

  const goTo = useCallback(
    (next) => {
      if (!data.length) return;
      const clamped = Math.max(0, Math.min(data.length - 1, next));
      listRef.current?.scrollToOffset?.({
        offset: clamped * snapInterval,
        animated: true,
      });
      setIndex(clamped);
    },
    [data.length, snapInterval]
  );

  if (!data.length) return null;

  return (
    <View style={styles.wrap}>
      {heroBackgroundUrl ? (
        <Animated.Image
          source={{ uri: heroBackgroundUrl }}
          style={styles.bg}
          blurRadius={8}
        />
      ) : (
        <View style={[styles.bg, styles.bgSolid]} />
      )}
      <View style={styles.bgDim} />

      <Animated.FlatList
        ref={listRef}
        data={data}
        keyExtractor={(item) => String(item.id ?? item.slug)}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={snapInterval}
        snapToAlignment="start"
        disableIntervalMomentum
        contentContainerStyle={{ paddingHorizontal: sidePad, paddingVertical: 18 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => {
          const x = e.nativeEvent.contentOffset.x;
          const next = Math.round(x / snapInterval);
          setIndex(Math.max(0, Math.min(data.length - 1, next)));
        }}
        getItemLayout={(_, i) => ({
          length: snapInterval,
          offset: snapInterval * i,
          index: i,
        })}
        renderItem={({ item, index: i }) => {
          const inputRange = [
            (i - 1) * snapInterval,
            i * snapInterval,
            (i + 1) * snapInterval,
          ];
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.82, 1, 0.82],
            extrapolate: 'clamp',
          });
          const rotateY = scrollX.interpolate({
            inputRange,
            outputRange: ['32deg', '0deg', '-32deg'],
            extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.65, 1, 0.65],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              style={[
                styles.item,
                {
                  width: itemWidth,
                  opacity,
                  transform: [
                    { perspective: 900 },
                    { scale },
                    { rotateY },
                  ],
                },
              ]}
            >
              <MangaCard
                series={item}
                section="home_hero"
                cardKey={cardKey}
                onPress={onSeriesPress}
                style={{ width: '100%', margin: 0, flex: 0 }}
                numColumns={2}
                screenWidth={screenWidth}
              />
            </Animated.View>
          );
        }}
      />

      <View style={styles.controls}>
        <Pressable
          onPress={() => goTo(index - 1)}
          disabled={index <= 0}
          hitSlop={10}
          style={styles.arrowBtn}
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color={index <= 0 ? '#888' : colors.white}
          />
        </Pressable>

        <View style={styles.dots}>
          {data.map((item, i) => (
            <Pressable
              key={String(item.id ?? i)}
              onPress={() => goTo(i)}
              style={[styles.dot, i === index && styles.dotActive]}
            />
          ))}
        </View>

        <Pressable
          onPress={() => goTo(index + 1)}
          disabled={index >= data.length - 1}
          hitSlop={10}
          style={styles.arrowBtn}
        >
          <Ionicons
            name="chevron-forward"
            size={22}
            color={index >= data.length - 1 ? '#888' : colors.white}
          />
        </Pressable>
      </View>

      {data[index]?.title ? (
        <Text style={styles.caption} numberOfLines={1}>
          {data[index].title}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    marginBottom: 4,
    backgroundColor: colors.navy,
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  bgSolid: {
    backgroundColor: colors.navy,
  },
  bgDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 16, 36, 0.55)',
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  arrowBtn: {
    padding: 4,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  dotActive: {
    backgroundColor: colors.redOrange,
    width: 8,
    height: 8,
  },
  caption: {
    textAlign: 'center',
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
});
