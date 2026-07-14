import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from '../../theme/colors';

/**
 * Compact reader chrome — page indicator + settings.
 * Mode / orientation live in the settings sheet.
 */
export default function ReaderToolbar({ pageLabel, onOpenSettings }) {
  return (
    <View style={styles.bar}>
      <Text style={styles.pageLabel}>{pageLabel || ' '}</Text>
      <Pressable
        onPress={onOpenSettings}
        style={({ pressed }) => [styles.settingsBtn, pressed && styles.settingsPressed]}
        accessibilityRole="button"
        accessibilityLabel="Reader settings"
      >
        <Ionicons name="settings-outline" size={18} color={colors.navy} />
        <Text style={styles.settingsText}>Settings</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.almondBorder,
    backgroundColor: colors.white,
  },
  pageLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted,
  },
  settingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.almond,
    borderWidth: 1,
    borderColor: colors.almondBorder,
  },
  settingsPressed: {
    opacity: 0.8,
  },
  settingsText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.navy,
  },
});
