import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { favoriteApi, ratingApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useProfileImage } from '../context/ProfileImageContext';
import SeriesGrid from '../components/SeriesGrid';
import ProfileAvatar from '../components/ProfileAvatar';
import StarRating from '../components/StarRating';
import LoadingSpinner from '../components/LoadingSpinner';
import AuthPromptCard from '../components/auth/AuthPromptCard';
import AppDownloadInfo from '../components/profile/AppDownloadInfo';
import { ProfilePageLogo } from '../components/navigation/HeaderBrandLogo';
import colors from '../theme/colors';

function navigateToSeries(navigation, slug) {
  const parent = navigation.getParent();
  if (parent) {
    parent.navigate('SeriesDetail', { slug });
    return;
  }
  navigation.navigate('SeriesDetail', { slug });
}

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

export default function ProfileScreen({ navigation }) {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const { profileImageUri, loading: imageLoading, showProfileImageOptions } = useProfileImage();

  const { data: favoritesData, isLoading: favoritesLoading } = useQuery({
    queryKey: ['favorites', 'profile'],
    queryFn: () => favoriteApi.getAll({ per_page: 50 }),
    enabled: isAuthenticated,
  });

  const { data: ratingsData, isLoading: ratingsLoading } = useQuery({
    queryKey: ['user-ratings'],
    queryFn: () => ratingApi.getAll({ per_page: 50 }),
    enabled: isAuthenticated,
  });

  if (authLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return (
      <AuthPromptCard
        variant="profile"
        message="Sign in to manage your profile, favorites, and ratings."
        onPrimaryPress={() => navigateToLogin(navigation)}
        secondaryPrefix="Don't have an account?"
        secondaryActionLabel="Sign Up"
        onSecondaryPress={() => navigateToRegister(navigation)}
        footer={<AppDownloadInfo embedded />}
      />
    );
  }

  const favoriteSeries = (favoritesData?.data || [])
    .map((item) => item.series)
    .filter(Boolean);

  const ratedItems = (ratingsData?.data || []).filter((item) => item.series);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.profileCard}>
        <ProfilePageLogo />
        <ProfileAvatar
          name={user?.name}
          imageUri={profileImageUri}
          size={96}
          loading={imageLoading}
          showEditBadge
          onPress={showProfileImageOptions}
        />
        <Text style={styles.photoHint}>Tap photo to change or remove</Text>
        <Text style={styles.name}>{user?.name || 'User'}</Text>
        {user?.email ? <Text style={styles.email}>{user.email}</Text> : null}
        <Pressable style={styles.signOutBtn} onPress={logout}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </View>

      <AppDownloadInfo />

      <Text style={styles.sectionTitle}>Favorite Manga</Text>
      {!favoritesLoading && favoriteSeries.length === 0 ? (
        <Text style={styles.emptyText}>You have not favorited any manga yet.</Text>
      ) : (
        <SeriesGrid
          series={favoriteSeries}
          loading={favoritesLoading}
          onSeriesPress={(item) => item?.slug && navigateToSeries(navigation, item.slug)}
          section="favorites"
        />
      )}

      <Text style={styles.sectionTitle}>Rated Manga</Text>
      {!ratingsLoading && ratedItems.length === 0 ? (
        <Text style={styles.emptyText}>You have not rated any manga yet.</Text>
      ) : ratingsLoading ? (
        <SeriesGrid series={[]} loading section="favorites" />
      ) : (
        <View style={styles.ratedList}>
          {ratedItems.map((item) => {
            const series = item.series;
            const rating1to5 = item.rating != null ? Math.round(item.rating / 2) : 0;

            return (
              <Pressable
                key={item.id || `${series.id}-${item.rating}`}
                style={styles.ratedItem}
                onPress={() => series?.slug && navigateToSeries(navigation, series.slug)}
              >
                <View style={styles.ratedMain}>
                  <Text style={styles.ratedTitle} numberOfLines={2}>
                    {series.title}
                  </Text>
                  <View style={styles.ratedMeta}>
                    <StarRating rating={rating1to5} size={14} />
                    <Text style={styles.ratedValue}>{rating1to5}/5</Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.almond },
  content: { paddingBottom: 32 },
  profileCard: {
    margin: 16,
    marginBottom: 8,
    padding: 20,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.almondBorder,
    alignItems: 'center',
  },
  photoHint: {
    marginTop: 10,
    marginBottom: 4,
    fontSize: 12,
    color: colors.muted,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 14,
  },
  signOutBtn: {
    alignSelf: 'stretch',
    marginTop: 4,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.navy,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  signOutText: {
    color: colors.navy,
    fontWeight: '600',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.navy,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  emptyText: {
    color: colors.muted,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  ratedList: {
    paddingHorizontal: 10,
    gap: 8,
  },
  ratedItem: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.almondBorder,
    padding: 14,
    marginHorizontal: 6,
  },
  ratedMain: {
    gap: 8,
  },
  ratedTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.navy,
  },
  ratedMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratedValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted,
  },
});
