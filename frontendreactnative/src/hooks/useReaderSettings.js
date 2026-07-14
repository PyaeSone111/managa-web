import { useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_READER_SETTINGS,
  READER_MODE_SCROLL,
  READER_ORIENTATION_AUTO,
  READER_ORIENTATION_LANDSCAPE,
  READER_ORIENTATION_PORTRAIT,
  READER_SETTINGS_KEY,
} from '../utils/constants';
import { getJson, setJson } from '../services/storage';

const SCALE_MIN = 1;
const SCALE_MAX = 3;
const SCALE_STEP = 0.25;

export function clampScale(value) {
  const rounded = Math.round(value / SCALE_STEP) * SCALE_STEP;
  return Math.min(SCALE_MAX, Math.max(SCALE_MIN, Number(rounded.toFixed(2))));
}

export function useReaderSettings() {
  const [settings, setSettings] = useState(DEFAULT_READER_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const saved = await getJson(READER_SETTINGS_KEY, null);
      if (!cancelled) {
        setSettings({
          ...DEFAULT_READER_SETTINGS,
          ...(saved || {}),
          scale: clampScale(saved?.scale ?? DEFAULT_READER_SETTINGS.scale),
        });
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(async (next) => {
    setSettings(next);
    await setJson(READER_SETTINGS_KEY, next);
  }, []);

  const setMode = useCallback(
    (mode) => persist({ ...settings, mode: mode || READER_MODE_SCROLL }),
    [persist, settings]
  );

  const setOrientation = useCallback(
    (orientation) =>
      persist({
        ...settings,
        orientation: orientation || READER_ORIENTATION_AUTO,
      }),
    [persist, settings]
  );

  const setScale = useCallback(
    (scale) => persist({ ...settings, scale: clampScale(scale) }),
    [persist, settings]
  );

  const zoomIn = useCallback(() => setScale(settings.scale + SCALE_STEP), [setScale, settings.scale]);
  const zoomOut = useCallback(() => setScale(settings.scale - SCALE_STEP), [setScale, settings.scale]);
  const resetZoom = useCallback(() => setScale(1), [setScale]);

  const cycleOrientation = useCallback(() => {
    const order = [
      READER_ORIENTATION_AUTO,
      READER_ORIENTATION_PORTRAIT,
      READER_ORIENTATION_LANDSCAPE,
    ];
    const idx = order.indexOf(settings.orientation);
    setOrientation(order[(idx + 1) % order.length]);
  }, [setOrientation, settings.orientation]);

  return {
    settings,
    ready,
    setMode,
    setOrientation,
    setScale,
    zoomIn,
    zoomOut,
    resetZoom,
    cycleOrientation,
    SCALE_MIN,
    SCALE_MAX,
  };
}
