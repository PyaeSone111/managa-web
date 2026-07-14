import { useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

const MIN_SCALE = 1;
const MAX_SCALE = 3.5;

function distance(touches) {
  if (!touches || touches.length < 2) return 0;
  const [a, b] = touches;
  const dx = a.pageX - b.pageX;
  const dy = a.pageY - b.pageY;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Two-finger pinch only. Parent keeps a stable scroll tree and applies zoom via page width.
 */
export default function PinchZoomView({
  children,
  scale,
  onScaleChange,
  onScaleEnd,
  style,
}) {
  const liveScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale || 1));
  const pinchRef = useRef({ startDistance: 0, startScale: 1, active: false });
  const latestScaleRef = useRef(liveScale);
  latestScaleRef.current = liveScale;

  const handlers = useMemo(
    () => ({
      onStartShouldSetResponderCapture: (evt) => evt.nativeEvent.touches.length >= 2,
      onMoveShouldSetResponderCapture: (evt) => evt.nativeEvent.touches.length >= 2,
      onResponderTerminationRequest: () => false,
      onResponderGrant: (evt) => {
        const touches = evt.nativeEvent.touches;
        if (touches.length < 2) return;
        pinchRef.current = {
          active: true,
          startDistance: distance(touches) || 1,
          startScale: latestScaleRef.current,
        };
      },
      onResponderMove: (evt) => {
        const touches = evt.nativeEvent.touches;
        if (touches.length < 2 || !pinchRef.current.active) return;
        const dist = distance(touches);
        if (!dist || !pinchRef.current.startDistance) return;
        const next = Math.min(
          MAX_SCALE,
          Math.max(MIN_SCALE, pinchRef.current.startScale * (dist / pinchRef.current.startDistance))
        );
        onScaleChange?.(next);
      },
      onResponderRelease: () => {
        if (pinchRef.current.active) {
          onScaleEnd?.(latestScaleRef.current);
        }
        pinchRef.current.active = false;
      },
      onResponderTerminate: () => {
        if (pinchRef.current.active) {
          onScaleEnd?.(latestScaleRef.current);
        }
        pinchRef.current.active = false;
      },
    }),
    [onScaleChange, onScaleEnd]
  );

  return (
    <View style={[styles.root, style]} {...handlers}>
      {children}
    </View>
  );
}

export const PINCH_SCALE_MIN = MIN_SCALE;
export const PINCH_SCALE_MAX = MAX_SCALE;

const styles = StyleSheet.create({
  root: { flex: 1 },
});
