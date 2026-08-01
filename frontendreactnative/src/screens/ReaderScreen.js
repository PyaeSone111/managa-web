import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  ChapterPagedPages,
  ChapterScrollPages,
} from '../components/reader/ChapterPageImages';
import ChapterReaderNav from '../components/reader/ChapterReaderNav';
import PinchZoomView from '../components/reader/PinchZoomView';
import { ReaderEndOfSeries } from '../components/reader/ReaderContinuousEnd';
import ReaderSettingsModal from '../components/reader/ReaderSettingsModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { HEADER_HORIZONTAL_PADDING } from '../components/navigation/HeaderBrandLogo';
import { useAuth } from '../context/AuthContext';
import { useReaderOrientation } from '../hooks/useReaderOrientation';
import { useReaderSettings } from '../hooks/useReaderSettings';
import { useReadingProgressTracker } from '../hooks/useReadingProgressTracker';
import { chapterApi, readingProgressApi, seriesApi } from '../services/api';
import { READER_MODE_PAGED, READER_MODE_SCROLL } from '../utils/constants';
import { formatChapterLabel } from '../utils/helpers';
import colors from '../theme/colors';

const NEXT_CHAPTER_BOTTOM_PX = 900;
const NEXT_CHAPTER_COOLDOWN_MS = 2200;
const NEXT_CHAPTER_REARM_PX = 1600;
/** Only chain previous chapter when the first page of the loaded stack is on screen. */
const PREV_CHAPTER_TOP_PX = 120;
const PREV_CHAPTER_COOLDOWN_MS = 1800;
const SCROLL_HIDE_DELTA = 12;

function sortPages(raw) {
  return [...(raw || [])].sort((a, b) => a.page_number - b.page_number);
}

function ReaderSettingsHeaderButton({ onPress }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel="Reader settings"
      style={({ pressed }) => [styles.headerSettingsBtn, pressed && styles.headerSettingsPressed]}
    >
      <Ionicons name="settings-outline" size={22} color={colors.white} />
    </Pressable>
  );
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
  const pageHeights = useRef([]);
  const pageMetaRef = useRef([]);
  const restoredResumeRef = useRef(false);
  const anchorPageRef = useRef(null);
  const visiblePageRef = useRef(1);
  const loadingNextRef = useRef(false);
  const loadingPrevRef = useRef(false);
  const lastScrollYRef = useRef(0);
  const pendingPrependAdjustRef = useRef(null);
  const lastContentHeightRef = useRef(0);
  const prevLoadCooldownUntilRef = useRef(0);
  const nextLoadCooldownUntilRef = useRef(0);
  const nextChapterArmedRef = useRef(true);
  const programmaticScrollRef = useRef(false);
  const lastIndexCommitRef = useRef({ index: -1, at: 0 });
  const visibleFlatIndexRef = useRef(0);
  const chromeAnim = useRef(new Animated.Value(1)).current;

  const [visiblePage, setVisiblePage] = useState(1);
  const [resumePage, setResumePage] = useState(1);
  const [resumeReady, setResumeReady] = useState(false);
  const [chromeVisible, setChromeVisible] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [extraNextChapters, setExtraNextChapters] = useState([]);
  const [extraPrevChapters, setExtraPrevChapters] = useState([]);
  const [loadingNext, setLoadingNext] = useState(false);
  const [loadingPrev, setLoadingPrev] = useState(false);
  const [activeChapterId, setActiveChapterId] = useState(null);
  const [activePageCount, setActivePageCount] = useState(0);
  const [activeChapterLabel, setActiveChapterLabel] = useState(null);
  const [activeChapterNumber, setActiveChapterNumber] = useState(null);
  const [activeFlatIndex, setActiveFlatIndex] = useState(0);

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

  const openSettings = useCallback(() => setSettingsOpen(true), []);

  const applyChromeVisibility = useCallback(
    (visible) => {
      navigation.setOptions({
        headerShown: visible,
        gestureEnabled: visible,
        headerRight: () => <ReaderSettingsHeaderButton onPress={openSettings} />,
      });
      StatusBar.setHidden(!visible, 'fade');
    },
    [navigation, openSettings]
  );

  useEffect(() => {
    applyChromeVisibility(chromeVisible);
  }, [applyChromeVisibility, chromeVisible]);

  useEffect(() => {
    Animated.timing(chromeAnim, {
      toValue: chromeVisible ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [chromeAnim, chromeVisible]);

  useFocusEffect(
    useCallback(() => {
      applyChromeVisibility(chromeVisible);
      return () => {
        navigation.setOptions({
          headerShown: true,
          gestureEnabled: true,
          headerRight: undefined,
        });
        StatusBar.setHidden(false, 'fade');
      };
    }, [applyChromeVisibility, chromeVisible, navigation])
  );

  // Reset continuous chain when the entry chapter changes.
  useEffect(() => {
    setExtraNextChapters([]);
    setExtraPrevChapters([]);
    loadingNextRef.current = false;
    loadingPrevRef.current = false;
    setLoadingNext(false);
    setLoadingPrev(false);
    pageOffsets.current = [];
    pageHeights.current = [];
    pageMetaRef.current = [];
    restoredResumeRef.current = false;
    pendingPrependAdjustRef.current = null;
    lastScrollYRef.current = 0;
    lastContentHeightRef.current = 0;
    nextChapterArmedRef.current = true;
    nextLoadCooldownUntilRef.current = 0;
    visibleFlatIndexRef.current = 0;
    lastIndexCommitRef.current = { index: -1, at: 0 };
    setActiveFlatIndex(0);
  }, [seriesSlug, chapterNumber]);

  useEffect(() => {
    let cancelled = false;
    restoredResumeRef.current = false;
    pageOffsets.current = [];
    pageHeights.current = [];
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
    setActiveChapterNumber(chapterData.chapter_number);
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

  const activeIdx = sortedChapters.findIndex(
    (ch) =>
      Number(ch.chapter_number) ===
      Number(activeChapterNumber ?? chapterData?.chapter_number)
  );
  const prevChapter = activeIdx > 0 ? sortedChapters[activeIdx - 1] : null;
  const nextChapter =
    activeIdx >= 0 && activeIdx < sortedChapters.length - 1
      ? sortedChapters[activeIdx + 1]
      : null;

  const scrollSegments = useMemo(() => {
    if (!chapterData) return [];
    const segs = [];
    for (const ch of extraPrevChapters) {
      segs.push({
        key: `${seriesSlug}-${ch.chapter_number}`,
        chapter: ch,
        pages: sortPages(ch.pages),
      });
    }
    segs.push({
      key: `${seriesSlug}-${chapterData.chapter_number}`,
      chapter: chapterData,
      pages,
    });
    for (const ch of extraNextChapters) {
      segs.push({
        key: `${seriesSlug}-${ch.chapter_number}`,
        chapter: ch,
        pages: sortPages(ch.pages),
      });
    }
    return segs;
  }, [chapterData, extraNextChapters, extraPrevChapters, pages, seriesSlug]);

  const entryStartFlatIndex = useMemo(
    () =>
      extraPrevChapters.reduce(
        (sum, ch) => sum + (sortPages(ch.pages).length || 0),
        0
      ),
    [extraPrevChapters]
  );

  const lastLoadedChapterNumber =
    scrollSegments[scrollSegments.length - 1]?.chapter?.chapter_number ??
    chapterNumber;
  const firstLoadedChapterNumber =
    scrollSegments[0]?.chapter?.chapter_number ?? chapterNumber;

  const lastLoadedIndex = sortedChapters.findIndex(
    (ch) => Number(ch.chapter_number) === Number(lastLoadedChapterNumber)
  );
  const firstLoadedIndex = sortedChapters.findIndex(
    (ch) => Number(ch.chapter_number) === Number(firstLoadedChapterNumber)
  );

  const hasMoreNext =
    lastLoadedIndex >= 0 && lastLoadedIndex < sortedChapters.length - 1;
  const hasMorePrev = firstLoadedIndex > 0;
  const isSeriesComplete =
    sortedChapters.length > 0 &&
    lastLoadedIndex === sortedChapters.length - 1 &&
    !loadingNext;

  const loadNextChapter = useCallback(async () => {
    if (loadingNextRef.current) return;
    if (Date.now() < nextLoadCooldownUntilRef.current) return;
    if (!nextChapterArmedRef.current) return;
    if (!seriesSlug || !sortedChapters.length) return;
    if (lastLoadedIndex < 0 || lastLoadedIndex >= sortedChapters.length - 1) {
      return;
    }

    const next = sortedChapters[lastLoadedIndex + 1];
    if (!next?.chapter_number) return;

    const already =
      Number(next.chapter_number) === Number(chapterNumber) ||
      extraNextChapters.some(
        (ch) => Number(ch.chapter_number) === Number(next.chapter_number)
      ) ||
      extraPrevChapters.some(
        (ch) => Number(ch.chapter_number) === Number(next.chapter_number)
      );
    if (already) return;

    loadingNextRef.current = true;
    nextChapterArmedRef.current = false;
    nextLoadCooldownUntilRef.current = Date.now() + NEXT_CHAPTER_COOLDOWN_MS;
    setLoadingNext(true);
    try {
      const res = await chapterApi.getBySeriesAndNumber(
        seriesSlug,
        next.chapter_number
      );
      if (res?.data) {
        setExtraNextChapters((prev) => {
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
      } else {
        nextChapterArmedRef.current = true;
      }
    } catch {
      nextChapterArmedRef.current = true;
    } finally {
      loadingNextRef.current = false;
      setLoadingNext(false);
    }
  }, [
    chapterNumber,
    extraNextChapters,
    extraPrevChapters,
    lastLoadedIndex,
    seriesSlug,
    sortedChapters,
  ]);

  const loadPrevChapter = useCallback(async () => {
    if (loadingPrevRef.current) return;
    if (pendingPrependAdjustRef.current) return;
    if (Date.now() < prevLoadCooldownUntilRef.current) return;
    if (!seriesSlug || !sortedChapters.length) return;
    if (firstLoadedIndex <= 0) return;

    const prev = sortedChapters[firstLoadedIndex - 1];
    if (!prev?.chapter_number) return;

    const already =
      Number(prev.chapter_number) === Number(chapterNumber) ||
      extraPrevChapters.some(
        (ch) => Number(ch.chapter_number) === Number(prev.chapter_number)
      ) ||
      extraNextChapters.some(
        (ch) => Number(ch.chapter_number) === Number(prev.chapter_number)
      );
    if (already) return;

    loadingPrevRef.current = true;
    setLoadingPrev(true);
    pendingPrependAdjustRef.current = {
      maintainOffset: lastScrollYRef.current,
    };
    prevLoadCooldownUntilRef.current = Date.now() + PREV_CHAPTER_COOLDOWN_MS;

    try {
      const res = await chapterApi.getBySeriesAndNumber(
        seriesSlug,
        prev.chapter_number
      );
      if (res?.data) {
        const addedPages = sortPages(res.data.pages).length;
        // +1 slot for chapter break row above the previous entry segment
        const insertSlots = addedPages;
        pageOffsets.current = [
          ...Array.from({ length: insertSlots }, () => undefined),
          ...pageOffsets.current,
        ];
        pageHeights.current = [
          ...Array.from({ length: insertSlots }, () => undefined),
          ...pageHeights.current,
        ];
        pageMetaRef.current = [
          ...Array.from({ length: insertSlots }, () => null),
          ...pageMetaRef.current,
        ];
        setExtraPrevChapters((curr) => {
          if (
            curr.some(
              (ch) =>
                Number(ch.chapter_number) === Number(res.data.chapter_number)
            )
          ) {
            return curr;
          }
          return [res.data, ...curr];
        });
      } else {
        pendingPrependAdjustRef.current = null;
      }
    } catch {
      pendingPrependAdjustRef.current = null;
    } finally {
      loadingPrevRef.current = false;
      setLoadingPrev(false);
    }
  }, [
    chapterNumber,
    extraNextChapters,
    extraPrevChapters,
    firstLoadedIndex,
    seriesSlug,
    sortedChapters,
  ]);

  /** Load next chapter only from real scroll proximity to bottom (not page index). */
  const maybeLoadNextFromScroll = useCallback(
    (scrollY, layoutH, contentH) => {
      if (settings.mode !== READER_MODE_SCROLL) return;
      if (!hasMoreNext) return;
      if (!(contentH > 0) || !(layoutH > 0)) return;

      const distanceFromBottom = contentH - (scrollY + layoutH);
      if (distanceFromBottom > NEXT_CHAPTER_REARM_PX) {
        nextChapterArmedRef.current = true;
      }
      if (distanceFromBottom < NEXT_CHAPTER_BOTTOM_PX) {
        loadNextChapter();
      }
    },
    [hasMoreNext, loadNextChapter, settings.mode]
  );

  /**
   * Previous chapter only when the user has scrolled to the very start of the
   * continuous stack (page 1 of the first loaded chapter). Scrolling 20→19→…→1
   * stays on the same chapter pages — no network load until past page 1.
   */
  const maybePrefetchPrev = useCallback(
    (flatIndex, scrollY) => {
      if (settings.mode !== READER_MODE_SCROLL) return;
      if (!hasMorePrev) return;
      if (flatIndex > 0) return;
      if (scrollY > PREV_CHAPTER_TOP_PX) return;
      loadPrevChapter();
    },
    [hasMorePrev, loadPrevChapter, settings.mode]
  );

  const hideChrome = useCallback(() => {
    setChromeVisible(false);
    setSettingsOpen(false);
  }, []);

  const toggleChrome = useCallback(() => {
    setChromeVisible((v) => {
      if (v) setSettingsOpen(false);
      return !v;
    });
  }, []);

  /** ScrollView often swallows Pressable taps — detect short taps here instead. */
  const pageTapRef = useRef({ x: 0, y: 0, t: 0, moved: false });

  const onReaderTouchStart = useCallback((e) => {
    const touch = e.nativeEvent.touches?.[0];
    if (!touch) return;
    pageTapRef.current = {
      x: touch.pageX,
      y: touch.pageY,
      t: Date.now(),
      moved: false,
    };
  }, []);

  const onReaderTouchMove = useCallback((e) => {
    const touch = e.nativeEvent.touches?.[0];
    if (!touch) return;
    const dx = Math.abs(touch.pageX - pageTapRef.current.x);
    const dy = Math.abs(touch.pageY - pageTapRef.current.y);
    if (dx > 10 || dy > 10) pageTapRef.current.moved = true;
  }, []);

  const onReaderTouchEnd = useCallback(() => {
    if (pageTapRef.current.moved) return;
    if (Date.now() - pageTapRef.current.t > 350) return;
    toggleChrome();
  }, [toggleChrome]);

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
    if (meta.chapterNumber != null) {
      setActiveChapterNumber((prev) =>
        Number(meta.chapterNumber) !== Number(prev) ? meta.chapterNumber : prev
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
      programmaticScrollRef.current = true;
      scrollRef.current.scrollTo({ y, animated: false });
      lastScrollYRef.current = y;
      requestAnimationFrame(() => {
        programmaticScrollRef.current = false;
      });
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
    const layoutH = event.nativeEvent.layoutMeasurement?.height || windowHeight;
    const contentH = event.nativeEvent.contentSize?.height || 0;
    const dy = y - lastScrollYRef.current;

    if (dy > SCROLL_HIDE_DELTA && chromeVisible && !programmaticScrollRef.current) {
      hideChrome();
    }
    lastScrollYRef.current = y;

    // Ignore index updates during programmatic jumps (resume / prepend / zoom).
    if (programmaticScrollRef.current) return;

    const offsets = pageOffsets.current;
    const heights = pageHeights.current;
    if (!offsets.length) return;

    // Page whose body contains the upper-middle probe. Require monotonic tops
    // so stale/relative layout values cannot jump the index to the stack end.
    const probeY = y + layoutH * 0.35;
    let best = visibleFlatIndexRef.current;
    let lastTop = -1;
    for (let i = 0; i < offsets.length; i += 1) {
      const top = offsets[i];
      if (typeof top !== 'number') continue;
      if (lastTop >= 0 && top + 1 < lastTop) continue;
      lastTop = top;
      const h = heights[i];
      const bottom =
        typeof h === 'number' && h > 0
          ? top + h
          : typeof offsets[i + 1] === 'number'
            ? offsets[i + 1]
            : top + 1;
      if (probeY >= top && probeY < bottom) {
        best = i;
        break;
      }
      if (top <= probeY) best = i;
      if (top > probeY) break;
    }

    const now = Date.now();
    const last = lastIndexCommitRef.current;
    if (best !== last.index) {
      if (now - last.at < 120 && Math.abs(best - last.index) > 1) {
        return;
      }
      lastIndexCommitRef.current = { index: best, at: now };
      visibleFlatIndexRef.current = best;
      setActiveFlatIndex(best);
      applyVisibleMeta(pageMetaRef.current[best]);
    }

    maybeLoadNextFromScroll(y, layoutH, contentH);
    maybePrefetchPrev(best, y);
  };

  const onPageLayout = (index, layout, meta) => {
    const prevY = pageOffsets.current[index];
    const prevH = pageHeights.current[index];
    pageOffsets.current[index] = layout.y;
    pageHeights.current[index] = layout.height;
    if (meta) pageMetaRef.current[index] = meta;

    // Aspect-ratio resolve (or zoom) resizes pages above the viewport and
    // shifts content under a fixed scrollY — compensate so index doesn't jump.
    if (
      typeof prevH === 'number' &&
      Math.abs(layout.height - prevH) > 2 &&
      !programmaticScrollRef.current &&
      !pendingPrependAdjustRef.current
    ) {
      const scrollY = lastScrollYRef.current;
      const wasAbove =
        typeof prevY === 'number' && prevY + prevH <= scrollY + 2;
      if (wasAbove) {
        const delta = layout.height - prevH;
        for (let i = index + 1; i < pageOffsets.current.length; i += 1) {
          if (typeof pageOffsets.current[i] === 'number') {
            pageOffsets.current[i] += delta;
          }
        }
        const nextY = Math.max(0, scrollY + delta);
        programmaticScrollRef.current = true;
        scrollRef.current?.scrollTo({ y: nextY, animated: false });
        lastScrollYRef.current = nextY;
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            programmaticScrollRef.current = false;
          });
        });
        return;
      }
    }

    // Keep chrome page label synced for the page already on screen.
    if (meta && index === visibleFlatIndexRef.current) {
      applyVisibleMeta(meta);
    }

    if (
      !restoredResumeRef.current &&
      resumeReady &&
      !pendingPrependAdjustRef.current &&
      index === entryStartFlatIndex + resolvedInitialIndex
    ) {
      restoredResumeRef.current = true;
      programmaticScrollRef.current = true;
      scrollRef.current?.scrollTo({ y: layout.y, animated: false });
      lastScrollYRef.current = layout.y;
      visibleFlatIndexRef.current = index;
      setActiveFlatIndex(index);
      lastIndexCommitRef.current = { index, at: Date.now() };
      applyVisibleMeta(meta);
      requestAnimationFrame(() => {
        programmaticScrollRef.current = false;
      });
      return;
    }

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
          programmaticScrollRef.current = true;
          scrollRef.current?.scrollTo({ y, animated: false });
          lastScrollYRef.current = y;
          anchorPageRef.current = null;
          visibleFlatIndexRef.current = targetIdx;
          setActiveFlatIndex(targetIdx);
          lastIndexCommitRef.current = { index: targetIdx, at: Date.now() };
          requestAnimationFrame(() => {
            programmaticScrollRef.current = false;
          });
        }
      }
    }
  };

  const onContentSizeChange = useCallback((_w, h) => {
    const pending = pendingPrependAdjustRef.current;
    const prevH = lastContentHeightRef.current || 0;
    lastContentHeightRef.current = h;

    // Intentional prev-chapter prepend only — never chase normal image load height growth.
    if (!pending || prevH <= 0) return;
    const delta = h - prevH;
    if (delta < 40) return;

    for (let i = 0; i < pageOffsets.current.length; i += 1) {
      if (typeof pageOffsets.current[i] === 'number') {
        pageOffsets.current[i] += delta;
      }
    }

    const y = Math.max(0, Number(pending.maintainOffset) || 0) + delta;
    pendingPrependAdjustRef.current = null;
    programmaticScrollRef.current = true;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y, animated: false });
      lastScrollYRef.current = y;
      requestAnimationFrame(() => {
        programmaticScrollRef.current = false;
      });
    });
  }, []);

  const handleScaleChange = useCallback(
    (next) => {
      hideChrome();
      anchorPageRef.current = visiblePageRef.current;
      setScaleLive(next);
    },
    [hideChrome, setScaleLive]
  );

  const handleScaleEnd = useCallback(
    (next) => {
      hideChrome();
      anchorPageRef.current = visiblePageRef.current;
      commitScale(next);
      requestAnimationFrame(() => {
        scrollToPageNumber(visiblePageRef.current);
        hScrollRef.current?.scrollTo?.({ x: 0, animated: false });
      });
    },
    [commitScale, hideChrome, scrollToPageNumber]
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

  const chapterLabel =
    activeChapterLabel ||
    chapterData.title ||
    formatChapterLabel(chapterData.chapter_number);
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

  const bottomTranslate = chromeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [96, 0],
  });
  const topOpacity = chromeAnim;

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

  return (
    <View style={styles.screen}>
      {/* Zoom + pages only — chrome overlays stay fixed full-width */}
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
              onContentSizeChange={onContentSizeChange}
              scrollEventThrottle={64}
              bounces={false}
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              maintainVisibleContentPosition={{
                minIndexForVisible: 0,
              }}
              onTouchStart={onReaderTouchStart}
              onTouchMove={onReaderTouchMove}
              onTouchEnd={onReaderTouchEnd}
              onMomentumScrollEnd={(e) => {
                if (settings.mode !== READER_MODE_SCROLL) return;
                const { contentOffset, contentSize, layoutMeasurement } =
                  e.nativeEvent;
                maybeLoadNextFromScroll(
                  contentOffset.y,
                  layoutMeasurement.height,
                  contentSize.height
                );
                if (contentOffset.y <= PREV_CHAPTER_TOP_PX) {
                  const firstMeta = pageMetaRef.current[0];
                  const atFirstPage =
                    !firstMeta || Number(firstMeta.pageNumber) === 1;
                  if (atFirstPage) loadPrevChapter();
                }
              }}
            >
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
                    onTap={toggleChrome}
                  />
                  {pagedEndFooter}
                </View>
              ) : (
                <ChapterScrollPages
                  segments={scrollSegments}
                  pageWidth={pageWidth}
                  chapterKey={chapterKey}
                  activeFlatIndex={activeFlatIndex}
                  onPageLayout={onPageLayout}
                  onTap={toggleChrome}
                  footer={scrollFooter}
                />
              )}
            </ScrollView>
          </View>
        </ScrollView>
      </PinchZoomView>

      {/* Fixed top chrome — chapter/page, never scales with images */}
      <Animated.View
        pointerEvents={chromeVisible ? 'box-none' : 'none'}
        style={[
          styles.topChrome,
          {
            opacity: topOpacity,
            width: viewportWidth,
          },
        ]}
      >
        <View style={styles.topChromeInner}>
          <Text style={styles.topChapter} numberOfLines={1}>
            {chapterLabel}
          </Text>
          {pageLabel ? (
            <Text style={styles.topPage} numberOfLines={1}>
              {pageLabel}
            </Text>
          ) : null}
        </View>
      </Animated.View>

      {/* Bottom Prev/Next — slide up on tap, hide on scroll-down / scale */}
      <Animated.View
        pointerEvents={chromeVisible ? 'auto' : 'none'}
        style={[
          styles.bottomChrome,
          {
            width: viewportWidth,
            opacity: chromeAnim,
            transform: [{ translateY: bottomTranslate }],
          },
        ]}
      >
        <ChapterReaderNav
          variant="compact"
          prevChapter={prevChapter}
          nextChapter={nextChapter}
          onPrevPress={() => goToChapter(prevChapter)}
          onNextPress={() => goToChapter(nextChapter)}
          onSeriesPress={openSeries}
        />
      </Animated.View>

      {loadingPrev ? (
        <View pointerEvents="none" style={styles.prevLoadingOverlay}>
          <Text style={styles.prevLoadingText}>Loading previous chapter…</Text>
        </View>
      ) : null}

      {settingsModal}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },
  flex: { flex: 1 },
  content: { flexGrow: 1 },
  topChrome: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 20,
    paddingTop: 8,
    paddingHorizontal: 12,
  },
  topChromeInner: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(245,240,225,0.96)',
    borderWidth: 1,
    borderColor: colors.almondBorder,
    gap: 2,
  },
  topChapter: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.navy,
  },
  topPage: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.muted,
  },
  bottomChrome: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    zIndex: 20,
    paddingHorizontal: 12,
    paddingBottom: 16,
    paddingTop: 8,
  },
  headerSettingsBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    paddingRight: HEADER_HORIZONTAL_PADDING,
  },
  headerSettingsPressed: {
    opacity: 0.75,
  },
  prevLoadingOverlay: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 30,
  },
  prevLoadingText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.almond,
  },
  muted: { color: colors.muted },
});
