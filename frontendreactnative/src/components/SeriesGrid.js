import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useBranding } from '../context/BrandingContext';
import MangaCard, { getNumColumnsForSection, isPortraitCard, getCardKeyForSection } from './cards/MangaCard';
import colors from '../theme/colors';

function SkeletonCard({ portrait }) {
  if (portrait) {
    return (
      <View style={styles.skeletonPortrait}>
        <View style={styles.skeletonImage} />
        <View style={styles.skeletonLine} />
        <View style={styles.skeletonLineShort} />
      </View>
    );
  }
  return (
    <View style={styles.skeletonLandscape}>
      <View style={styles.skeletonThumb} />
      <View style={styles.skeletonLandscapeBody}>
        <View style={styles.skeletonLine} />
        <View style={styles.skeletonLineShort} />
      </View>
    </View>
  );
}

export default function SeriesGrid({
  series = [],
  loading = false,
  onSeriesPress,
  section,
  numColumns: numColumnsProp,
}) {
  const { cardLayout, gridColumns, layoutVersion } = useBranding();
  const useDesignCards = Boolean(section);
  const cardKey = useDesignCards ? getCardKeyForSection(section, cardLayout) : 'card_01';
  const portrait = useDesignCards ? isPortraitCard(cardKey) : true;
  const numColumns =
    numColumnsProp ??
    (useDesignCards ? getNumColumnsForSection(section, cardLayout, gridColumns) : 2);

  if (loading) {
    return (
      <View key={`skeleton-${section}-${layoutVersion}`} style={styles.grid}>
        {[...Array(portrait ? 6 : 4)].map((_, i) => (
          <View key={i} style={{ width: `${100 / numColumns}%`, padding: 6 }}>
            <SkeletonCard portrait={portrait} />
          </View>
        ))}
      </View>
    );
  }

  if (!series?.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No series found.</Text>
      </View>
    );
  }

  if (useDesignCards && !portrait) {
    return (
      <View style={styles.list} key={`${section}-${cardKey}-${layoutVersion}`}>
        {series.map((item, index) => (
          <MangaCard
            key={`${item.id}-${cardKey}`}
            series={item}
            section={section}
            cardKey={cardKey}
            rank={index + 1}
            onPress={onSeriesPress}
            style={{ marginHorizontal: 10, marginVertical: 6 }}
          />
        ))}
      </View>
    );
  }

  return (
    <FlatList
      data={series}
      key={`${section || 'grid'}-${cardKey}-${numColumns}-${layoutVersion}`}
      keyExtractor={(item) => String(item.id)}
      numColumns={numColumns}
      scrollEnabled={false}
      extraData={`${cardKey}-${numColumns}-${layoutVersion}`}
      columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
      contentContainerStyle={styles.listContent}
      renderItem={({ item, index }) =>
        useDesignCards ? (
          <View style={{ flex: 1 / numColumns }}>
            <MangaCard
              series={item}
              section={section}
              cardKey={cardKey}
              rank={index + 1}
              onPress={onSeriesPress}
            />
          </View>
        ) : (
          <View style={{ flex: 1 / numColumns }}>
            <MangaCard series={item} section="home_latest" onPress={onSeriesPress} />
          </View>
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
  list: {
    paddingBottom: 8,
  },
  listContent: {
    paddingHorizontal: 4,
  },
  row: {
    gap: 0,
  },
  empty: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
  },
  skeletonPortrait: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.almondBorder,
    padding: 10,
  },
  skeletonImage: {
    aspectRatio: 2 / 3,
    backgroundColor: `${colors.almondBorder}88`,
    borderRadius: 8,
    marginBottom: 8,
  },
  skeletonLandscape: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.almondBorder,
    padding: 10,
    minHeight: 120,
  },
  skeletonThumb: {
    width: 72,
    backgroundColor: `${colors.almondBorder}88`,
    borderRadius: 8,
    marginRight: 10,
  },
  skeletonLandscapeBody: {
    flex: 1,
    justifyContent: 'center',
    gap: 8,
  },
  skeletonLine: {
    height: 12,
    backgroundColor: `${colors.almondBorder}88`,
    borderRadius: 4,
    width: '80%',
  },
  skeletonLineShort: {
    height: 10,
    backgroundColor: `${colors.almondBorder}66`,
    borderRadius: 4,
    width: '50%',
  },
});
