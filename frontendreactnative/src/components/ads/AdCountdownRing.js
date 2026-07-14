import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import colors from '../../theme/colors';

const DEFAULT_SIZE = 36;
const STROKE = 3;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * Seamless circular countdown via SVG strokeDashoffset (linear 1 → 0 over duration).
 */
export default function AdCountdownRing({
  durationSeconds,
  active,
  resetKey = 0,
  size = DEFAULT_SIZE,
  showSeconds = true,
}) {
  const progress = useRef(new Animated.Value(1)).current;
  const [secondsDisplay, setSecondsDisplay] = useState(durationSeconds);

  const { center, radius, circumference } = useMemo(() => {
    const r = (size - STROKE) / 2;
    return {
      center: size / 2,
      radius: r,
      circumference: 2 * Math.PI * r,
    };
  }, [size]);

  useEffect(() => {
    if (!active) {
      progress.stopAnimation();
      return undefined;
    }

    progress.setValue(1);
    setSecondsDisplay(durationSeconds);

    const listener = progress.addListener(({ value }) => {
      setSecondsDisplay(Math.max(0, Math.ceil(value * durationSeconds)));
    });

    const animation = Animated.timing(progress, {
      toValue: 0,
      duration: durationSeconds * 1000,
      easing: Easing.linear,
      useNativeDriver: false,
    });

    animation.start();

    return () => {
      progress.removeListener(listener);
      animation.stop();
    };
  }, [active, durationSeconds, resetKey, progress]);

  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="rgba(255, 255, 255, 0.22)"
          strokeWidth={STROKE}
          fill="none"
        />
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.mango}
          strokeWidth={STROKE}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          rotation={-90}
          origin={`${center}, ${center}`}
        />
      </Svg>

      {showSeconds ? (
        <Text style={[styles.seconds, { fontSize: size >= 64 ? 18 : size >= 40 ? 13 : 11 }]}>
          {secondsDisplay}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  seconds: {
    color: colors.almond,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
