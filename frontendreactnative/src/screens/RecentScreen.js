import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { readingProgressApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useRefreshControl } from '../hooks/usePullToRefresh';
import AuthPromptCard from '../components/auth/AuthPromptCard';
import LoadingSpinner from '../components/LoadingSpinner';
import SeriesGrid from '../components/SeriesGrid';
import colors from '../theme/colors';

function navigateToLogin(navigation) {
  const parent = navigation.getParent();
  if (parent) {
    parent.navigate('Login');
    return;
  }
  navigation.navigate('Login');
}

function navigateToRegister(navigation) {
  const parent = navigation.getParent();
  if (parent) {
    parent.navigate('Register');
    return;
  }
  navigation.navigate('Register');
}

export default function RecentScreen({ navigation }) {
  const queryClient = useQueryClient();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [deletingSeriesId, setDeletingSeriesId] = useState(null);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['reading', 'continue'],
    queryFn: () => readingProgressApi.continueReading({ limit: 50 }),
    enabled: isAuthenticated,
  });

  const deleteMutation = useMutation({
    mutationFn: (seriesId) => readingProgressApi.clearSeries(seriesId),
    onMutate: (seriesId) => {
      setDeletingSeriesId(seriesId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['reading'] });
    },
    onSettled: () => {
      setDeletingSeriesId(null);
    },
  });

  const refreshControl = useRefreshControl(refetch, {
    isFetching,
    isLoading: isAuthenticated && isLoading,
  });

  const items = data?.data || [];

  const seriesList = useMemo(
    () =>
      items
        .map((item) => {
          if (!item?.series) return null;
          return {
            ...item.series,
            _continue: item,
          };
        })
        .filter(Boolean),
    [items]
  );

  const openItem = (series) => {
    const item = series?._continue;
    if (item?.series?.slug && item.chapter?.chapter_number != null) {
      navigation.navigate('Reader', {
        seriesSlug: item.series.slug,
        chapterNumber: item.chapter.chapter_number,
        title: item.series.title,
      });
      return;
    }
    if (series?.slug) {
      navigation.navigate('SeriesDetail', { slug: series.slug });
    }
  };

  const confirmDelete = (series) => {
    const seriesId = series?.id ?? series?._continue?.series_id;
    if (!seriesId) return;

    Alert.alert(
      'Remove from recent?',
      `Remove "${series.title || 'this series'}" from your recent reads?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(seriesId),
        },
      ]
    );
  };

  if (authLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return (
      <AuthPromptCard
        variant="recent"
        message="Sign in to track and resume your latest series, chapters, and pages."
        onPrimaryPress={() => navigateToLogin(navigation)}
        secondaryPrefix="Don't have an account?"
        secondaryActionLabel="Sign Up"
        onSecondaryPress={() => navigateToRegister(navigation)}
      />
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={refreshControl}
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : seriesList.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.message}>No recent reads yet.</Text>
          <Pressable onPress={() => navigation.navigate('Browse')}>
            <Text style={styles.link}>Browse manga to start reading</Text>
          </Pressable>
        </View>
      ) : (
        <SeriesGrid
          series={seriesList}
          loading={false}
          onSeriesPress={openItem}
          onSeriesDelete={confirmDelete}
          deletingSeriesId={deletingSeriesId}
          section="recently_viewed"
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.almond },
  content: { paddingBottom: 32 },
  empty: { alignItems: 'center', padding: 32 },
  message: { color: colors.muted, textAlign: 'center', marginBottom: 12 },
  link: { color: colors.redOrange, fontWeight: '600' },
});
