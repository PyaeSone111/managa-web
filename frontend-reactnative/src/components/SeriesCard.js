import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { getSeriesAuthorLabel, getSeriesTypeLabel } from '../lib/seriesDisplay';
import { toAbsoluteImageUrl } from '../utils/helpers';
import colors from '../theme/colors';
import StarRating from './StarRating';

function normalizeRating(raw) {
  const num = raw != null ? Number(raw) : NaN;
  if (Number.isNaN(num) || num <= 0) return 0;
  if (num <= 5) return Math.min(5, num);
  return Math.min(5, num / 2);
}

export default function SeriesCard({ series, onPress }) {
  const rating = normalizeRating(series.average_rating ?? series.rating);
  const ratingCount = series.rating_count ?? 0;
  const authorText = getSeriesAuthorLabel(series);
  const typeLabel = getSeriesTypeLabel(series);
  const imageUrl = toAbsoluteImageUrl(series.cover_url || series.thumbnail_url);

  return (
    <Pressable onPress={() => onPress?.(series)} style={styles.card}>
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: imageUrl || undefined }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.ratingBar}>
          <StarRating rating={Math.round(rating)} size={12} />
          {ratingCount > 0 && <Text style={styles.ratingCount}>{ratingCount}</Text>}
        </View>
      </View>
      <View style={styles.body}>
        <Text numberOfLines={2} style={styles.title}>
          {series.title}
        </Text>
        <Text numberOfLines={1} style={styles.author}>
          {authorText}
        </Text>
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{typeLabel}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.almondBorder,
    overflow: 'hidden',
    margin: 6,
  },
  imageWrap: {
    aspectRatio: 2 / 3,
    backgroundColor: `${colors.almondBorder}66`,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  ratingBar: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.almondBorder,
  },
  ratingCount: {
    fontSize: 10,
    color: colors.muted,
  },
  body: {
    padding: 10,
    gap: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.navy,
  },
  author: {
    fontSize: 11,
    color: colors.muted,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: `${colors.navy}14`,
    borderWidth: 1,
    borderColor: `${colors.navy}33`,
  },
  typeText: {
    fontSize: 10,
    color: colors.navy,
    fontWeight: '500',
  },
});
