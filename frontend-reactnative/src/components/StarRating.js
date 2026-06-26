import { Pressable, StyleSheet, Text, View } from 'react-native';
import colors from '../theme/colors';

export default function StarRating({ rating = 0, onRate, interactive = false, size = 20 }) {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= rating;
        const StarButton = interactive ? Pressable : View;
        return (
          <StarButton
            key={star}
            onPress={interactive && onRate ? () => onRate(star) : undefined}
            style={styles.star}
          >
            <Text style={{ fontSize: size, color: filled ? colors.redOrange : colors.almondBorder }}>
              ★
            </Text>
          </StarButton>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: 2,
  },
});
