import { useEffect } from 'react';
import { AppState, BackHandler } from 'react-native';
import { useBranding } from '../context/BrandingContext';
import { APP_VERSION, isUpdateRequired } from '../utils/appVersion';
import ForceUpdateScreen from './ForceUpdateScreen';
import LoadingSpinner from './LoadingSpinner';

export default function ForceUpdateGate({ children }) {
  const { appDownload, brandingReady, refetchBranding } = useBranding();
  const needsUpdate = brandingReady && isUpdateRequired(APP_VERSION, appDownload.version);

  useEffect(() => {
    if (!needsUpdate) return undefined;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => subscription.remove();
  }, [needsUpdate]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        refetchBranding();
      }
    });

    return () => subscription.remove();
  }, [refetchBranding]);

  if (!brandingReady) {
    return <LoadingSpinner />;
  }

  if (needsUpdate) {
    return <ForceUpdateScreen appDownload={appDownload} installedVersion={APP_VERSION} />;
  }

  return children;
}
