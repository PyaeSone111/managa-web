import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { favoriteApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SeriesGrid from '../components/SeriesGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import colors from '../theme/colors';

export default function FavoritesScreen({ navigation }) {
  const { isAuthenticated, loading: authLoading } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoriteApi.getAll({ per_page: 50 }),
    enabled: isAuthenticated,
  });

  if (authLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>Sign in to view your favorites.</Text>
        <Pressable style={styles.button} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.buttonText}>Sign In</Text>
        </Pressable>
      </View>
    );
  }

  const favorites = data?.data || [];
  const series = favorites.map((fav) => fav.series).filter(Boolean);

  const openSeries = (item) => {
    if (item?.slug) navigation.navigate('SeriesDetail', { slug: item.slug });
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>My Favorites</Text>
      {!isLoading && series.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.message}>You haven't favorited any manga yet.</Text>
          <Pressable onPress={() => navigation.navigate('Browse')}>
            <Text style={styles.link}>Browse manga to find something you like</Text>
          </Pressable>
        </View>
      ) : (
        <SeriesGrid series={series} loading={isLoading} onSeriesPress={openSeries} section="favorites" />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.almond },
  content: { paddingBottom: 24 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.almond,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.navy,
    padding: 16,
  },
  empty: { alignItems: 'center', padding: 32 },
  message: { color: colors.muted, textAlign: 'center', marginBottom: 12 },
  link: { color: colors.redOrange, fontWeight: '600' },
  button: {
    backgroundColor: colors.redOrange,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonText: { color: colors.white, fontWeight: '600' },
});
