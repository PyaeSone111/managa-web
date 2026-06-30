import { ActivityIndicator, StyleSheet, View } from 'react-native';
import colors from '../theme/colors';

export default function LoadingSpinner({ size = 'large', style }) {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={colors.redOrange} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
});
