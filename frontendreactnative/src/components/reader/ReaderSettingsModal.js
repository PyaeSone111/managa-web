import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  READER_MODE_PAGED,
  READER_MODE_SCROLL,
  READER_ORIENTATION_AUTO,
  READER_ORIENTATION_LANDSCAPE,
  READER_ORIENTATION_PORTRAIT,
} from '../../utils/constants';
import colors from '../../theme/colors';

function OptionRow({ label, active, onPress, icon }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        active && styles.optionActive,
        pressed && styles.optionPressed,
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={16}
          color={active ? colors.white : colors.navy}
        />
      ) : null}
      <Text style={[styles.optionText, active && styles.optionTextActive]}>{label}</Text>
    </Pressable>
  );
}

export default function ReaderSettingsModal({
  visible,
  onClose,
  mode,
  orientation,
  scale,
  fullscreen,
  onModeChange,
  onOrientationChange,
  onResetZoom,
  onToggleFullscreen,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Reader settings</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color={colors.navy} />
            </Pressable>
          </View>

          <Text style={styles.section}>Reading mode</Text>
          <View style={styles.row}>
            <OptionRow
              label="Scroll"
              icon="swap-vertical-outline"
              active={mode === READER_MODE_SCROLL}
              onPress={() => onModeChange(READER_MODE_SCROLL)}
            />
            <OptionRow
              label="1 Page"
              icon="document-outline"
              active={mode === READER_MODE_PAGED}
              onPress={() => onModeChange(READER_MODE_PAGED)}
            />
          </View>

          <Text style={styles.section}>Orientation</Text>
          <View style={styles.row}>
            <OptionRow
              label="Auto"
              icon="phone-portrait-outline"
              active={orientation === READER_ORIENTATION_AUTO}
              onPress={() => onOrientationChange(READER_ORIENTATION_AUTO)}
            />
            <OptionRow
              label="Portrait"
              icon="phone-portrait-outline"
              active={orientation === READER_ORIENTATION_PORTRAIT}
              onPress={() => onOrientationChange(READER_ORIENTATION_PORTRAIT)}
            />
            <OptionRow
              label="Landscape"
              icon="phone-landscape-outline"
              active={orientation === READER_ORIENTATION_LANDSCAPE}
              onPress={() => onOrientationChange(READER_ORIENTATION_LANDSCAPE)}
            />
          </View>

          <Text style={styles.section}>Display</Text>
          <Pressable style={styles.resetBtn} onPress={onToggleFullscreen}>
            <Text style={styles.resetText}>
              {fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            </Text>
          </Pressable>
          <Text style={styles.hint}>
            Tip: double-tap a page to toggle fullscreen. Pinch with two fingers to zoom
            ({Math.round((scale || 1) * 100)}%).
          </Text>
          <Pressable style={[styles.resetBtn, styles.resetBtnSpaced]} onPress={onResetZoom}>
            <Text style={styles.resetText}>Reset zoom to 100%</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderColor: colors.almondBorder,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.navy,
  },
  section: {
    marginTop: 10,
    marginBottom: 8,
    fontSize: 12,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.almondBorder,
    backgroundColor: colors.almond,
  },
  optionActive: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  optionPressed: {
    opacity: 0.85,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.navy,
  },
  optionTextActive: {
    color: colors.white,
  },
  hint: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
    marginBottom: 10,
  },
  resetBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: colors.almond,
    borderWidth: 1,
    borderColor: colors.almondBorder,
  },
  resetBtnSpaced: {
    marginTop: 8,
  },
  resetText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.navy,
  },
});
