import { createMMKV } from 'react-native-mmkv';

/**
 * Global MMKV instance — sync, low-overhead key/value storage.
 * Import this singleton everywhere; do not create per-screen instances.
 *
 * MMKV v4 API: createMMKV() (Nitro). Rebuild the native app after install.
 */
export const storage = createMMKV({
  id: 'myangar-reader',
});
