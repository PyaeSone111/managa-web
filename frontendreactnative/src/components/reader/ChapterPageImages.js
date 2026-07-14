import { useEffect, useMemo, useRef } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import ReaderPageImage, { pageUri } from './ReaderPageImage';
import { ChapterBreak } from './ReaderContinuousEnd';
import { toAbsoluteImageUrl } from '../../utils/helpers';
import { READER_MODE_PAGED } from '../../utils/constants';

const PREFETCH_CONCURRENCY = 5;

async function prefetchPage(uri) {
  if (!uri) return;
  try {
    const ok = await Image.prefetch(uri);
    if (ok) return;
  } catch {
    // ignore
  }
  await new Promise((resolve) => {
    Image.getSize(uri, () => resolve(), () => resolve());
  });
}

async function prefetchPagesInParallel(pages, { concurrency, isCancelled }) {
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < pages.length) {
      if (isCancelled()) return;
      const index = nextIndex;
      nextIndex += 1;
      await prefetchPage(toAbsoluteImageUrl(pages[index].image_url));
    }
  }

  const workerCount = Math.min(concurrency, pages.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
}

/**
 * Continuous scroll stack — full width, no gaps between pages.
 * `pageWidth` should already include zoom (viewport * scale).
 *
 * `segments`: [{ key, chapter, pages }]
 * Layout callback receives flat page index + chapter/page meta.
 */
export function ChapterScrollPages({
  pages,
  pageWidth,
  chapterKey,
  segments: segmentsProp,
  onPageLayout,
  onDoubleTap,
  footer = null,
}) {
  const segments = useMemo(() => {
    if (Array.isArray(segmentsProp) && segmentsProp.length) return segmentsProp;
    return [
      {
        key: chapterKey || 'chapter',
        chapter: null,
        pages: pages || [],
      },
    ];
  }, [segmentsProp, chapterKey, pages]);

  const flatPages = useMemo(() => {
    const items = [];
    segments.forEach((seg, segmentIndex) => {
      (seg.pages || []).forEach((page, pageIndexInSegment) => {
        items.push({
          page,
          segmentIndex,
          pageIndexInSegment,
          chapter: seg.chapter,
          chapterKey: seg.key,
          flatIndex: items.length,
          pageNumber: page.page_number ?? pageIndexInSegment + 1,
          pageCount: (seg.pages || []).length,
          chapterId: seg.chapter?.id,
          chapterNumber: seg.chapter?.chapter_number,
        });
      });
    });
    return items;
  }, [segments]);

  const prefetchKey = segments.map((s) => s.key).join('|');

  useEffect(() => {
    let cancelled = false;
    const all = flatPages.map((item) => item.page);
    if (!all.length) return undefined;

    prefetchPagesInParallel(all, {
      concurrency: PREFETCH_CONCURRENCY,
      isCancelled: () => cancelled,
    });

    return () => {
      cancelled = true;
    };
  }, [prefetchKey, flatPages]);

  if (!flatPages.length && !footer) return null;

  return (
    <View style={{ width: pageWidth }}>
      {segments.map((seg, segmentIndex) => (
        <View key={seg.key || `seg-${segmentIndex}`}>
          {segmentIndex > 0 && seg.chapter ? (
            <ChapterBreak chapter={seg.chapter} />
          ) : null}
          {(seg.pages || []).map((page, pageIndexInSegment) => {
            const flatIndex =
              segments
                .slice(0, segmentIndex)
                .reduce((sum, s) => sum + (s.pages?.length || 0), 0) +
              pageIndexInSegment;
            const meta = flatPages[flatIndex];
            const key = `${seg.key}-${page.id ?? page.page_number ?? pageIndexInSegment}`;
            return (
              <View
                key={key}
                onLayout={(e) =>
                  onPageLayout?.(flatIndex, e.nativeEvent.layout, meta)
                }
                style={styles.pageSlot}
              >
                <ReaderPageImage
                  uri={pageUri(page)}
                  width={pageWidth}
                  onDoubleTap={onDoubleTap}
                />
              </View>
            );
          })}
        </View>
      ))}
      {footer}
    </View>
  );
}

/**
 * One page per swipe — full viewport width.
 */
export function ChapterPagedPages({
  pages,
  pageWidth,
  chapterKey,
  initialPageIndex = 0,
  onVisiblePageChange,
  onDoubleTap,
}) {
  const { height: windowHeight } = useWindowDimensions();
  const safePages = useMemo(() => pages || [], [pages]);
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems?.length) {
      const idx = viewableItems[0].index ?? 0;
      const page = safePages[idx];
      onVisiblePageChange?.(page?.page_number ?? idx + 1, idx);
    }
  }).current;
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  useEffect(() => {
    let cancelled = false;
    if (!safePages.length) return undefined;

    prefetchPagesInParallel(safePages, {
      concurrency: PREFETCH_CONCURRENCY,
      isCancelled: () => cancelled,
    });

    return () => {
      cancelled = true;
    };
  }, [chapterKey, safePages]);

  useEffect(() => {
    if (!safePages.length) return;
    const page = safePages[Math.min(initialPageIndex, safePages.length - 1)];
    onVisiblePageChange?.(page?.page_number ?? 1, Math.min(initialPageIndex, safePages.length - 1));
  }, [chapterKey]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!safePages.length) return null;

  return (
    <FlatList
      data={safePages}
      keyExtractor={(item, index) =>
        `${chapterKey}-${item.id ?? item.page_number ?? index}`
      }
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      initialScrollIndex={Math.min(initialPageIndex, Math.max(0, safePages.length - 1))}
      getItemLayout={(_, index) => ({
        length: pageWidth,
        offset: pageWidth * index,
        index,
      })}
      onScrollToIndexFailed={() => {}}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      style={{ flex: 1, width: pageWidth }}
      renderItem={({ item }) => (
        <View style={{ width: pageWidth, minHeight: windowHeight * 0.7 }}>
          <ReaderPageImage
            uri={pageUri(item)}
            width={pageWidth}
            onDoubleTap={onDoubleTap}
          />
        </View>
      )}
    />
  );
}

export default function ChapterPageImages(props) {
  if (props.mode === READER_MODE_PAGED) {
    return <ChapterPagedPages {...props} />;
  }
  return <ChapterScrollPages {...props} />;
}

const styles = StyleSheet.create({
  pageSlot: {
    marginBottom: 0,
    width: '100%',
  },
});
