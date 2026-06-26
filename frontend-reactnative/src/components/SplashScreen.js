import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';

const SPLASH_DURATION_MS = 5000;
const TITLE = 'MYANGA';
const LOADER_TRACK_WIDTH = 220;

const LETTER_COLORS = [
  colors.navy,
  colors.redOrange,
  colors.navy,
  colors.navyDark,
  colors.mango,
  colors.redOrange,
];

function AnimatedLetter({ letter, anim, color }) {
  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [28, 0],
  });
  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  return (
    <Animated.Text
      style={[
        styles.letter,
        {
          color,
          opacity: anim,
          transform: [{ translateY }, { scale }],
        },
      ]}
    >
      {letter}
    </Animated.Text>
  );
}

const DOT_COLORS = [colors.navy, colors.redOrange, colors.mango];

function LoadingDots({ anims }) {
  return (
    <View style={styles.dotsRow}>
      {anims.map((anim, index) => {
        const scale = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.65, 1],
        });
        const opacity = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.35, 1],
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              { backgroundColor: DOT_COLORS[index] },
              {
                opacity,
                transform: [{ scale }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

export default function SplashScreen({ onFinish }) {
  const insets = useSafeAreaInsets();
  const letterAnims = useRef(TITLE.split('').map(() => new Animated.Value(0))).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.88)).current;
  const loaderWidth = useRef(new Animated.Value(0)).current;
  const dotAnims = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const timer = setTimeout(onFinish, SPLASH_DURATION_MS);

    Animated.stagger(
      90,
      letterAnims.map((anim) =>
        Animated.spring(anim, {
          toValue: 1,
          friction: 7,
          tension: 80,
          useNativeDriver: true,
        }),
      ),
    ).start();

    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 900,
        delay: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 8,
        tension: 60,
        delay: 500,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(loaderWidth, {
      toValue: 1,
      duration: SPLASH_DURATION_MS,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    const dotLoops = dotAnims.map((anim, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 160),
          Animated.timing(anim, {
            toValue: 1,
            duration: 420,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 420,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.delay(200),
        ]),
      ),
    );
    dotLoops.forEach((loop) => loop.start());

    return () => {
      clearTimeout(timer);
      dotLoops.forEach((loop) => loop.stop());
    };
  }, [onFinish, letterAnims, logoOpacity, logoScale, loaderWidth, dotAnims]);

  const progressWidth = loaderWidth.interpolate({
    inputRange: [0, 1],
    outputRange: [0, LOADER_TRACK_WIDTH],
  });

  return (
    <View style={styles.container}>
      <View style={styles.titleWrap}>
        <View style={styles.titleRow}>
          {TITLE.split('').map((letter, index) => (
            <AnimatedLetter
              key={`${letter}-${index}`}
              letter={letter}
              anim={letterAnims[index]}
              color={LETTER_COLORS[index]}
            />
          ))}
        </View>
        <Text style={styles.tagline}>Read. Discover. Enjoy.</Text>
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <Animated.View
          style={[
            styles.logoWrap,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Image
            source={require('../../assets/appicon.jpg')}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Myanga logo"
          />
        </Animated.View>

        <View style={styles.loaderBlock}>
          <View style={styles.loaderTrack}>
            <Animated.View style={[styles.loaderFill, { width: progressWidth }]} />
          </View>
          <LoadingDots anims={dotAnims} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    justifyContent: 'space-between',
  },
  titleWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 2,
    includeFontPadding: false,
  },
  tagline: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '600',
    color: colors.navy,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    opacity: 0.55,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 18,
  },
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 88,
    height: 88,
    borderRadius: 20,
  },
  loaderBlock: {
    width: '100%',
    alignItems: 'center',
    gap: 14,
  },
  loaderTrack: {
    width: LOADER_TRACK_WIDTH,
    height: 4,
    borderRadius: 999,
    backgroundColor: `${colors.navy}18`,
    overflow: 'hidden',
  },
  loaderFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.redOrange,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
