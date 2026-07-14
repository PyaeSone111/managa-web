import { Image, StyleSheet, Text, View } from 'react-native';
import colors from '../../theme/colors';
import StarRating from '../StarRating';

export function StatusBadge({ status, scale }) {
  const tight = scale?.compactCard;
  return (
    <View style={[styles.statusBadge, tight && styles.statusBadgeTight]}>
      <Text style={[styles.statusText, tight && styles.statusTextTight]}>{status}</Text>
    </View>
  );
}

export function GenreBadge({ label, scale }) {
  const tight = scale?.compactCard;
  return (
    <View style={[styles.genreBadge, tight && styles.genreBadgeTight]}>
      <Text style={[styles.genreText, tight && styles.genreTextTight]}>{label}</Text>
    </View>
  );
}

export function RatingRow({ rating, ratingCount, size = 12, showValue = true, scale }) {
  const starSize = scale?.ratingSize ?? size;
  const showCount = showValue && (!scale || scale.showRatingCount !== false);
  return (
    <View style={styles.ratingRow}>
      <StarRating rating={Math.round(rating)} size={starSize} />
      {showCount ? (
        <Text style={[styles.ratingValue, scale && { fontSize: scale.metaSize }]}>{rating.toFixed(1)}</Text>
      ) : null}
      {ratingCount != null && ratingCount > 0 && showCount ? (
        <Text style={[styles.ratingCount, scale && { fontSize: scale.metaSize }]}>
          ({ratingCount.toLocaleString()})
        </Text>
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

/** Tri-color vertical accent (navy → mango → red-orange) for card left edge. */
export function ThemeLeftBorder({ width = 4, style }) {
  return (
    <View style={[styles.themeLeftBorder, { width }, style]}>
      <View style={[styles.themeLeftSeg, styles.themeLeftNavy]} />
      <View style={[styles.themeLeftSeg, styles.themeLeftMango]} />
      <View style={[styles.themeLeftSeg, styles.themeLeftOrange]} />
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
  statusBadgeTight: {
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  statusTextTight: {
    fontSize: 7,
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
  genreBadgeTight: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  genreTextTight: {
    fontSize: 7,
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
  themeLeftBorder: {
    alignSelf: 'stretch',
    flexDirection: 'column',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    overflow: 'hidden',
  },
  themeLeftSeg: {
    flex: 1,
  },
  themeLeftNavy: {
    backgroundColor: colors.navy,
  },
  themeLeftMango: {
    backgroundColor: colors.mango,
  },
  themeLeftOrange: {
    backgroundColor: colors.redOrange,
  },
});
