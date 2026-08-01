import { Image, StyleSheet, Text, View } from 'react-native';
import { useBranding } from '../../context/BrandingContext';
import colors from '../../theme/colors';

export const HEADER_HORIZONTAL_PADDING = 14;

/** Compact logo + page label for navigation header (left side). */
export default function HeaderBrandLogo({ fallbackTitle = 'Myangar', subtitle }) {
  const { logoUrl } = useBranding();

  return (
    <View style={styles.wrap}>
      {logoUrl ? (
        <Image
          source={{ uri: logoUrl }}
          style={styles.logo}
          resizeMode="contain"
          accessibilityRole="image"
          accessibilityLabel={fallbackTitle}
        />
      ) : (
        <Text style={styles.fallback} numberOfLines={1}>
          {fallbackTitle}
        </Text>
      )}
      {subtitle ? (
        <Text style={styles.subtitle} numberOfLines={1} ellipsizeMode="tail">
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

/** Centered main logo for auth cards and profile page. */
export function AuthCardLogo({ fallbackTitle = 'Myangar' }) {
  const { logoUrl } = useBranding();

  return (
    <View style={styles.authCardWrap}>
      {logoUrl ? (
        <Image
          source={{ uri: logoUrl }}
          style={styles.authCardLogo}
          resizeMode="contain"
          accessibilityRole="image"
          accessibilityLabel={fallbackTitle}
        />
      ) : (
        <Text style={styles.authCardFallback}>{fallbackTitle}</Text>
      )}
    </View>
  );
}

/** Centered main logo for the profile page body. */
export function ProfilePageLogo({ fallbackTitle = 'Myangar' }) {
  const { logoUrl } = useBranding();

  return (
    <View style={styles.profileWrap}>
      {logoUrl ? (
        <Image
          source={{ uri: logoUrl }}
          style={styles.profileLogo}
          resizeMode="contain"
          accessibilityRole="image"
          accessibilityLabel={fallbackTitle}
        />
      ) : (
        <Text style={styles.profileFallback}>{fallbackTitle}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    maxWidth: '100%',
    gap: 6,
    paddingBottom: 4,
    paddingRight: 8,
    flexShrink: 1,
    minWidth: 0,
  },
  logo: {
    height: 28,
    width: 100,
    flexShrink: 0,
  },
  fallback: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    paddingBottom: 1,
    flexShrink: 0,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.82)',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.2,
    paddingBottom: 2,
    flexShrink: 1,
    flexGrow: 0,
    minWidth: 0,
    maxWidth: 140,
  },
  profileWrap: {
    alignItems: 'center',
    paddingBottom: 16,
    width: '100%',
  },
  authCardWrap: {
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 16,
    paddingHorizontal: 12,
  },
  authCardLogo: {
    height: 48,
    width: 160,
  },
  authCardFallback: {
    color: colors.navy,
    fontSize: 24,
    fontWeight: '700',
  },
  profileLogo: {
    height: 52,
    width: 180,
  },
  profileFallback: {
    color: colors.navy,
    fontSize: 26,
    fontWeight: '700',
  },
});
