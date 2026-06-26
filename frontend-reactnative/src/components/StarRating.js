import { Pressable, StyleSheet, Text, View } from 'react-native';
import colors from '../theme/colors';

const MIN_TOUCH_TARGET = 44;

export default function StarRating({
  rating = 0,
  onRate,
  interactive = false,
  size = interactive ? 30 : 20,
}) {
  const touchPadding = interactive
    ? Math.max(4, (MIN_TOUCH_TARGET - size) / 2)
    : 0;

  return (
    <View style={[styles.row, interactive && styles.rowInteractive]}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= rating;

        if (!interactive) {
          return (
            <View key={star} style={styles.starDisplay}>
              <Text
                style={{
                  fontSize: size,
                  color: filled ? colors.redOrange : colors.almondBorder,
                }}
              >
                ★
              </Text>
            </View>
          );
        }

        return (
          <Pressable
            key={star}
            onPress={() => onRate?.(star)}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            style={({ pressed }) => [
              styles.starTouchable,
              {
                minWidth: MIN_TOUCH_TARGET,
                minHeight: MIN_TOUCH_TARGET,
                paddingHorizontal: touchPadding,
              },
              pressed && styles.starPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Rate ${star} out of 5 stars`}
          >
            <Text
              style={{
                fontSize: size,
                lineHeight: size + 4,
                color: filled ? colors.redOrange : colors.almondBorder,
              }}
            >
              ★
            </Text>
          </Pressable>
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
  rowInteractive: {
    marginVertical: -4,
  },
  starDisplay: {
    marginRight: 2,
  },
  starTouchable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  starPressed: {
    opacity: 0.65,
    transform: [{ scale: 1.12 }],
  },
});
