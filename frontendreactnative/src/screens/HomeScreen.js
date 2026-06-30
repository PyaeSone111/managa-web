import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../services/api';
import { useRefreshControl } from '../hooks/usePullToRefresh';
import HeroBanner from '../components/HeroBanner';
import SeriesGrid from '../components/SeriesGrid';
import RecentlyViewedCarousel from '../components/RecentlyViewedCarousel';
import colors from '../theme/colors';

function SectionHeader({ title, onViewAll }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onViewAll ? (
        <Pressable onPress={onViewAll}>
          <Text style={styles.viewAll}>View All</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const { data: dashboard, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['dashboard', 'home'],
    queryFn: () => dashboardApi.getHomepage({ limit: 12 }),
    staleTime: 5 * 60 * 1000,
  });

  const latest = dashboard?.data?.latest || [];
  const newSeries = dashboard?.data?.new || [];
  const trending = dashboard?.data?.trending || [];
  const topRated = dashboard?.data?.top || [];

  const openSeries = (series) => {
    if (series?.slug) navigation.navigate('SeriesDetail', { slug: series.slug });
  };

  const refreshControl = useRefreshControl(refetch, { isFetching, isLoading });

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={refreshControl}
    >
      <HeroBanner onBrowsePress={() => navigation.navigate('Browse')} />
      {/* <RecentlyViewedCarousel onSeriesPress={openSeries} /> */}

      <SectionHeader title="Latest Release" onViewAll={() => navigation.navigate('Browse', { sort: 'latest' })} />
      <SeriesGrid series={latest} loading={isLoading} onSeriesPress={openSeries} section="home_latest" />

      <SectionHeader title="Popular" onViewAll={() => navigation.navigate('Rankings')} />
      <SeriesGrid series={topRated} loading={isLoading} onSeriesPress={openSeries} section="home_popular" />

      <SectionHeader title="Weekly Highlights" onViewAll={() => navigation.navigate('Rankings')} />
      <SeriesGrid series={trending} loading={isLoading} onSeriesPress={openSeries} section="home_weekly_highlights" />

      <SectionHeader title="Recently Added" onViewAll={() => navigation.navigate('Browse', { sort: 'newest' })} />
      <SeriesGrid series={newSeries} loading={isLoading} onSeriesPress={openSeries} section="home_recently_added" />

      {/* <View style={styles.footer}>
        <Pressable onPress={() => navigation.navigate('PrivacyPolicy')}>
          <Text style={styles.footerLink}>Privacy Policy</Text>
        </Pressable>
        <Text style={styles.footerDot}>·</Text>
        <Pressable onPress={() => navigation.navigate('ContactUs')}>
          <Text style={styles.footerLink}>Contact Us</Text>
        </Pressable>
        <Pressable style={styles.authLink} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.footerLink}>Account</Text>
        </Pressable>
      </View> */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.almond,
  },
  content: {
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.navy,
  },
  viewAll: {
    fontSize: 14,
    color: colors.navy,
    fontWeight: '600',
  },
  browseCard: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.almondBorder,
    padding: 16,
  },
  browseTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.navy,
    marginBottom: 6,
  },
  browseText: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
    marginBottom: 12,
  },
  browseButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.redOrange,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  browseButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 20,
  },
  footerLink: {
    color: colors.navy,
    fontSize: 13,
    fontWeight: '600',
  },
  footerDot: {
    color: colors.muted,
  },
  authLink: {
    marginLeft: 8,
  },
});
