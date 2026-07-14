import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { readingProgressApi } from '../services/api';
import { formatChapterLabel, toAbsoluteImageUrl } from '../utils/helpers';
import colors from '../theme/colors';

export default function ContinueReadingCarousel({ navigation }) {
  const { isAuthenticated } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['reading', 'continue'],
    queryFn: () => readingProgressApi.continueReading({ limit: 12 }),
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
  });

  if (!isAuthenticated) return null;

  const items = data?.data || [];

  if (!isLoading && items.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Continue Reading</Text>
      {isLoading ? (
        <Text style={styles.emptyText}>Loading your recent reads…</Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carousel}
        >
          {items.map((item) => {
            const cover =
              toAbsoluteImageUrl(item.series?.thumbnail_url || item.series?.cover_url) ||
              null;
            const chapterNo = item.chapter?.chapter_number;
            return (
              <Pressable
                key={`${item.series_id}-${item.chapter_id}`}
                style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                onPress={() => {
                  if (!item.series?.slug || chapterNo == null) return;
                  navigation.navigate('Reader', {
                    seriesSlug: item.series.slug,
                    chapterNumber: chapterNo,
                    title: item.series.title,
                  });
                }}
              >
                {cover ? (
                  <Image source={{ uri: cover }} style={styles.cover} />
                ) : (
                  <View style={[styles.cover, styles.coverFallback]}>
                    <Text style={styles.coverLetter}>
                      {(item.series?.title || '?').charAt(0)}
                    </Text>
                  </View>
                )}
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.series?.title || 'Series'}
                </Text>
                <Text style={styles.cardMeta} numberOfLines={1}>
                  {formatChapterLabel(chapterNo)} · p.{item.last_page}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.almondBorder,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.navy,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 13,
    color: colors.muted,
  },
  carousel: {
    paddingBottom: 4,
    gap: 12,
  },
  card: {
    width: 120,
  },
  cardPressed: {
    opacity: 0.85,
  },
  cover: {
    width: 120,
    height: 168,
    borderRadius: 8,
    backgroundColor: colors.almond,
  },
  coverFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverLetter: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.navy,
  },
  cardTitle: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: colors.navy,
  },
  cardMeta: {
    marginTop: 2,
    fontSize: 11,
    color: colors.muted,
  },
});
