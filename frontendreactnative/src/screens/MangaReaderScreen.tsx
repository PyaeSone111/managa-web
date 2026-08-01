import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import PagerView, {
  type PagerViewOnPageSelectedEvent,
} from 'react-native-pager-view';
import FastImage from 'react-native-fast-image';
import { useDebouncedCallback } from '../hooks/useDebouncedCallback';
import { shouldPrefetchNextChapter } from '../reader/chapterBoundaries';
import {
  createMockChapterPages,
  loadNextChapter,
} from '../reader/loadNextChapter';
import type { MangaPage } from '../reader/mangaReader.types';
import {
  persistReadPosition,
  readSavedPosition,
  resolveInitialPageIndex,
} from '../reader/readPosition';
import colors from '../theme/colors';

/** Prefetch Chapter N+1 when the reader reaches page N-2 of the current chapter. */
const CHAPTER_PREFETCH_PAGES_FROM_END = 2;
/** Debounce MMKV writes so fast swipes don't hit disk every frame (500ms–1s). */
const MMKV_SAVE_DEBOUNCE_MS = 800;

export type MangaReaderScreenProps = {
  initialChapterId?: string;
  initialPages?: MangaPage[];
};

type PageSlideProps = {
  page: MangaPage;
  width: number;
  height: number;
};

const MangaPageSlide = memo(function MangaPageSlide({
  page,
  width,
  height,
}: PageSlideProps) {
  return (
    <View style={{ width, height, backgroundColor: '#000' }} collapsable={false}>
      <FastImage
        source={{
          uri: page.imageUrl,
          priority: FastImage.priority.normal,
          cache: FastImage.cacheControl.immutable,
        }}
        style={styles.image}
        resizeMode={FastImage.resizeMode.contain}
      />
    </View>
  );
});

/**
 * Continuous horizontal manga reader (PagerView).
 *
 * Strategy:
 * 1. Unified flat page array — append Chapter N+1 at length-2 of *current chapter*
 *    without remounting PagerView (stable initialPage).
 * 2. Sync React state for the page counter; debounce MMKV persistence (~800ms).
 */
export default function MangaReaderScreen({
  initialChapterId = 'chapter-1',
  initialPages,
}: MangaReaderScreenProps) {
  const { width, height } = useWindowDimensions();

  const seedPages = useMemo(
    () => initialPages ?? createMockChapterPages(initialChapterId),
    [initialChapterId, initialPages]
  );

  const saved = useMemo(() => readSavedPosition(), []);
  const resolvedInitial = useMemo(
    () => resolveInitialPageIndex(seedPages, saved),
    [seedPages, saved]
  );

  const [pages, setPages] = useState<MangaPage[]>(seedPages);
  const [activeIndex, setActiveIndex] = useState(resolvedInitial);
  const [loadingNext, setLoadingNext] = useState(false);

  const pagesRef = useRef(pages);
  const loadingNextRef = useRef(false);
  const pagerRef = useRef<PagerView>(null);
  /** Never change after mount — appending children must not reset pager position. */
  const initialPageRef = useRef(resolvedInitial);

  useEffect(() => {
    pagesRef.current = pages;
  }, [pages]);

  const activePage = pages[activeIndex] ?? null;

  const chapterPageCount = useMemo(() => {
    if (!activePage) return 0;
    let count = 0;
    for (let i = 0; i < pages.length; i += 1) {
      if (pages[i].chapterId === activePage.chapterId) count += 1;
    }
    return count;
  }, [activePage, pages]);

  /** Instant UI label — never wait on MMKV. */
  const counterLabel = useMemo(() => {
    if (!activePage) return '';
    return `Page ${activePage.pageNumber} / ${chapterPageCount}`;
  }, [activePage, chapterPageCount]);

  const writePosition = useCallback((index: number, page: MangaPage) => {
    persistReadPosition({
      pageIndex: index,
      chapterId: page.chapterId,
      pageId: page.id,
    });
  }, []);

  const debouncedPersist = useDebouncedCallback(
    writePosition,
    MMKV_SAVE_DEBOUNCE_MS
  );

  /**
   * Background fetch for the chapter after `fromChapterId`, then append
   * into the continuous flat array (PagerView keeps current position).
   */
  const appendNextChapter = useCallback(async (fromChapterId: string) => {
    if (loadingNextRef.current) return;
    if (!fromChapterId) return;

    const list = pagesRef.current;
    const loadedChapterIds = [...new Set(list.map((p) => p.chapterId))];

    loadingNextRef.current = true;
    setLoadingNext(true);

    try {
      const next = await loadNextChapter({
        currentChapterId: fromChapterId,
        loadedChapterIds,
      });
      if (!next?.pages?.length) return;

      setPages((prev) => {
        const existing = new Set(prev.map((p) => p.id));
        const fresh = next.pages.filter((p) => !existing.has(p.id));
        // Append only — never replace/reorder, so layout & index stay put.
        return fresh.length ? [...prev, ...fresh] : prev;
      });
    } finally {
      loadingNextRef.current = false;
      setLoadingNext(false);
    }
  }, []);

  const maybePrefetchNext = useCallback(
    (flatIndex: number) => {
      const list = pagesRef.current;
      const page = list[flatIndex];
      if (!page) return;

      if (
        !shouldPrefetchNextChapter(
          list,
          flatIndex,
          CHAPTER_PREFETCH_PAGES_FROM_END
        )
      ) {
        return;
      }

      void appendNextChapter(page.chapterId);
    },
    [appendNextChapter]
  );

  const onPageSelected = useCallback(
    (e: PagerViewOnPageSelectedEvent) => {
      const index = e.nativeEvent.position;

      // 1) Sync UI state immediately (counter).
      setActiveIndex(index);

      const page = pagesRef.current[index];
      if (page) {
        // 2) Debounce disk write — only persist after swipe pause (~800ms).
        debouncedPersist(index, page);
      }

      // 3) Seamless chapter stitch at N-2 of current chapter.
      maybePrefetchNext(index);
    },
    [debouncedPersist, maybePrefetchNext]
  );

  useEffect(() => {
    maybePrefetchNext(initialPageRef.current);
  }, [maybePrefetchNext]);

  if (!pages.length) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.redOrange} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={initialPageRef.current}
        onPageSelected={onPageSelected}
        overdrag
      >
        {pages.map((page) => (
          <MangaPageSlide
            key={page.id}
            page={page}
            width={width}
            height={height}
          />
        ))}
      </PagerView>

      <View pointerEvents="none" style={styles.counterWrap}>
        <Text style={styles.counter}>{counterLabel}</Text>
        {loadingNext ? (
          <ActivityIndicator
            style={styles.nextSpinner}
            color={colors.redOrange}
            size="small"
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  boot: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pager: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  counterWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 28,
    alignItems: 'center',
    gap: 8,
  },
  counter: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  nextSpinner: {
    marginTop: 2,
  },
});
