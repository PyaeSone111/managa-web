import { useEffect } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { favoriteApi, ratingApi, seriesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { addRecentlyViewed } from '../hooks/useRecentlyViewed';
import { toAbsoluteImageUrl } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import ChapterList from '../components/ChapterList';
import StarRating from '../components/StarRating';
import colors from '../theme/colors';

function FavoriteButton({ seriesId, navigation }) {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const { data: favoriteData } = useQuery({
    queryKey: ['favorite', seriesId],
    queryFn: () => favoriteApi.check(seriesId),
    enabled: isAuthenticated && Boolean(seriesId),
  });

  const isFavorited = favoriteData?.is_favorited ?? false;

  const addMutation = useMutation({
    mutationFn: () => favoriteApi.add(seriesId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite', seriesId] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: () => favoriteApi.remove(seriesId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite', seriesId] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  if (!isAuthenticated) {
    return (
      <Pressable style={styles.outlineBtn} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.outlineBtnText}>Sign in to favorite</Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={[styles.favBtn, isFavorited && styles.favBtnActive]}
      onPress={() => (isFavorited ? removeMutation.mutate() : addMutation.mutate())}
      disabled={addMutation.isPending || removeMutation.isPending}
    >
      <Text style={[styles.favBtnText, isFavorited && styles.favBtnTextActive]}>
        {isFavorited ? 'Favorited ♥' : 'Favorite ♡'}
      </Text>
    </Pressable>
  );
}

function UserRating({ seriesId, slug }) {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const { data: ratingData } = useQuery({
    queryKey: ['rating', seriesId],
    queryFn: () => ratingApi.get(seriesId),
    enabled: isAuthenticated && Boolean(seriesId),
  });

  const userRating =
    ratingData?.data?.rating != null ? Math.round(ratingData.data.rating / 2) : 0;

  const rateMutation = useMutation({
    mutationFn: (rating) => ratingApi.rate(seriesId, rating),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rating', seriesId] });
      queryClient.invalidateQueries({ queryKey: ['series', slug] });
    },
  });

  if (!isAuthenticated) {
    return <Text style={styles.muted}>Log in to rate this series.</Text>;
  }

  return (
    <View style={styles.ratingRow}>
      <Text style={styles.muted}>Your Rating:</Text>
      <StarRating
        rating={userRating}
        interactive
        onRate={(star) => rateMutation.mutate(star)}
      />
      {userRating > 0 && <Text style={styles.ratingValue}>{userRating}/5</Text>}
    </View>
  );
}

export default function SeriesDetailScreen({ route, navigation }) {
  const { slug } = route.params;

  const { data: series, isLoading } = useQuery({
    queryKey: ['series', slug],
    queryFn: () => seriesApi.getById(slug),
  });

  const { data: chapters } = useQuery({
    queryKey: ['series', slug, 'chapters'],
    queryFn: () => seriesApi.getChapters(slug),
    enabled: Boolean(slug),
  });

  useEffect(() => {
    if (series?.data?.slug) {
      addRecentlyViewed(series.data);
    }
  }, [series?.data?.slug]);

  if (isLoading) return <LoadingSpinner />;

  if (!series?.data) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Series not found.</Text>
      </View>
    );
  }

  const s = series.data;
  const rating1to10 = s.average_rating ?? s.rating;
  const rating1to5 =
    rating1to10 != null && rating1to10 > 0 ? Number(rating1to10) / 2 : null;
  const starRating = rating1to5 != null ? Math.round(rating1to5) : 0;

  const openChapter = (chapter) => {
    navigation.navigate('Reader', {
      seriesSlug: s.slug,
      chapterNumber: chapter.chapter_number,
      title: chapter.title,
    });
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Image
          source={{ uri: toAbsoluteImageUrl(s.cover_url || s.thumbnail_url) || undefined }}
          style={styles.cover}
          resizeMode="cover"
        />
        <Text style={styles.title}>{s.title}</Text>

        {s.alt_names?.length > 0 && (
          <Text style={styles.altNames}>
            Also known as: {s.alt_names.map((a) => a.name).join(', ')}
          </Text>
        )}

        <View style={styles.ratingRow}>
          <StarRating rating={starRating} />
          <Text style={styles.ratingValue}>
            {rating1to5 != null ? `${rating1to5.toFixed(1)}/5` : 'N/A'}
            {(s.rating_count ?? 0) > 0 ? ` (${s.rating_count} ratings)` : ''}
          </Text>
        </View>

        <FavoriteButton seriesId={s.id} navigation={navigation} />

        {s.description ? (
          <Text style={styles.description}>{s.description}</Text>
        ) : null}

        <View style={styles.tags}>
          {s.categories?.map((cat) => (
            <Pressable
              key={cat.id}
              style={styles.tag}
              onPress={() =>
                navigation.navigate('Browse', { categories: String(cat.id) })
              }
            >
              <Text style={styles.tagText}>{cat.name}</Text>
            </Pressable>
          ))}
          {s.manga_types?.map((type) => (
            <Pressable
              key={type.id}
              style={[styles.tag, styles.typeTag]}
              onPress={() => navigation.navigate('Browse', { types: String(type.id) })}
            >
              <Text style={styles.typeTagText}>{type.name}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.meta}>
          {s.authors?.length > 0 && (
            <Text style={styles.metaText}>
              Author(s):{' '}
              {s.authors
                .filter((a) => a.pivot?.role !== 'artist')
                .map((a) => a.name)
                .join(', ') || s.author}
            </Text>
          )}
          <Text style={styles.metaText}>
            Status: {s.status?.charAt(0).toUpperCase() + s.status?.slice(1)}
          </Text>
          <Text style={styles.metaText}>Chapters: {s.total_chapters}</Text>
          {s.total_views > 0 && (
            <Text style={styles.metaText}>Views: {s.total_views.toLocaleString()}</Text>
          )}
        </View>

        <View style={styles.divider} />
        <UserRating seriesId={s.id} slug={slug} />
      </View>

      <Text style={styles.sectionTitle}>Chapters</Text>
      <ChapterList chapters={chapters?.data || []} onChapterPress={openChapter} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.almond },
  content: { padding: 16, paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.almondBorder,
    padding: 16,
    marginBottom: 20,
  },
  cover: {
    width: '100%',
    aspectRatio: 2 / 3,
    maxHeight: 360,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: `${colors.almondBorder}66`,
  },
  title: { fontSize: 22, fontWeight: '700', color: colors.navy, marginBottom: 6 },
  altNames: { fontSize: 13, color: colors.muted, marginBottom: 8 },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  ratingValue: { fontSize: 14, color: colors.navy, fontWeight: '600' },
  outlineBtn: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.almondBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 12,
  },
  outlineBtnText: { color: colors.navy, fontSize: 14 },
  favBtn: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.almondBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 12,
  },
  favBtnActive: { backgroundColor: colors.redOrange, borderColor: colors.redOrange },
  favBtnText: { color: colors.navy, fontWeight: '600' },
  favBtnTextActive: { color: colors.white },
  description: {
    fontSize: 14,
    color: `${colors.navy}CC`,
    lineHeight: 21,
    marginBottom: 12,
  },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: `${colors.navy}14`,
    borderWidth: 1,
    borderColor: `${colors.navy}33`,
  },
  tagText: { fontSize: 12, color: colors.navy },
  typeTag: { backgroundColor: `${colors.mango}33`, borderColor: `${colors.mango}66` },
  typeTagText: { fontSize: 12, color: colors.navy },
  meta: { gap: 4 },
  metaText: { fontSize: 13, color: `${colors.navy}CC` },
  divider: {
    height: 1,
    backgroundColor: colors.almondBorder,
    marginVertical: 12,
  },
  muted: { color: colors.muted, fontSize: 13 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: 12,
  },
});
