import { useEffect, useMemo, useRef } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import ReaderPageImage, { pageUri } from './ReaderPageImage';
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
 * Continuous scroll stack (parent ScrollView owns scrolling).
 */
export function ChapterScrollPages({
  pages,
  imageWidth,
  chapterKey,
  scale = 1,
  onPageLayout,
}) {
  const safePages = useMemo(() => pages || [], [pages]);

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

  if (!safePages.length) return null;

  return (
    <View style={{ width: Math.max(imageWidth, imageWidth * scale), alignSelf: 'center' }}>
      {safePages.map((page, index) => {
        const key = `${chapterKey}-${page.id ?? page.page_number ?? index}`;
        return (
          <View
            key={key}
            onLayout={(e) => onPageLayout?.(index, e.nativeEvent.layout)}
            style={styles.pageSlot}
          >
            <ReaderPageImage uri={pageUri(page)} width={imageWidth} scale={scale} />
          </View>
        );
      })}
    </View>
  );
}

/**
 * One page per swipe (horizontal FlatList).
 */
export function ChapterPagedPages({
  pages,
  imageWidth,
  chapterKey,
  scale = 1,
  initialPageIndex = 0,
  onVisiblePageChange,
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

  const itemWidth = scale <= 1 ? imageWidth : Math.max(imageWidth, imageWidth * scale);

  return (
    <FlatList
      data={safePages}
      keyExtractor={(item, index) =>
        `${chapterKey}-${item.id ?? item.page_number ?? index}`
      }
      horizontal
      pagingEnabled={scale <= 1}
      showsHorizontalScrollIndicator={false}
      initialScrollIndex={Math.min(initialPageIndex, Math.max(0, safePages.length - 1))}
      getItemLayout={(_, index) => ({
        length: itemWidth,
        offset: itemWidth * index,
        index,
      })}
      onScrollToIndexFailed={() => {}}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      style={{ width: imageWidth, alignSelf: 'center' }}
      renderItem={({ item }) => (
        <View style={{ width: itemWidth, alignItems: 'center', justifyContent: 'center' }}>
          <ReaderPageImage
            uri={pageUri(item)}
            width={imageWidth}
            scale={scale}
            style={{ maxHeight: windowHeight * 0.82 }}
          />
        </View>
      )}
    />
  );
}

/** Back-compat default export (scroll strip). */
export default function ChapterPageImages(props) {
  if (props.mode === READER_MODE_PAGED) {
    return <ChapterPagedPages {...props} />;
  }
  return <ChapterScrollPages {...props} />;
}

const styles = StyleSheet.create({
  pageSlot: {
    marginBottom: 8,
    alignItems: 'center',
  },
});
