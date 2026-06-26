import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRefreshControl } from '../hooks/usePullToRefresh';
import { rankingsApi } from '../services/api';
import { RANKING_TABS } from '../utils/constants';
import SeriesGrid from '../components/SeriesGrid';
import colors from '../theme/colors';

const PERIOD_OPTIONS = [
  { value: 'all', label: 'All Time' },
  { value: 'daily', label: 'Today' },
  { value: 'weekly', label: 'This Week' },
  { value: 'monthly', label: 'This Month' },
];

export default function RankingsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('top');
  const [period, setPeriod] = useState('all');

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['rankings', activeTab, period],
    queryFn: () => {
      const params = { per_page: 50 };
      if (period !== 'all') params.period = period;
      switch (activeTab) {
        case 'reading':
          return rankingsApi.getTopReading(params);
        case 'trending':
          return rankingsApi.getTrending(params);
        default:
          return rankingsApi.getTop(params);
      }
    },
  });

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
      <View style={styles.header}>
        {/* <Text style={styles.title}>Rankings</Text> */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.periodRow}>
          {PERIOD_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => setPeriod(opt.value)}
              style={[styles.periodChip, period === opt.value && styles.periodChipActive]}
            >
              <Text style={period === opt.value ? styles.periodTextActive : styles.periodText}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.tabs}>
        {RANKING_TABS.map((tab) => (
          <Pressable
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
          >
            <Text style={activeTab === tab.id ? styles.tabTextActive : styles.tabText}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.description}>
        {RANKING_TABS.find((t) => t.id === activeTab)?.description}
      </Text>

      {error ? (
        <Text style={styles.error}>{error.message || 'Failed to load rankings'}</Text>
      ) : (
        <SeriesGrid
          series={data?.data || []}
          loading={isLoading}
          onSeriesPress={openSeries}
          section={
            activeTab === 'top'
              ? 'rankings_top'
              : activeTab === 'reading'
                ? 'rankings_most_read'
                : 'rankings_trending'
          }
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.almond },
  content: { paddingBottom: 24 },
  header: { padding: 16, gap: 12 },
  title: { fontSize: 24, fontWeight: '700', color: colors.navy },
  periodRow: { flexGrow: 0 },
  periodChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.almondBorder,
    backgroundColor: colors.white,
    marginRight: 8,
  },
  periodChipActive: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  periodText: { color: colors.navy, fontSize: 13 },
  periodTextActive: { color: colors.white, fontSize: 13, fontWeight: '600' },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.almondBorder,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.redOrange,
  },
  tabText: { color: colors.muted, fontSize: 13, fontWeight: '500' },
  tabTextActive: { color: colors.navy, fontSize: 13, fontWeight: '700' },
  description: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.muted,
    fontSize: 13,
  },
  error: { textAlign: 'center', color: colors.muted, padding: 24 },
});
