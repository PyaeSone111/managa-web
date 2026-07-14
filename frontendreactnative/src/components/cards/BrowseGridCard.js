import { Pressable, StyleSheet, Text, View } from 'react-native';
import { seriesToManga } from '../../lib/seriesToManga';
import { getCardGridScale } from '../../utils/cardGridScale';
import { CoverImage, RatingRow, StatusBadge } from './shared';
import colors from '../../theme/colors';

export { getBrowseGridScale, getCardGridScale } from '../../utils/cardGridScale';

export default function BrowseGridCard({ series, numColumns = 2, screenWidth, onPress }) {
  const manga = seriesToManga(series);
  const scale = getCardGridScale(numColumns, screenWidth);

  if (!manga) return null;

  return (
    <Pressable
      onPress={() => onPress?.(series)}
      style={[styles.card, { margin: scale.margin }]}
    >
      <CoverImage
        uri={manga.coverUrl}
        style={[styles.cover, scale.coverAspect ? { aspectRatio: scale.coverAspect } : null]}
      >
        <View style={[styles.badgeWrap, { transform: [{ scale: scale.badgeScale }] }]}>
          <StatusBadge status={manga.status} />
        </View>
      </CoverImage>
      <View style={[styles.body, { padding: scale.bodyPad, gap: scale.bodyPad > 6 ? 4 : 2 }]}>
        <Text
          numberOfLines={scale.titleLines}
          style={[styles.title, { fontSize: scale.titleSize, lineHeight: scale.titleSize + 3 }]}
        >
          {manga.title}
        </Text>
        <Text
          numberOfLines={scale.authorLines}
          style={[styles.author, { fontSize: scale.authorSize }]}
        >
          {manga.author}
        </Text>
        <RatingRow
          rating={manga.rating}
          ratingCount={scale.showRatingCount ? manga.ratingCount : undefined}
          size={scale.ratingSize}
          showValue={numColumns <= 2}
        />
        {scale.showGenre && manga.genre ? (
          <Text numberOfLines={1} style={[styles.meta, { fontSize: scale.metaSize }]}>
            {manga.genre}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.almondBorder,
    overflow: 'hidden',
  },
  cover: {
    aspectRatio: 2 / 3,
    width: '100%',
  },
  badgeWrap: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  body: {
    minHeight: 0,
  },
  title: {
    fontWeight: '600',
    color: colors.navy,
  },
  author: {
    color: colors.muted,
  },
  meta: {
    color: colors.muted,
  },
});
