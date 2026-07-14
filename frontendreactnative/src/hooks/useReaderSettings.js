import { useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_READER_SETTINGS,
  READER_MODE_SCROLL,
  READER_ORIENTATION_AUTO,
  READER_SETTINGS_KEY,
} from '../utils/constants';
import { getJson, setJson } from '../services/storage';

const SCALE_MIN = 1;
const SCALE_MAX = 3.5;

export function clampScale(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 1;
  return Math.min(SCALE_MAX, Math.max(SCALE_MIN, n));
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

  /** Live zoom during pinch — no AsyncStorage write. */
  const setScaleLive = useCallback((scale) => {
    const next = clampScale(scale);
    setSettings((prev) => (prev.scale === next ? prev : { ...prev, scale: next }));
  }, []);

  /** Persist zoom (call on pinch end / reset). */
  const commitScale = useCallback((scale) => {
    const next = clampScale(scale ?? 1);
    setSettings((prev) => {
      const merged = { ...prev, scale: next };
      setJson(READER_SETTINGS_KEY, merged);
      return merged;
    });
  }, []);

  const resetZoom = useCallback(() => commitScale(1), [commitScale]);

  return {
    settings,
    ready,
    setMode,
    setOrientation,
    setScaleLive,
    commitScale,
    resetZoom,
    SCALE_MIN,
    SCALE_MAX,
  };
}
