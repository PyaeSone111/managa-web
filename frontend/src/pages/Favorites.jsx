import { useQuery } from '@tanstack/react-query';
import { Navigate, Link } from 'react-router-dom';
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

      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-black-feather">
          My Favorites
        </h1>

        {!isLoading && series.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sidewalk-grey mb-4">
              You haven't favorited any manga yet.
            </p>
            <Link
              to="/browse"
              className="text-ruskin-blue hover:text-delta-green hover:underline transition-colors font-medium"
            >
              Browse manga to find something you like
            </Link>
          </div>
        ) : (
          <SeriesGrid
            section="favorites"
            series={series}
            loading={isLoading}
          />
        )}
      </div>
    </>
  );
}

export default Favorites;
