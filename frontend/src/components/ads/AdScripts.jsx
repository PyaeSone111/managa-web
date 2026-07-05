import { useEffect } from 'react';
import {
  loadMonetagVignetteTag,
  loadMonetagInPagePushTag,
} from './monetagTags';

/**
 * Fallback for Monetag zone tags when index.html tags are missing (dev HMR).
 * Push tag lives only in index.html — do not inject via React.
 */
function AdScripts() {
  useEffect(() => {
    loadMonetagVignetteTag();
    loadMonetagInPagePushTag();
  }, []);

  return null;
}

export default AdScripts;
