import { useCallback, useState } from 'react';
import { StatusBar } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// import MonetagAdView from './src/components/MonetagAdView';
import ForceUpdateGate from './src/components/ForceUpdateGate';
import SplashScreen from './src/components/SplashScreen';
import { AuthProvider } from './src/context/AuthContext';
import { ProfileImageProvider } from './src/context/ProfileImageContext';
import { BrandingProvider } from './src/context/BrandingContext';
import AppNavigator from './src/navigation/AppNavigator';
import colors from './src/theme/colors';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  // const [showLaunchAd, setShowLaunchAd] = useState(false);

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
    // setShowLaunchAd(true);
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ProfileImageProvider>
            <BrandingProvider>
            <StatusBar
              barStyle={showSplash ? 'dark-content' : 'light-content'}
              backgroundColor={showSplash ? colors.white : colors.navy}
            />
            {showSplash ? (
              <SplashScreen onFinish={handleSplashFinish} />
            ) : (
              <ForceUpdateGate>
                <AppNavigator />
                {/* <MonetagAdView
                  visible={showLaunchAd}
                  onClose={() => setShowLaunchAd(false)}
                /> */}
              </ForceUpdateGate>
            )}
            </BrandingProvider>
          </ProfileImageProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
