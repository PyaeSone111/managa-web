import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import colors from '../../theme/colors';
import { formatChapterLabel } from '../../utils/helpers';

export function ChapterBreak({ chapter }) {
  const label =
    chapter?.title || formatChapterLabel(chapter?.chapter_number) || 'Next chapter';
  return (
    <View style={styles.break}>
      <Text style={styles.breakLabel}>{label}</Text>
    </View>
  );
}

export function ReaderEndOfSeries({ onSeriesPress, loadingNext }) {
  if (loadingNext) {
    return (
      <View style={styles.endBox}>
        <ActivityIndicator color={colors.redOrange} />
        <Text style={styles.endHint}>Loading next chapter…</Text>
      </View>
    );
  }

  return (
    <View style={styles.endBox}>
      <Text style={styles.endTitle}>You're all caught up</Text>
      <Text style={styles.endHint}>This is the last chapter.</Text>
      <Pressable style={styles.seriesBtn} onPress={onSeriesPress}>
        <Text style={styles.seriesBtnText}>Back to Series</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  break: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#111',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#333',
    alignItems: 'center',
  },
  breakLabel: {
    color: '#ddd',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  endBox: {
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#0a0a0a',
  },
  endTitle: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700',
  },
  endHint: {
    color: '#999',
    fontSize: 13,
    textAlign: 'center',
  },
  seriesBtn: {
    marginTop: 8,
    backgroundColor: colors.redOrange,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  seriesBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
});
