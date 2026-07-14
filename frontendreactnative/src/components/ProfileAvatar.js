import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from '../theme/colors';

export default function ProfileAvatar({
  name,
  imageUri,
  size = 72,
  onPress,
  loading = false,
  showEditBadge = false,
  variant = 'profile',
}) {
  const initial = name?.charAt(0)?.toUpperCase() || 'U';
  const radius = size / 2;
  const isHeader = variant === 'header';

  const badgeSize = Math.max(22, Math.round(size * 0.29));
  const badgeIconSize = Math.round(badgeSize * 0.5);

  const content = (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <View
        style={[
          styles.avatar,
          {
            width: size,
            height: size,
            borderRadius: radius,
          },
          isHeader && styles.headerAvatar,
          !imageUri && styles.fallbackAvatar,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} size="small" />
        ) : imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={[styles.image, { width: size, height: size, borderRadius: radius }]}
            resizeMode="cover"
          />
        ) : (
          <Text style={[styles.initial, { fontSize: size * 0.38 }]}>{initial}</Text>
        )}
      </View>
      {showEditBadge ? (
        <View
          style={[
            styles.badge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              right: 0,
              bottom: 0,
            },
          ]}
        >
          <Ionicons name="camera" size={badgeIconSize} color={colors.white} />
        </View>
      ) : null}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel="Update profile photo"
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  avatar: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.redOrange,
  },
  headerAvatar: {
    borderWidth: 1,
    borderColor: `${colors.white}55`,
  },
  fallbackAvatar: {
    backgroundColor: colors.redOrange,
  },
  image: {
    backgroundColor: colors.almondBorder,
  },
  initial: {
    color: colors.white,
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
