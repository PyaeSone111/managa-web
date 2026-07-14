import { useEffect, useRef } from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';
import {
  READER_ORIENTATION_AUTO,
  READER_ORIENTATION_LANDSCAPE,
  READER_ORIENTATION_PORTRAIT,
} from '../utils/constants';

/**
 * Lock screen orientation while the reader is focused.
 */
export function useReaderOrientation(orientation, enabled = true) {
  const appliedRef = useRef(null);

  useEffect(() => {
    if (!enabled) return undefined;

    let cancelled = false;

    async function apply() {
      try {
        let lock = ScreenOrientation.OrientationLock.DEFAULT;
        if (orientation === READER_ORIENTATION_PORTRAIT) {
          lock = ScreenOrientation.OrientationLock.PORTRAIT_UP;
        } else if (orientation === READER_ORIENTATION_LANDSCAPE) {
          lock = ScreenOrientation.OrientationLock.LANDSCAPE;
        } else if (orientation === READER_ORIENTATION_AUTO) {
          lock = ScreenOrientation.OrientationLock.DEFAULT;
        }

        if (appliedRef.current === lock) return;
        await ScreenOrientation.lockAsync(lock);
        if (!cancelled) appliedRef.current = lock;
      } catch {
        // Native module may be unavailable in Expo Go / some builds — ignore.
      }
    }

    apply();

    return () => {
      cancelled = true;
      ScreenOrientation.unlockAsync().catch(() => {});
      appliedRef.current = null;
    };
  }, [orientation, enabled]);
}
