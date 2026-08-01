import { StyleSheet, Text, View } from 'react-native';
import { ThemeAccentBar, ThemedNavButton } from '../navigation/ThemedNavButton';
import { formatChapterLabel } from '../../utils/helpers';
import colors from '../../theme/colors';

export default function ChapterReaderNav({
  variant = 'full',
  chapterLabel,
  prevChapter,
  nextChapter,
  onPrevPress,
  onNextPress,
  onSeriesPress,
}) {
  const prevLabel = prevChapter
    ? formatChapterLabel(prevChapter.chapter_number)
    : 'Series';
  const nextLabel = nextChapter
    ? formatChapterLabel(nextChapter.chapter_number)
    : 'Series';

  if (variant === 'compact') {
    if (!prevChapter && !nextChapter) {
      return (
        <View style={[styles.bar, styles.barBottom]}>
          <ThemeAccentBar width={96} />
          <View style={styles.row}>
            <ThemedNavButton label="Series" icon="back" onPress={onSeriesPress} />
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.bar, styles.barBottom]}>
        <ThemeAccentBar width={96} />
        <View style={styles.row}>
          {prevChapter ? (
            <ThemedNavButton label="Prev" icon="back" onPress={onPrevPress} />
          ) : (
            <ThemedNavButton label="Series" icon="back" onPress={onSeriesPress} />
          )}
          {nextChapter ? (
            <ThemedNavButton label="Next" icon="forward" variant="primary" onPress={onNextPress} />
          ) : (
            <ThemedNavButton label="Series" icon="forward" onPress={onSeriesPress} />
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.bar}>
      <ThemeAccentBar width={120} />
      {chapterLabel ? <Text style={styles.chapterLabel}>{chapterLabel}</Text> : null}
      <View style={styles.row}>
        {prevChapter ? (
          <ThemedNavButton label="Prev" icon="back" onPress={onPrevPress} />
        ) : (
          <ThemedNavButton label="Series" icon="back" onPress={onSeriesPress} />
        )}
        <ThemedNavButton label="Series" onPress={onSeriesPress} style={styles.seriesBtn} />
        {nextChapter ? (
          <ThemedNavButton label="Next" icon="forward" variant="primary" onPress={onNextPress} />
        ) : (
          <ThemedNavButton label="Series" icon="forward" onPress={onSeriesPress} />
        )}
      </View>
      {(prevChapter || nextChapter) && (
        <Text style={styles.hint} numberOfLines={1}>
          {prevChapter ? `← ${prevLabel}` : ''}
          {prevChapter && nextChapter ? '  ·  ' : ''}
          {nextChapter ? `${nextLabel} →` : ''}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.almondBorder,
    backgroundColor: colors.white,
    borderRadius: 12,
  },
  barCompact: {
    marginTop: 8,
    marginBottom: 0,
  },
  barBottom: {
    marginTop: 0,
    marginBottom: 0,
    borderRadius: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
  },
  chapterLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.navy,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  seriesBtn: {
    minWidth: 64,
  },
  hint: {
    fontSize: 11,
    color: colors.muted,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});
