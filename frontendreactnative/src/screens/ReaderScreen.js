import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import {
  ChapterPagedPages,
  ChapterScrollPages,
} from '../components/reader/ChapterPageImages';
import ChapterReaderNav from '../components/reader/ChapterReaderNav';
import ReaderToolbar from '../components/reader/ReaderToolbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { useRefreshControl } from '../hooks/usePullToRefresh';
import { useReaderOrientation } from '../hooks/useReaderOrientation';
import { useReaderSettings } from '../hooks/useReaderSettings';
import { useReadingProgressTracker } from '../hooks/useReadingProgressTracker';
import { chapterApi, readingProgressApi, seriesApi } from '../services/api';
import { READER_MODE_PAGED } from '../utils/constants';
import { formatChapterLabel } from '../utils/helpers';
import colors from '../theme/colors';

export default function ReaderScreen({ route, navigation }) {
  const { seriesSlug, chapterNumber } = route.params;
  const { width } = useWindowDimensions();
  const { isAuthenticated } = useAuth();
  const {
    settings,
    ready: settingsReady,
    setMode,
    cycleOrientation,
    zoomIn,
    zoomOut,
    resetZoom,
  } = useReaderSettings();

  useReaderOrientation(settings.orientation, true);

  const scrollRef = useRef(null);
  const pageOffsets = useRef([]);
  const [visiblePage, setVisiblePage] = useState(1);
  const [resumePage, setResumePage] = useState(1);
  const [resumeReady, setResumeReady] = useState(false);

  const imageWidth = Math.max(200, width - 32);

  const { data: chapter, isLoading, refetch: refetchChapter, isFetching: chapterFetching } = useQuery({
    queryKey: ['chapter', seriesSlug, chapterNumber],
    queryFn: () => chapterApi.getBySeriesAndNumber(seriesSlug, chapterNumber),
    enabled: Boolean(seriesSlug && chapterNumber),
  });

  const chapterData = chapter?.data;
  const seriesId = chapterData?.series?.id ?? chapterData?.series_id;
  const chapterId = chapterData?.id;

  const { data: chaptersRes, refetch: refetchChapters, isFetching: chaptersFetching } = useQuery({
    queryKey: ['series', seriesSlug, 'chapters'],
    queryFn: () => seriesApi.getChapters(seriesSlug),
    enabled: Boolean(seriesSlug && chapterData),
  });

  // Restore last page for this chapter when logged in.
  useEffect(() => {
    let cancelled = false;
    setResumeReady(false);
    setResumePage(1);
    setVisiblePage(1);
    pageOffsets.current = [];

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

  const pages = useMemo(() => {
    return [...(chapterData?.pages || [])].sort(
      (a, b) => a.page_number - b.page_number
    );
  }, [chapterData]);

  const pageCount = pages.length || chapterData?.page_count || 0;

  const { reportPage } = useReadingProgressTracker({
    enabled: isAuthenticated && Boolean(seriesId && chapterId),
    seriesId,
    chapterId,
    pageCount,
  });

  useEffect(() => {
    reportPage(visiblePage);
  }, [reportPage, visiblePage]);

  const refetchAll = useCallback(
    () => Promise.all([refetchChapter(), refetchChapters()]),
    [refetchChapter, refetchChapters]
  );

  const isFetching = chapterFetching || chaptersFetching;
  const refreshControl = useRefreshControl(refetchAll, {
    isFetching,
    isLoading: isLoading && !chapterData,
  });

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

  const initialPageIndex = Math.max(
    0,
    pages.findIndex((p) => Number(p.page_number) === Number(resumePage))
  );
  const resolvedInitialIndex = initialPageIndex >= 0 ? initialPageIndex : 0;

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
    const pageNumber = pages[best]?.page_number ?? best + 1;
    if (pageNumber !== visiblePage) setVisiblePage(pageNumber);
  };

  const onPageLayout = (index, layout) => {
    pageOffsets.current[index] = layout.y;
    if (
      resumeReady &&
      resolvedInitialIndex > 0 &&
      index === resolvedInitialIndex &&
      scrollRef.current
    ) {
      scrollRef.current.scrollTo({ y: layout.y, animated: false });
    }
  };

  if (isLoading && !chapterData) return <LoadingSpinner />;
  if (!settingsReady || !resumeReady) return <LoadingSpinner />;

  if (!chapterData) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Chapter not found.</Text>
      </View>
    );
  }

  const chapterLabel =
    chapterData.title || formatChapterLabel(chapterData.chapter_number);
  const chapterKey = `${seriesSlug}-${chapterNumber}`;
  const pageLabel = pageCount ? `${visiblePage} / ${pageCount}` : null;

  const toolbar = (
    <ReaderToolbar
      mode={settings.mode}
      orientation={settings.orientation}
      scale={settings.scale}
      pageLabel={pageLabel}
      onModeChange={setMode}
      onCycleOrientation={cycleOrientation}
      onZoomIn={zoomIn}
      onZoomOut={zoomOut}
      onResetZoom={resetZoom}
    />
  );

  const topNav = (
    <ChapterReaderNav
      chapterLabel={chapterLabel}
      prevChapter={prevChapter}
      nextChapter={nextChapter}
      onPrevPress={() => goToChapter(prevChapter)}
      onNextPress={() => goToChapter(nextChapter)}
      onSeriesPress={openSeries}
    />
  );

  const bottomNav = (
    <ChapterReaderNav
      variant="compact"
      prevChapter={prevChapter}
      nextChapter={nextChapter}
      onPrevPress={() => goToChapter(prevChapter)}
      onNextPress={() => goToChapter(nextChapter)}
      onSeriesPress={openSeries}
    />
  );

  if (settings.mode === READER_MODE_PAGED) {
    return (
      <View style={styles.screen}>
        <View style={styles.padded}>
          {toolbar}
          {topNav}
        </View>
        <View style={styles.pagedBody}>
          <ChapterPagedPages
            pages={pages}
            imageWidth={imageWidth}
            chapterKey={chapterKey}
            scale={settings.scale}
            initialPageIndex={resolvedInitialIndex}
            onVisiblePageChange={(pageNumber) => setVisiblePage(pageNumber)}
          />
        </View>
        <View style={styles.padded}>{bottomNav}</View>
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={refreshControl}
      onScroll={handleScroll}
      scrollEventThrottle={100}
    >
      <View style={styles.paddedInner}>
        {toolbar}
        {topNav}
      </View>
      {settings.scale > 1 ? (
        <ScrollView horizontal nestedScrollEnabled showsHorizontalScrollIndicator>
          <View style={{ width: imageWidth * settings.scale, paddingHorizontal: 16 }}>
            <ChapterScrollPages
              pages={pages}
              imageWidth={imageWidth}
              chapterKey={chapterKey}
              scale={settings.scale}
              onPageLayout={onPageLayout}
            />
          </View>
        </ScrollView>
      ) : (
        <View style={styles.paddedInner}>
          <ChapterScrollPages
            pages={pages}
            imageWidth={imageWidth}
            chapterKey={chapterKey}
            scale={settings.scale}
            onPageLayout={onPageLayout}
          />
        </View>
      )}
      <View style={styles.paddedInner}>{bottomNav}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.almond },
  content: { paddingBottom: 32 },
  padded: { paddingHorizontal: 16, paddingTop: 12 },
  paddedInner: { paddingHorizontal: 16, paddingTop: 12 },
  pagedBody: { flex: 1, justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  muted: { color: colors.muted },
});
