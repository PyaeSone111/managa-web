import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatChapterLabel, formatChapterNumber } from '../utils/helpers';
import colors from '../theme/colors';

export default function ChapterList({ chapters = [], onChapterPress }) {
  const [order, setOrder] = useState('asc');

  const sortedChapters = useMemo(() => {
    if (!chapters?.length) return [];
    const list = [...chapters];
    list.sort((a, b) => {
      const na = Number(a.chapter_number) ?? 0;
      const nb = Number(b.chapter_number) ?? 0;
      return order === 'asc' ? na - nb : nb - na;
    });
    return list;
  }, [chapters, order]);

  if (!chapters?.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No chapters available.</Text>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.orderRow}>
        <Text style={styles.orderLabel}>Order:</Text>
        <Pressable
          onPress={() => setOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
          style={styles.orderButton}
        >
          <Text style={styles.orderButtonText}>{order === 'asc' ? '↑ Asc' : '↓ Desc'}</Text>
        </Pressable>
      </View>
      {sortedChapters.map((chapter) => (
        <Pressable
          key={chapter.id}
          onPress={() => onChapterPress?.(chapter)}
          style={styles.item}
        >
          <View style={styles.itemMain}>
            <Text style={styles.chapterTitle}>{formatChapterLabel(chapter.chapter_number)}</Text>
            {chapter.title ? (
              <Text numberOfLines={1} style={styles.chapterSubtitle}>
                {chapter.title}
              </Text>
            ) : null}
          </View>
          <Text style={styles.pages}>{chapter.page_count} pages</Text>
        </Pressable>
      ))}
    </View>
  );
}

export { formatChapterNumber };

const styles = StyleSheet.create({
  empty: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.muted,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  orderLabel: {
    fontSize: 14,
    color: colors.muted,
  },
  orderButton: {
    backgroundColor: colors.navy,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  orderButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.almondBorder,
    padding: 14,
    marginBottom: 8,
  },
  itemMain: {
    flex: 1,
    marginRight: 12,
  },
  chapterTitle: {
    fontWeight: '600',
    color: colors.navy,
    fontSize: 15,
  },
  chapterSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: colors.muted,
  },
  pages: {
    fontSize: 12,
    color: colors.muted,
  },
});
