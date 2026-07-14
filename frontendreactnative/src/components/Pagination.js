import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ThemeAccentBar, ThemedNavButton } from './navigation/ThemedNavButton';
import colors from '../theme/colors';

function getPageNumbers(current, last, maxVisible = 7) {
  if (last <= 1) return [];

  const pages = new Set([1, last, current]);
  for (let i = current - 2; i <= current + 2; i += 1) {
    if (i > 1 && i < last) pages.add(i);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const result = [];

  sorted.forEach((pageNum, index) => {
    if (index > 0 && pageNum - sorted[index - 1] > 1) {
      result.push('ellipsis');
    }
    result.push(pageNum);
  });

  return result.slice(0, maxVisible + 2);
}

export default function Pagination({ page, lastPage, total, perPage, onPageChange }) {
  if (!lastPage || lastPage <= 1) return null;

  const from = total > 0 ? (page - 1) * perPage + 1 : 0;
  const to = total > 0 ? Math.min(page * perPage, total) : 0;
  const pageNumbers = getPageNumbers(page, lastPage);

  return (
    <View style={styles.wrap}>
      <ThemeAccentBar />
      <Text style={styles.summary}>
        Showing {from}–{to} of {total} series
      </Text>

      <View style={styles.row}>
        <ThemedNavButton
          label="Prev"
          icon="back"
          disabled={page <= 1}
          onPress={() => onPageChange(page - 1)}
        />

        <View style={styles.pageGroup}>
          {pageNumbers.map((item, index) =>
            item === 'ellipsis' ? (
              <Text key={`ellipsis-${index}`} style={styles.ellipsis}>
                …
              </Text>
            ) : (
              <Pressable
                key={item}
                onPress={() => onPageChange(item)}
                style={({ pressed }) => [
                  styles.pageNum,
                  item === page && styles.pageNumActive,
                  pressed && item !== page && styles.pageNumPressed,
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: item === page }}
              >
                {item === page ? (
                  <View style={styles.pageNumAccent}>
                    <View style={[styles.pageSeg, styles.segNavy]} />
                    <View style={[styles.pageSeg, styles.segMango]} />
                    <View style={[styles.pageSeg, styles.segOrange]} />
                  </View>
                ) : null}
                <Text style={[styles.pageNumText, item === page && styles.pageNumTextActive]}>
                  {item}
                </Text>
              </Pressable>
            )
          )}
        </View>

        <ThemedNavButton
          label="Next"
          icon="forward"
          variant="primary"
          disabled={page >= lastPage}
          onPress={() => onPageChange(page + 1)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
  },
  summary: {
    textAlign: 'center',
    fontSize: 13,
    color: colors.muted,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  pageGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    maxWidth: '100%',
  },
  pageNum: {
    minWidth: 38,
    height: 38,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.almondBorder,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pageNumActive: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  pageNumPressed: {
    backgroundColor: `${colors.navy}10`,
  },
  pageNumAccent: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    flexDirection: 'row',
  },
  pageSeg: {
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
  pageNumText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.navy,
  },
  pageNumTextActive: {
    color: colors.white,
  },
  ellipsis: {
    paddingHorizontal: 2,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 38,
  },
});
