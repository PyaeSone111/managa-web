import { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import colors from '../theme/colors';

const SPLASH_DURATION_MS = 5000;

export default function SplashScreen({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(onFinish, SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/appicon.jpg')}
        style={styles.logo}
        resizeMode="contain"
        accessibilityLabel="Myanga"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.almond,
    paddingHorizontal: 32,
  },
  logo: {
    width: 260,
    height: 260,
  },
});
