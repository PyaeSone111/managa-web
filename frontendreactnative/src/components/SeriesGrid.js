import { FlatList, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useBranding } from '../context/BrandingContext';
import MangaCard, { isPortraitCard, getCardKeyForSection } from './cards/MangaCard';
import RecentMangaCard from './cards/RecentMangaCard';
import { getGridColumnsForSection } from '../utils/gridColumns';
import colors from '../theme/colors';

function SkeletonCard({ portrait, compact }) {
  if (portrait || compact) {
    return (
      <View style={[styles.skeletonPortrait, compact && styles.skeletonCompact]}>
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
  onSeriesDelete,
  deletingSeriesId = null,
  section,
  numColumns: numColumnsProp,
}) {
  const { width } = useWindowDimensions();
  const { cardLayout, gridColumns, layoutVersion } = useBranding();
  const isRecent = section === 'recently_viewed';
  const useDesignCards = Boolean(section);
  const cardKey = useDesignCards ? getCardKeyForSection(section, cardLayout) : 'card_01';
  const portrait = useDesignCards ? isPortraitCard(cardKey) : true;
  const numColumns =
    numColumnsProp ??
    (useDesignCards
      ? getGridColumnsForSection(section, width, gridColumns, cardLayout)
      : 2);
  const compact = numColumns >= 3;
  // Recent with landscape cards can use list/grid like other sections.
  const useListLayout = useDesignCards && !portrait && numColumns === 1 && !isRecent;
  const horizontalPad = compact ? 4 : 8;

  if (loading) {
    const skeletonCount = portrait || compact ? numColumns * 3 : 4;
    return (
      <View key={`skeleton-${section}-${layoutVersion}-${numColumns}`} style={[styles.grid, { paddingHorizontal: horizontalPad }]}>
        {[...Array(skeletonCount)].map((_, i) => (
          <View key={i} style={{ width: `${100 / numColumns}%`, padding: compact ? 2 : 6 }}>
            <SkeletonCard portrait={portrait || compact} compact={compact} />
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

  if (isRecent) {
    // Landscape (11–20) must be a full-width vertical list — multi-col squeezes them.
    if (!portrait) {
      return (
        <View style={styles.list} key={`recent-landscape-${cardKey}-${layoutVersion}`}>
          {series.map((item, index) => (
            <RecentMangaCard
              key={`${item.id}-${cardKey}-${layoutVersion}`}
              series={item}
              rank={index + 1}
              onContinue={onSeriesPress}
              onDelete={onSeriesDelete}
              deleting={deletingSeriesId === item.id}
              numColumns={1}
              screenWidth={width}
              style={styles.recentLandscapeItem}
            />
          ))}
        </View>
      );
    }

    return (
      <FlatList
        data={series}
        key={`recent-${cardKey}-${numColumns}-${layoutVersion}`}
        keyExtractor={(item) => String(item.id)}
        numColumns={numColumns}
        scrollEnabled={false}
        extraData={`${cardKey}-${numColumns}-${layoutVersion}-${width}-${deletingSeriesId}`}
        columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
        contentContainerStyle={[styles.listContent, { paddingHorizontal: horizontalPad }]}
        renderItem={({ item, index }) => (
          <View style={{ flex: 1 / numColumns }} key={`${item.id}-${cardKey}-${layoutVersion}`}>
            <RecentMangaCard
              series={item}
              rank={index + 1}
              onContinue={onSeriesPress}
              onDelete={onSeriesDelete}
              deleting={deletingSeriesId === item.id}
              numColumns={numColumns}
              screenWidth={width}
            />
          </View>
        )}
      />
    );
  }

  if (useListLayout) {
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
            screenWidth={width}
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
      extraData={`${cardKey}-${numColumns}-${layoutVersion}-${width}`}
      columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
      contentContainerStyle={[styles.listContent, { paddingHorizontal: horizontalPad }]}
      renderItem={({ item, index }) =>
        useDesignCards ? (
          <View style={{ flex: 1 / numColumns }}>
            <MangaCard
              series={item}
              section={section}
              cardKey={cardKey}
              rank={index + 1}
              onPress={onSeriesPress}
              numColumns={numColumns}
              screenWidth={width}
            />
          </View>
        ) : (
          <View style={{ flex: 1 / numColumns }}>
            <MangaCard
              series={item}
              section="home_latest"
              onPress={onSeriesPress}
              numColumns={numColumns}
              screenWidth={width}
            />
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
  },
  list: {
    paddingBottom: 8,
  },
  recentLandscapeItem: {
    marginHorizontal: 12,
    marginVertical: 6,
    flex: 0,
    width: undefined,
    alignSelf: 'stretch',
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
  skeletonCompact: {
    padding: 4,
    borderRadius: 8,
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
