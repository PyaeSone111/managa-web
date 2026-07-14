import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  READER_MODE_PAGED,
  READER_MODE_SCROLL,
  READER_ORIENTATION_AUTO,
  READER_ORIENTATION_LANDSCAPE,
  READER_ORIENTATION_PORTRAIT,
} from '../../utils/constants';
import colors from '../../theme/colors';

function Chip({ active, label, icon, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active && styles.chipActive,
        pressed && styles.chipPressed,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={14}
          color={active ? colors.white : colors.navy}
        />
      ) : null}
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function orientationLabel(orientation) {
  if (orientation === READER_ORIENTATION_PORTRAIT) return 'Portrait';
  if (orientation === READER_ORIENTATION_LANDSCAPE) return 'Landscape';
  return 'Auto';
}

function orientationIcon(orientation) {
  if (orientation === READER_ORIENTATION_PORTRAIT) return 'phone-portrait-outline';
  if (orientation === READER_ORIENTATION_LANDSCAPE) return 'phone-landscape-outline';
  return 'phone-portrait-outline';
}

export default function ReaderToolbar({
  mode,
  orientation,
  scale,
  pageLabel,
  onModeChange,
  onCycleOrientation,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}) {
  return (
    <View style={styles.bar}>
      <View style={styles.row}>
        <Chip
          active={mode === READER_MODE_SCROLL}
          label="Scroll"
          icon="swap-vertical-outline"
          onPress={() => onModeChange(READER_MODE_SCROLL)}
        />
        <Chip
          active={mode === READER_MODE_PAGED}
          label="1 Page"
          icon="document-outline"
          onPress={() => onModeChange(READER_MODE_PAGED)}
        />
        <Chip
          active={orientation !== READER_ORIENTATION_AUTO}
          label={orientationLabel(orientation)}
          icon={orientationIcon(orientation)}
          onPress={onCycleOrientation}
        />
      </View>

      <View style={styles.row}>
        <Chip label="−" onPress={onZoomOut} />
        <Pressable onPress={onResetZoom} style={styles.scaleBadge}>
          <Text style={styles.scaleText}>{Math.round(scale * 100)}%</Text>
        </Pressable>
        <Chip label="+" onPress={onZoomIn} />
        {pageLabel ? <Text style={styles.pageLabel}>{pageLabel}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.almondBorder,
    backgroundColor: colors.white,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.almondBorder,
    backgroundColor: colors.almond,
  },
  chipActive: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  chipPressed: {
    opacity: 0.8,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.navy,
  },
  chipTextActive: {
    color: colors.white,
  },
  scaleBadge: {
    minWidth: 52,
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  scaleText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.navy,
  },
  pageLabel: {
    marginLeft: 'auto',
    fontSize: 12,
    fontWeight: '600',
    color: colors.muted,
  },
});
