import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import {
  ChapterPagedPages,
  ChapterScrollPages,
} from '../components/reader/ChapterPageImages';
import ChapterReaderNav from '../components/reader/ChapterReaderNav';
import PinchZoomView from '../components/reader/PinchZoomView';
import { ReaderEndOfSeries } from '../components/reader/ReaderContinuousEnd';
import ReaderSettingsModal from '../components/reader/ReaderSettingsModal';
import ReaderToolbar from '../components/reader/ReaderToolbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { useReaderOrientation } from '../hooks/useReaderOrientation';
import { useReaderSettings } from '../hooks/useReaderSettings';
import { useReadingProgressTracker } from '../hooks/useReadingProgressTracker';
import { chapterApi, readingProgressApi, seriesApi } from '../services/api';
import { READER_MODE_PAGED, READER_MODE_SCROLL } from '../utils/constants';
import { formatChapterLabel } from '../utils/helpers';
import colors from '../theme/colors';

const NEXT_CHAPTER_PREFETCH_PAGES = 2;

function sortPages(raw) {
  return [...(raw || [])].sort((a, b) => a.page_number - b.page_number);
}

export default function ReaderScreen({ route, navigation }) {
  const { seriesSlug, chapterNumber } = route.params;
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { isAuthenticated } = useAuth();
  const {
    settings,
    ready: settingsReady,
    setMode,
    setOrientation,
    setScaleLive,
    commitScale,
    resetZoom,
  } = useReaderSettings();

  useReaderOrientation(settings.orientation);

  const scrollRef = useRef(null);
  const hScrollRef = useRef(null);
  const pageOffsets = useRef([]);
  const pageMetaRef = useRef([]);
  const restoredResumeRef = useRef(false);
  const anchorPageRef = useRef(null);
  const visiblePageRef = useRef(1);
  const loadingNextRef = useRef(false);

  const [visiblePage, setVisiblePage] = useState(1);
  const [resumePage, setResumePage] = useState(1);
  const [resumeReady, setResumeReady] = useState(false);
  const [chromeVisible, setChromeVisible] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [extraChapters, setExtraChapters] = useState([]);
  const [loadingNext, setLoadingNext] = useState(false);
  const [activeChapterId, setActiveChapterId] = useState(null);
  const [activePageCount, setActivePageCount] = useState(0);
  const [activeChapterLabel, setActiveChapterLabel] = useState(null);

  const viewportWidth = Math.max(1, windowWidth);
  const pageWidth = Math.max(1, viewportWidth * (settings.scale || 1));

  const { data: chapter, isLoading } = useQuery({
    queryKey: ['chapter', seriesSlug, chapterNumber],
    queryFn: () => chapterApi.getBySeriesAndNumber(seriesSlug, chapterNumber),
    enabled: Boolean(seriesSlug && chapterNumber),
  });

  const chapterData = chapter?.data;
  const seriesId = chapterData?.series?.id ?? chapterData?.series_id;
  const chapterId = chapterData?.id;

  const { data: chaptersRes } = useQuery({
    queryKey: ['series', seriesSlug, 'chapters'],
    queryFn: () => seriesApi.getChapters(seriesSlug),
    enabled: Boolean(seriesSlug && chapterData),
  });

  const applyChromeVisibility = useCallback(
    (visible) => {
      navigation.setOptions({
        headerShown: visible,
        gestureEnabled: visible,
      });
      StatusBar.setHidden(!visible, 'fade');
    },
    [navigation]
  );

  useEffect(() => {
    applyChromeVisibility(chromeVisible);
  }, [applyChromeVisibility, chromeVisible]);

  useFocusEffect(
    useCallback(() => {
      applyChromeVisibility(chromeVisible);
      return () => {
        navigation.setOptions({ headerShown: true, gestureEnabled: true });
        StatusBar.setHidden(false, 'fade');
      };
    }, [applyChromeVisibility, chromeVisible, navigation])
  );

  // Reset continuous chain when the entry chapter changes.
  useEffect(() => {
    setExtraChapters([]);
    loadingNextRef.current = false;
    setLoadingNext(false);
    pageOffsets.current = [];
    pageMetaRef.current = [];
    restoredResumeRef.current = false;
  }, [seriesSlug, chapterNumber]);

  useEffect(() => {
    let cancelled = false;
    restoredResumeRef.current = false;
    pageOffsets.current = [];
    pageMetaRef.current = [];
    setResumeReady(false);
    setResumePage(1);
    setVisiblePage(1);
    visiblePageRef.current = 1;

    async function loadResume() {
      if (!isAuthenticated || !seriesId || !chapterId) {
        if (!cancelled) setResumeReady(true);
        return;
      }
      try {
        const res = await readingProgressApi.getSeries(seriesId);
        const match = res?.data?.chapters_progress?.find(
          (p) => Number(p.chapter_id) === Number(chapterId)
        );
        const page = Math.max(1, Number(match?.last_page) || 1);
        if (!cancelled) {
          setResumePage(page);
          setVisiblePage(page);
          visiblePageRef.current = page;
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setResumeReady(true);
      }
    }

    loadResume();
    return () => {
      cancelled = true;
    };
  }, [chapterId, isAuthenticated, seriesId, seriesSlug, chapterNumber]);

  const pages = useMemo(() => sortPages(chapterData?.pages), [chapterData]);

  const pageCount = pages.length || chapterData?.page_count || 0;

  useEffect(() => {
    if (!chapterData) return;
    setActiveChapterId(chapterData.id);
    setActivePageCount(pages.length || chapterData.page_count || 0);
    setActiveChapterLabel(
      chapterData.title || formatChapterLabel(chapterData.chapter_number)
    );
  }, [chapterData, pages.length]);

  const progressChapterId = activeChapterId || chapterId;
  const progressPageCount = activePageCount || pageCount;

  const { reportPage } = useReadingProgressTracker({
    enabled: isAuthenticated && Boolean(seriesId && progressChapterId),
    seriesId,
    chapterId: progressChapterId,
    pageCount: progressPageCount,
  });

  useEffect(() => {
    reportPage(visiblePage);
  }, [reportPage, visiblePage]);

  const chaptersList = chaptersRes?.data ?? [];
  const sortedChapters = useMemo(
    () =>
      [...chaptersList].sort(
        (a, b) => (Number(a.chapter_number) ?? 0) - (Number(b.chapter_number) ?? 0)
      ),
    [chaptersList]
  );

  const currentIndex = sortedChapters.findIndex(
    (ch) => Number(ch.chapter_number) === Number(chapterData?.chapter_number)
  );
  const prevChapter = currentIndex > 0 ? sortedChapters[currentIndex - 1] : null;
  const nextChapter =
    currentIndex >= 0 && currentIndex < sortedChapters.length - 1
      ? sortedChapters[currentIndex + 1]
      : null;

  const scrollSegments = useMemo(() => {
    if (!chapterData) return [];
    const segs = [
      {
        key: `${seriesSlug}-${chapterData.chapter_number}`,
        chapter: chapterData,
        pages,
      },
    ];
    for (const ch of extraChapters) {
      segs.push({
        key: `${seriesSlug}-${ch.chapter_number}`,
        chapter: ch,
        pages: sortPages(ch.pages),
      });
    }
    return segs;
  }, [chapterData, extraChapters, pages, seriesSlug]);

  const flatPageCount = useMemo(
    () => scrollSegments.reduce((sum, seg) => sum + (seg.pages?.length || 0), 0),
    [scrollSegments]
  );

  const lastLoadedChapterNumber =
    scrollSegments[scrollSegments.length - 1]?.chapter?.chapter_number ??
    chapterNumber;

  const lastLoadedIndex = sortedChapters.findIndex(
    (ch) => Number(ch.chapter_number) === Number(lastLoadedChapterNumber)
  );
  const hasMoreChapters =
    lastLoadedIndex >= 0 && lastLoadedIndex < sortedChapters.length - 1;
  const isSeriesComplete =
    sortedChapters.length > 0 &&
    lastLoadedIndex === sortedChapters.length - 1 &&
    !loadingNext;

  const loadNextChapter = useCallback(async () => {
    if (loadingNextRef.current) return;
    if (!seriesSlug || !sortedChapters.length) return;
    if (lastLoadedIndex < 0 || lastLoadedIndex >= sortedChapters.length - 1) {
      return;
    }

    const next = sortedChapters[lastLoadedIndex + 1];
    if (!next?.chapter_number) return;

    // Avoid duplicate appends.
    const already =
      Number(next.chapter_number) === Number(chapterNumber) ||
      extraChapters.some(
        (ch) => Number(ch.chapter_number) === Number(next.chapter_number)
      );
    if (already) return;

    loadingNextRef.current = true;
    setLoadingNext(true);
    try {
      const res = await chapterApi.getBySeriesAndNumber(
        seriesSlug,
        next.chapter_number
      );
      if (res?.data) {
        setExtraChapters((prev) => {
          if (
            prev.some(
              (ch) =>
                Number(ch.chapter_number) === Number(res.data.chapter_number)
            )
          ) {
            return prev;
          }
          return [...prev, res.data];
        });
      }
    } catch {
      // Keep reading current chapter if next fails.
    } finally {
      loadingNextRef.current = false;
      setLoadingNext(false);
    }
  }, [
    chapterNumber,
    extraChapters,
    lastLoadedIndex,
    seriesSlug,
    sortedChapters,
  ]);

  const maybePrefetchNext = useCallback(
    (flatIndex) => {
      if (settings.mode !== READER_MODE_SCROLL) return;
      if (!hasMoreChapters) return;
      if (flatPageCount <= 0) return;
      if (flatIndex >= flatPageCount - NEXT_CHAPTER_PREFETCH_PAGES) {
        loadNextChapter();
      }
    },
    [flatPageCount, hasMoreChapters, loadNextChapter, settings.mode]
  );

  const goToChapter = (ch) => {
    if (!ch) return;
    navigation.replace('Reader', {
      seriesSlug,
      chapterNumber: ch.chapter_number,
      title: ch.title,
    });
  };

  const openSeries = () => {
    navigation.navigate('SeriesDetail', { slug: seriesSlug });
  };

  const toggleChrome = useCallback(() => {
    setChromeVisible((v) => !v);
    setSettingsOpen(false);
  }, []);

  const initialPageIndex = Math.max(
    0,
    pages.findIndex((p) => Number(p.page_number) === Number(resumePage))
  );
  const resolvedInitialIndex = initialPageIndex >= 0 ? initialPageIndex : 0;

  const applyVisibleMeta = useCallback((meta) => {
    if (!meta) return;
    const pageNumber = meta.pageNumber ?? 1;
    visiblePageRef.current = pageNumber;
    setVisiblePage((prev) => (pageNumber !== prev ? pageNumber : prev));
    if (meta.chapterId) {
      setActiveChapterId((prev) =>
        meta.chapterId !== prev ? meta.chapterId : prev
      );
    }
    if (meta.pageCount) {
      setActivePageCount((prev) =>
        meta.pageCount !== prev ? meta.pageCount : prev
      );
    }
    const label =
      meta.chapter?.title || formatChapterLabel(meta.chapterNumber);
    if (label) {
      setActiveChapterLabel((prev) => (label !== prev ? label : prev));
    }
  }, []);

  const scrollToFlatIndex = useCallback((flatIndex) => {
    const y = pageOffsets.current[flatIndex];
    if (typeof y === 'number' && scrollRef.current) {
      scrollRef.current.scrollTo({ y, animated: false });
    }
  }, []);

  const scrollToPageNumber = useCallback(
    (pageNumber) => {
      const metas = pageMetaRef.current;
      const targetChapterId = activeChapterId || chapterId;
      let flatIndex = metas.findIndex(
        (m) =>
          m &&
          Number(m.chapterId) === Number(targetChapterId) &&
          Number(m.pageNumber) === Number(pageNumber)
      );
      if (flatIndex < 0) {
        flatIndex = metas.findIndex(
          (m) => m && Number(m.pageNumber) === Number(pageNumber)
        );
      }
      if (flatIndex >= 0) scrollToFlatIndex(flatIndex);
    },
    [activeChapterId, chapterId, scrollToFlatIndex]
  );

  const handleScroll = (event) => {
    if (settings.mode !== READER_MODE_SCROLL) return;
    const y = event.nativeEvent.contentOffset.y;
    const offsets = pageOffsets.current;
    if (!offsets.length) return;

    let best = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    for (let i = 0; i < offsets.length; i += 1) {
      if (typeof offsets[i] !== 'number') continue;
      const dist = Math.abs(offsets[i] - y);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    }

    applyVisibleMeta(pageMetaRef.current[best]);
    maybePrefetchNext(best);
  };

  const onPageLayout = (index, layout, meta) => {
    pageOffsets.current[index] = layout.y;
    if (meta) pageMetaRef.current[index] = meta;

    // One-time resume for the entry chapter only.
    if (
      !restoredResumeRef.current &&
      resumeReady &&
      index === resolvedInitialIndex
    ) {
      restoredResumeRef.current = true;
      scrollRef.current?.scrollTo({ y: layout.y, animated: false });
      return;
    }

    // After zoom, re-anchor to the page we were reading.
    if (anchorPageRef.current != null) {
      const targetChapterId = activeChapterId || chapterId;
      const targetIdx = pageMetaRef.current.findIndex(
        (m) =>
          m &&
          Number(m.chapterId) === Number(targetChapterId) &&
          Number(m.pageNumber) === Number(anchorPageRef.current)
      );
      if (index === targetIdx) {
        const y = pageOffsets.current[targetIdx];
        if (typeof y === 'number') {
          scrollRef.current?.scrollTo({ y, animated: false });
          anchorPageRef.current = null;
        }
      }
    }
  };

  const handleScaleChange = useCallback(
    (next) => {
      anchorPageRef.current = visiblePageRef.current;
      setScaleLive(next);
    },
    [setScaleLive]
  );

  const handleScaleEnd = useCallback(
    (next) => {
      anchorPageRef.current = visiblePageRef.current;
      commitScale(next);
      requestAnimationFrame(() => {
        scrollToPageNumber(visiblePageRef.current);
        hScrollRef.current?.scrollTo?.({ x: 0, animated: false });
      });
    },
    [commitScale, scrollToPageNumber]
  );

  if (isLoading && !chapterData) return <LoadingSpinner />;
  if (!settingsReady || !resumeReady) return <LoadingSpinner />;

  if (!chapterData) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Chapter not found.</Text>
      </View>
    );
  }

  const chapterLabel = activeChapterLabel
    || chapterData.title
    || formatChapterLabel(chapterData.chapter_number);
  const chapterKey = `${seriesSlug}-${chapterNumber}`;
  const displayPageCount = activePageCount || pageCount;
  const pageLabel = displayPageCount
    ? `${visiblePage} / ${displayPageCount}`
    : null;

  const pagedNearEnd =
    settings.mode === READER_MODE_PAGED &&
    Number(visiblePage) >= Number(pageCount) &&
    pageCount > 0;

  const scrollFooter = isSeriesComplete ? (
    <ReaderEndOfSeries loadingNext={false} onSeriesPress={openSeries} />
  ) : loadingNext ? (
    <ReaderEndOfSeries loadingNext onSeriesPress={openSeries} />
  ) : null;

  const pagedEndFooter =
    pagedNearEnd && !nextChapter ? (
      <ReaderEndOfSeries loadingNext={false} onSeriesPress={openSeries} />
    ) : null;

  const chromeTop = chromeVisible ? (
    <View style={[styles.chrome, { width: pageWidth }]}>
      <View style={{ width: viewportWidth, alignSelf: 'flex-start' }}>
        <ReaderToolbar
          pageLabel={pageLabel}
          onOpenSettings={() => setSettingsOpen(true)}
        />
        <ChapterReaderNav
          chapterLabel={chapterLabel}
          prevChapter={prevChapter}
          nextChapter={nextChapter}
          onPrevPress={() => goToChapter(prevChapter)}
          onNextPress={() => goToChapter(nextChapter)}
          onSeriesPress={openSeries}
        />
      </View>
    </View>
  ) : null;

  const chromeBottom = chromeVisible ? (
    <View style={[styles.chrome, { width: pageWidth }]}>
      <View style={{ width: viewportWidth, alignSelf: 'flex-start' }}>
        <ChapterReaderNav
          variant="compact"
          prevChapter={prevChapter}
          nextChapter={nextChapter}
          onPrevPress={() => goToChapter(prevChapter)}
          onNextPress={() => goToChapter(nextChapter)}
          onSeriesPress={openSeries}
        />
      </View>
    </View>
  ) : null;

  const settingsModal = (
    <ReaderSettingsModal
      visible={settingsOpen}
      onClose={() => setSettingsOpen(false)}
      mode={settings.mode}
      orientation={settings.orientation}
      scale={settings.scale}
      fullscreen={!chromeVisible}
      onModeChange={setMode}
      onOrientationChange={setOrientation}
      onResetZoom={() => {
        anchorPageRef.current = visiblePageRef.current;
        resetZoom();
        requestAnimationFrame(() => {
          scrollToPageNumber(visiblePageRef.current);
          hScrollRef.current?.scrollTo?.({ x: 0, animated: false });
        });
      }}
      onToggleFullscreen={() => {
        toggleChrome();
        setSettingsOpen(false);
      }}
    />
  );

  // Stable tree: always nested H+V scroll so zoom never remounts pages.
  return (
    <View style={styles.screen}>
      <PinchZoomView
        style={styles.flex}
        scale={settings.scale}
        onScaleChange={handleScaleChange}
        onScaleEnd={handleScaleEnd}
      >
        <ScrollView
          ref={hScrollRef}
          horizontal
          bounces={false}
          style={styles.flex}
          contentContainerStyle={{ width: pageWidth }}
          nestedScrollEnabled
          showsHorizontalScrollIndicator={pageWidth > viewportWidth + 1}
          scrollEnabled={pageWidth > viewportWidth + 1}
        >
          <View style={{ width: pageWidth, height: windowHeight }}>
            <ScrollView
              ref={scrollRef}
              style={{ width: pageWidth, height: windowHeight }}
              contentContainerStyle={styles.content}
              onScroll={handleScroll}
              scrollEventThrottle={100}
              bounces={false}
              nestedScrollEnabled
              onMomentumScrollEnd={(e) => {
                if (settings.mode !== READER_MODE_SCROLL) return;
                const { contentOffset, contentSize, layoutMeasurement } =
                  e.nativeEvent;
                const distanceFromBottom =
                  contentSize.height -
                  (contentOffset.y + layoutMeasurement.height);
                if (distanceFromBottom < 800) {
                  loadNextChapter();
                }
              }}
            >
              {chromeTop}
              {settings.mode === READER_MODE_PAGED ? (
                <View style={{ width: pageWidth, height: windowHeight * 0.85 }}>
                  <ChapterPagedPages
                    pages={pages}
                    pageWidth={pageWidth}
                    chapterKey={chapterKey}
                    initialPageIndex={resolvedInitialIndex}
                    onVisiblePageChange={(pageNumber) => {
                      visiblePageRef.current = pageNumber;
                      setVisiblePage(pageNumber);
                    }}
                    onDoubleTap={toggleChrome}
                  />
                  {pagedEndFooter}
                </View>
              ) : (
                <ChapterScrollPages
                  segments={scrollSegments}
                  pageWidth={pageWidth}
                  chapterKey={chapterKey}
                  onPageLayout={onPageLayout}
                  onDoubleTap={toggleChrome}
                  footer={scrollFooter}
                />
              )}
              {chromeBottom}
            </ScrollView>
          </View>
        </ScrollView>
      </PinchZoomView>
      {settingsModal}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },
  flex: { flex: 1 },
  content: { flexGrow: 1 },
  chrome: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.almond,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.almond,
  },
  muted: { color: colors.muted },
});
