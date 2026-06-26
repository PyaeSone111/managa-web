import { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import MonetagAdView from '../components/MonetagAdView';
import LoadingSpinner from '../components/LoadingSpinner';
import { useRefreshControl } from '../hooks/usePullToRefresh';
import { chapterApi, seriesApi } from '../services/api';
import { formatChapterLabel, toAbsoluteImageUrl } from '../utils/helpers';
import colors from '../theme/colors';

export default function ReaderScreen({ route, navigation }) {
  const { seriesSlug, chapterNumber } = route.params;
  const { width } = useWindowDimensions();
  const [adVisible, setAdVisible] = useState(false);
  const [pendingChapter, setPendingChapter] = useState(null);

  const { data: chapter, isLoading, refetch: refetchChapter, isFetching: chapterFetching } = useQuery({
    queryKey: ['chapter', seriesSlug, chapterNumber],
    queryFn: () => chapterApi.getBySeriesAndNumber(seriesSlug, chapterNumber),
    enabled: Boolean(seriesSlug && chapterNumber),
  });

  const { data: chaptersRes, refetch: refetchChapters, isFetching: chaptersFetching } = useQuery({
    queryKey: ['series', seriesSlug, 'chapters'],
    queryFn: () => seriesApi.getChapters(seriesSlug),
    enabled: Boolean(seriesSlug && chapter?.data),
  });

  const refetchAll = useCallback(
    () => Promise.all([refetchChapter(), refetchChapters()]),
    [refetchChapter, refetchChapters]
  );

  const isFetching = chapterFetching || chaptersFetching;
  const refreshControl = useRefreshControl(refetchAll, {
    isFetching,
    isLoading: isLoading && !chapter?.data,
  });

  if (isLoading && !chapter?.data) return <LoadingSpinner />;

  if (!chapter?.data) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Chapter not found.</Text>
      </View>
    );
  }

  const chapterData = chapter.data;
  const chaptersList = chaptersRes?.data ?? [];
  const sortedChapters = [...chaptersList].sort(
    (a, b) => (Number(a.chapter_number) ?? 0) - (Number(b.chapter_number) ?? 0)
  );
  const currentIndex = sortedChapters.findIndex(
    (ch) => Number(ch.chapter_number) === Number(chapterData.chapter_number)
  );
  const prevChapter = currentIndex > 0 ? sortedChapters[currentIndex - 1] : null;
  const nextChapter =
    currentIndex >= 0 && currentIndex < sortedChapters.length - 1
      ? sortedChapters[currentIndex + 1]
      : null;

  const pages = [...(chapterData.pages || [])].sort(
    (a, b) => a.page_number - b.page_number
  );

  const goToChapter = (ch) => {
    if (!ch) return;
    navigation.replace('Reader', {
      seriesSlug,
      chapterNumber: ch.chapter_number,
      title: ch.title,
    });
  };

  const goToChapterWithAd = (ch) => {
    if (!ch) return;
    setPendingChapter(ch);
    setAdVisible(true);
  };

  const handleAdClose = () => {
    setAdVisible(false);
    const target = pendingChapter;
    setPendingChapter(null);
    if (target) {
      goToChapter(target);
    }
  };

  return (
    <>
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={refreshControl}
    >
      {/* <View style={styles.header}>
        <Text style={styles.title}>
          {chapterData.title || formatChapterLabel(chapterData.chapter_number)}
        </Text>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Back</Text>
        </Pressable>
      </View> */}

      <View style={styles.nav}>
        {prevChapter ? (
          <Pressable style={styles.navBtn} onPress={() => goToChapterWithAd(prevChapter)}>
            <Text style={styles.navBtnText}>← Prev</Text>
          </Pressable>
        ) : (
          <Pressable
            style={styles.navBtn}
            onPress={() => navigation.navigate('SeriesDetail', { slug: seriesSlug })}
          >
            <Text style={styles.navBtnText}>← Series</Text>
          </Pressable>
        )}
        <Pressable
          style={[styles.navBtn, styles.navBtnPrimary]}
          onPress={() => navigation.navigate('SeriesDetail', { slug: seriesSlug })}
        >
          <Text style={styles.navBtnPrimaryText}>Series</Text>
        </Pressable>
        {nextChapter ? (
          <Pressable style={styles.navBtn} onPress={() => goToChapterWithAd(nextChapter)}>
            <Text style={styles.navBtnText}>Next →</Text>
          </Pressable>
        ) : (
          <Pressable
            style={styles.navBtn}
            onPress={() => navigation.navigate('SeriesDetail', { slug: seriesSlug })}
          >
            <Text style={styles.navBtnText}>Series →</Text>
          </Pressable>
        )}
      </View>

      {pages.map((page) => (
        <Image
          key={page.id || page.page_number}
          source={{ uri: toAbsoluteImageUrl(page.image_url) }}
          style={[styles.page, { width: width - 32 }]}
          resizeMode="contain"
        />
      ))}

      <View style={[styles.nav, { marginTop: 8 }]}>
        {prevChapter ? (
          <Pressable style={styles.navBtn} onPress={() => goToChapterWithAd(prevChapter)}>
            <Text style={styles.navBtnText}>← Prev</Text>
          </Pressable>
        ) : null}
        {nextChapter ? (
          <Pressable style={styles.navBtn} onPress={() => goToChapterWithAd(nextChapter)}>
            <Text style={styles.navBtnText}>Next →</Text>
          </Pressable>
        ) : null}
      </View>
    </ScrollView>
    <MonetagAdView visible={adVisible} onClose={handleAdClose} />
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.almond },
  content: { padding: 16, paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  title: { flex: 1, fontSize: 18, fontWeight: '700', color: colors.navy },
  backBtn: {
    borderWidth: 1,
    borderColor: `${colors.navy}66`,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: `${colors.navy}14`,
  },
  backBtnText: { color: colors.navy, fontWeight: '600', fontSize: 13 },
  nav: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.almondBorder,
    marginBottom: 12,
  },
  navBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: `${colors.navy}66`,
    backgroundColor: `${colors.navy}14`,
  },
  navBtnText: { color: colors.navy, fontWeight: '600', fontSize: 13 },
  navBtnPrimary: {
    backgroundColor: colors.redOrange,
    borderColor: colors.redOrange,
  },
  navBtnPrimaryText: { color: colors.white, fontWeight: '600', fontSize: 13 },
  page: {
    height: undefined,
    aspectRatio: 2 / 3,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: colors.white,
    alignSelf: 'center',
  },
  muted: { color: colors.muted },
});
