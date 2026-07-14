import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { favoriteApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useRefreshControl } from '../hooks/usePullToRefresh';
import AuthPromptCard from '../components/auth/AuthPromptCard';
import SeriesGrid from '../components/SeriesGrid';
import LoadingSpinner from '../components/LoadingSpinner';
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

export default function FavoritesScreen({ navigation }) {
  const { isAuthenticated, loading: authLoading } = useAuth();

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoriteApi.getAll({ per_page: 50 }),
    enabled: isAuthenticated,
  });

  const refreshControl = useRefreshControl(refetch, {
    isFetching,
    isLoading: isAuthenticated && isLoading,
  });

  if (authLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return (
      <AuthPromptCard
        variant="favorites"
        message="Sign in to save and view your favorite manga in one place."
        onPrimaryPress={() => navigateToLogin(navigation)}
        secondaryPrefix="Don't have an account?"
        secondaryActionLabel="Sign Up"
        onSecondaryPress={() => navigateToRegister(navigation)}
      />
    );
  }

  const favorites = data?.data || [];
  const series = favorites.map((fav) => fav.series).filter(Boolean);

  const openSeries = (item) => {
    if (item?.slug) navigation.navigate('SeriesDetail', { slug: item.slug });
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={refreshControl}
    >
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
  empty: { alignItems: 'center', padding: 32 },
  message: { color: colors.muted, textAlign: 'center', marginBottom: 12 },
  link: { color: colors.redOrange, fontWeight: '600' },
});
