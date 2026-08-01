import { useEffect, useMemo, useRef } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import ReaderPageImage, { pageUri } from './ReaderPageImage';
import { ChapterBreak } from './ReaderContinuousEnd';
import { READER_MODE_PAGED } from '../../utils/constants';

/** How many neighbors (each side) keep a decoded Image mounted. */
export const READER_IMAGE_WINDOW = 2;

/**
 * Continuous scroll stack — full width, no gaps between pages.
 * Only pages near `activeFlatIndex` decode bitmaps (Fresco pool safety).
 *
 * `segments`: [{ key, chapter, pages }]
 */
export function ChapterScrollPages({
  pages,
  pageWidth,
  chapterKey,
  segments: segmentsProp,
  activeFlatIndex = 0,
  imageWindow = READER_IMAGE_WINDOW,
  onPageLayout,
  onTap,
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

  useEffect(() => {
    const preloadSources = flatPages
      .filter((p) => Math.abs(p.flatIndex - activeFlatIndex) <= imageWindow + 1)
      .map((p) => ({ uri: pageUri(p.page), cache: FastImage.cacheControl.immutable }))
      .filter((s) => s.uri);
    if (preloadSources.length) FastImage.preload(preloadSources);
  }, [flatPages, activeFlatIndex, imageWindow]);

  if (!flatPages.length && !footer) return null;

  return (
    <View style={{ width: pageWidth }} collapsable={false}>
      {segments.flatMap((seg, segmentIndex) => {
        const nodes = [];
        if (segmentIndex > 0 && seg.chapter) {
          nodes.push(
            <ChapterBreak
              key={`break-${seg.key || segmentIndex}`}
              chapter={seg.chapter}
            />
          );
        }
        (seg.pages || []).forEach((page, pageIndexInSegment) => {
          const flatIndex =
            segments
              .slice(0, segmentIndex)
              .reduce((sum, s) => sum + (s.pages?.length || 0), 0) +
            pageIndexInSegment;
          const meta = flatPages[flatIndex];
          const key = `${seg.key}-${page.id ?? page.page_number ?? pageIndexInSegment}`;
          const active =
            Math.abs(flatIndex - (activeFlatIndex || 0)) <= imageWindow;
          nodes.push(
            <View
              key={key}
              collapsable={false}
              onLayout={(e) =>
                onPageLayout?.(flatIndex, e.nativeEvent.layout, meta)
              }
              style={styles.pageSlot}
            >
              <ReaderPageImage
                uri={pageUri(page)}
                width={pageWidth}
                naturalWidth={page.width}
                naturalHeight={page.height}
                active={active}
                onTap={onTap || onDoubleTap}
              />
            </View>
          );
        });
        return nodes;
      })}
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
  onTap,
  onDoubleTap,
}) {
  const { height: windowHeight } = useWindowDimensions();
  const safePages = useMemo(() => pages || [], [pages]);
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems?.length) {
      const idx = viewableItems[0].index ?? 0;
      const page = safePages[idx];
      onVisiblePageChange?.(page?.page_number ?? idx + 1, idx);

      const preloadSources = safePages
        .slice(idx + 1, idx + 3)
        .map((p) => ({ uri: pageUri(p), cache: FastImage.cacheControl.immutable }))
        .filter((s) => s.uri);
      if (preloadSources.length) FastImage.preload(preloadSources);
    }
  }).current;
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

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
      initialScrollIndex={Math.min(
        initialPageIndex,
        Math.max(0, safePages.length - 1)
      )}
      getItemLayout={(_, index) => ({
        length: pageWidth,
        offset: pageWidth * index,
        index,
      })}
      onScrollToIndexFailed={() => {}}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      windowSize={5}
      maxToRenderPerBatch={3}
      style={{ flex: 1, width: pageWidth }}
      renderItem={({ item }) => (
        <View style={{ width: pageWidth, minHeight: windowHeight * 0.7 }}>
          <ReaderPageImage
            uri={pageUri(item)}
            width={pageWidth}
            naturalWidth={item.width}
            naturalHeight={item.height}
            active
            onTap={onTap || onDoubleTap}
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
