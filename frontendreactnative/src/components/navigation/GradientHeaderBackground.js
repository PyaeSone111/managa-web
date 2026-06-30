import LinearGradient from 'react-native-linear-gradient';
import { StyleSheet, View } from 'react-native';
import colors from '../../theme/colors';

export default function GradientHeaderBackground() {
  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={[colors.navyDark, colors.navy, '#2a5478', colors.navy]}
        locations={[0, 0.35, 0.72, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['transparent', `${colors.redOrange}33`, 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.accent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    overflow: 'hidden',
  },
  accent: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.9,
  },
});
