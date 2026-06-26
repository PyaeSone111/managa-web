import { Image, StyleSheet, Text, View } from 'react-native';
import colors from '../../theme/colors';
import StarRating from '../StarRating';

export function StatusBadge({ status }) {
  return (
    <View style={styles.statusBadge}>
      <Text style={styles.statusText}>{status}</Text>
    </View>
  );
}

export function GenreBadge({ label }) {
  return (
    <View style={styles.genreBadge}>
      <Text style={styles.genreText}>{label}</Text>
    </View>
  );
}

export function RatingRow({ rating, ratingCount, size = 12, showValue = true }) {
  return (
    <View style={styles.ratingRow}>
      <StarRating rating={Math.round(rating)} size={size} />
      {showValue ? <Text style={styles.ratingValue}>{rating.toFixed(1)}</Text> : null}
      {ratingCount != null && ratingCount > 0 ? (
        <Text style={styles.ratingCount}>({ratingCount.toLocaleString()})</Text>
      ) : null}
    </View>
  );
}

export function CoverImage({ uri, style, imageStyle, children }) {
  return (
    <View style={[styles.coverWrap, style]}>
      <Image source={{ uri: uri || undefined }} style={[styles.coverImage, imageStyle]} resizeMode="cover" />
      {children}
    </View>
  );
}

export const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.almondBorder,
    overflow: 'hidden',
  },
  cardBody: {
    padding: 12,
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
  meta: {
    fontSize: 10,
    color: colors.muted,
  },
  landscape: {
    flexDirection: 'row',
    minHeight: 140,
  },
  landscapeCover: {
    width: 96,
    backgroundColor: `${colors.almondBorder}66`,
  },
  landscapeBody: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  glass: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: `${colors.almondBorder}99`,
  },
});

const styles = StyleSheet.create({
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.navy,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  genreBadge: {
    alignSelf: 'flex-start',
    backgroundColor: `${colors.redOrange}18`,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: `${colors.redOrange}33`,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  genreText: {
    fontSize: 10,
    color: colors.redOrange,
    fontWeight: '500',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingValue: {
    fontSize: 10,
    color: colors.redOrange,
    fontWeight: '600',
  },
  ratingCount: {
    fontSize: 10,
    color: colors.muted,
  },
  coverWrap: {
    backgroundColor: `${colors.almondBorder}66`,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
});
