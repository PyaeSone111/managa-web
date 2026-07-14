import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from '../../theme/colors';

export function ThemeAccentBar({ width = 120, style }) {
  return (
    <View style={[styles.themeBar, width != null && { width }, style]}>
      <View style={[styles.themeSeg, styles.segNavy]} />
      <View style={[styles.themeSeg, styles.segMango]} />
      <View style={[styles.themeSeg, styles.segOrange]} />
    </View>
  );
}

export function ThemedNavButton({
  label,
  icon,
  disabled = false,
  onPress,
  variant = 'outline',
  style,
}) {
  const isPrimary = variant === 'primary';
  const iconColor = disabled ? colors.muted : isPrimary ? colors.white : colors.navy;

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.navBtn,
        isPrimary ? styles.navBtnPrimary : styles.navBtnOutline,
        disabled && styles.navBtnDisabled,
        pressed && !disabled && styles.navBtnPressed,
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      {icon === 'back' ? <Ionicons name="chevron-back" size={16} color={iconColor} /> : null}
      <Text
        style={[
          styles.navBtnText,
          isPrimary ? styles.navBtnTextPrimary : styles.navBtnTextOutline,
          disabled && styles.navBtnTextDisabled,
        ]}
      >
        {label}
      </Text>
      {icon === 'forward' ? <Ionicons name="chevron-forward" size={16} color={iconColor} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  themeBar: {
    flexDirection: 'row',
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  themeSeg: {
    flex: 1,
  },
  segNavy: {
    backgroundColor: colors.navy,
  },
  segMango: {
    backgroundColor: colors.mango,
  },
  segOrange: {
    backgroundColor: colors.redOrange,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    minWidth: 72,
    justifyContent: 'center',
  },
  navBtnOutline: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: `${colors.navy}55`,
  },
  navBtnPrimary: {
    backgroundColor: colors.redOrange,
    borderWidth: 1,
    borderColor: colors.redOrange,
  },
  navBtnDisabled: {
    opacity: 0.42,
  },
  navBtnPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
  navBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  navBtnTextOutline: {
    color: colors.navy,
  },
  navBtnTextPrimary: {
    color: colors.white,
  },
  navBtnTextDisabled: {
    color: colors.muted,
  },
});
