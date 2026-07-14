import { StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from '../../theme/colors';

const VARIANTS = {
  login: {
    eyebrow: 'Welcome back',
    title: 'Sign In',
    icon: 'log-in-outline',
  },
  register: {
    eyebrow: 'Get started',
    title: 'Create Account',
    icon: 'person-add-outline',
  },
  favorites: {
    eyebrow: 'Your collection',
    title: 'Favorites',
    icon: 'heart-outline',
  },
  profile: {
    eyebrow: 'Your account',
    title: 'Profile',
    icon: 'person-outline',
  },
  appInfo: {
    eyebrow: 'Mobile app',
    title: 'Application Information',
    icon: 'information-circle-outline',
  },
};

export default function AuthCardTitle({ variant = 'login', compact = false }) {
  const config = VARIANTS[variant] || VARIANTS.login;

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <Text style={styles.eyebrow}>{config.eyebrow}</Text>
      <View style={styles.titleRow}>
        <Ionicons name={config.icon} size={22} color={colors.redOrange} />
        <Text style={styles.title}>{config.title}</Text>
      </View>
      <View style={styles.divider}>
        <View style={[styles.dividerSegment, styles.dividerNavy]} />
        <View style={[styles.dividerSegment, styles.dividerMango]} />
        <View style={[styles.dividerSegment, styles.dividerOrange]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginBottom: 20,
  },
  wrapCompact: {
    marginBottom: 16,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.redOrange,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.navy,
    letterSpacing: 0.3,
  },
  divider: {
    flexDirection: 'row',
    width: 56,
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 10,
  },
  dividerSegment: {
    flex: 1,
  },
  dividerNavy: {
    backgroundColor: colors.navy,
  },
  dividerMango: {
    backgroundColor: colors.mango,
  },
  dividerOrange: {
    backgroundColor: colors.redOrange,
  },
});
