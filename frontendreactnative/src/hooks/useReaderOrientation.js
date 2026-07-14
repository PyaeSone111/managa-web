import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import {
  READER_ORIENTATION_AUTO,
  READER_ORIENTATION_LANDSCAPE,
  READER_ORIENTATION_PORTRAIT,
} from '../utils/constants';

/**
 * Reader orientation preference without native lock modules.
 * Uses window size so Portrait/Landscape still affect page layout on a bare RN app.
 */
export function useReaderOrientation(orientation) {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const shortest = Math.min(width, height);
    const longest = Math.max(width, height);
    const isDeviceLandscape = width > height;

    if (orientation === READER_ORIENTATION_PORTRAIT) {
      return {
        contentWidth: shortest,
        isLandscapeLayout: false,
        rotateHint: isDeviceLandscape
          ? 'Rotate to portrait for the intended layout'
          : null,
      };
    }

    if (orientation === READER_ORIENTATION_LANDSCAPE) {
      return {
        contentWidth: longest,
        isLandscapeLayout: true,
        rotateHint: !isDeviceLandscape
          ? 'Rotate to landscape for a wider view'
          : null,
      };
    }

    // auto
    return {
      contentWidth: width,
      isLandscapeLayout: isDeviceLandscape,
      rotateHint: null,
      orientation: READER_ORIENTATION_AUTO,
    };
  }, [height, orientation, width]);
}
