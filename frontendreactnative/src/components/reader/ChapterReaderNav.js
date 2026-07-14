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
    if (!prevChapter && !nextChapter) return null;

    return (
      <View style={[styles.bar, styles.barCompact]}>
        <ThemeAccentBar width={96} />
        <View style={styles.row}>
          {prevChapter ? (
            <ThemedNavButton label="Prev" icon="back" onPress={onPrevPress} />
          ) : null}
          {nextChapter ? (
            <ThemedNavButton label="Next" icon="forward" variant="primary" onPress={onNextPress} />
          ) : null}
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
