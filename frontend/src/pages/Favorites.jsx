import { useQuery } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { favoriteApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SeriesGrid from '../components/series/SeriesGrid';
import LoadingSpinner from '../components/common/LoadingSpinner';

function Favorites() {
  const { isAuthenticated, loading: authLoading } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoriteApi.getAll({ per_page: 50 }),
    enabled: isAuthenticated,
  });

  if (authLoading) {
    return <LoadingSpinner size="lg" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const favorites = data?.data || [];
  const series = favorites.map((fav) => fav.series).filter(Boolean);

  return (
    <>
      <Helmet>
        <title>My Favorites - Manga Web</title>
      </Helmet>

      <div className="space-y-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          My Favorites
        </h1>

        {isLoading ? (
          <LoadingSpinner size="lg" />
        ) : series.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white mb-4">
              You haven't favorited any manga yet.
            </p>
            <a
              href="/browse"
              className="text-silver-grass hover:text-white hover:underline transition-colors"
            >
              Browse manga to find something you like
            </a>
          </div>
        ) : (
          <SeriesGrid series={series} layout="horizontal" />
        )}
      </div>
    </>
  );
}

export default Favorites;
