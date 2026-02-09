import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { addRecentlyViewed } from '../hooks/useRecentlyViewed';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { seriesApi, favoriteApi, ratingApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ChapterList from '../components/chapters/ChapterList';

function StarRating({ rating, onRate, interactive = false, size = 'md' }) {
  const [hovered, setHovered] = useState(0);
  const sizeClass = size === 'lg' ? 'w-7 h-7' : 'w-5 h-5';

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onRate(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={`${sizeClass} ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
        >
          <svg
            viewBox="0 0 24 24"
            fill={(hovered || rating) >= star ? '#516D74' : 'none'}
            stroke={(hovered || rating) >= star ? '#516D74' : '#C9D0D9'}
            strokeWidth="1.5"
          >
            <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function FavoriteButton({ seriesId }) {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const { data: favoriteData } = useQuery({
    queryKey: ['favorite', seriesId],
    queryFn: () => favoriteApi.check(seriesId),
    enabled: isAuthenticated,
  });

  const isFavorited = favoriteData?.is_favorited ?? false;

  const addMutation = useMutation({
    mutationFn: () => favoriteApi.add(seriesId),
    onSuccess: (data) => {
      queryClient.setQueryData(['favorite', seriesId], { is_favorited: data?.is_favorited ?? true });
      queryClient.invalidateQueries({ queryKey: ['series'] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: () => favoriteApi.remove(seriesId),
    onSuccess: (data) => {
      queryClient.setQueryData(['favorite', seriesId], { is_favorited: data?.is_favorited ?? false });
      queryClient.invalidateQueries({ queryKey: ['series'] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const isLoading = addMutation.isPending || removeMutation.isPending;

  const handleToggle = () => {
    if (isFavorited) {
      removeMutation.mutate();
    } else {
      addMutation.mutate();
    }
  };

  if (!isAuthenticated) {
    return (
      <Link
        to="/login"
        className="inline-flex items-center gap-2 px-4 py-2 border border-quarzo rounded-lg bg-white text-black-feather hover:bg-quarzo/30 transition-colors text-sm shadow-sm"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
        Favorite
      </Link>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-50 shadow-sm ${
        isFavorited
          ? 'bg-delta-green text-white hover:bg-ruskin-blue'
          : 'border border-quarzo bg-white text-black-feather hover:bg-quarzo/30'
      }`}
    >
      <svg className="w-5 h-5" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
      {isFavorited ? 'Favorited' : 'Favorite'}
    </button>
  );
}

function UserRating({ seriesId, slug }) {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const { data: ratingData } = useQuery({
    queryKey: ['rating', seriesId],
    queryFn: () => ratingApi.get(seriesId),
    enabled: isAuthenticated,
  });

  const userRating = ratingData?.data?.rating != null ? Math.round(ratingData.data.rating / 2) : 0;

  const rateMutation = useMutation({
    mutationFn: (rating) => ratingApi.rate(seriesId, rating),
    onSuccess: (data, variables) => {
      const newRating1to10 = data?.data?.user_rating ?? variables * 2;
      queryClient.setQueryData(['rating', seriesId], { data: { rating: newRating1to10, rated_at: new Date().toISOString() } });
      const avgRating = data?.data?.series_average_rating;
      const ratingCount = data?.data?.series_rating_count;
      if (slug != null && (avgRating != null || ratingCount != null)) {
        queryClient.setQueryData(['series', slug], (prev) => {
          if (!prev?.data) return prev;
          return {
            ...prev,
            data: {
              ...prev.data,
              ...(avgRating != null && { rating: avgRating, average_rating: avgRating }),
              ...(ratingCount != null && { rating_count: ratingCount }),
            },
          };
        });
      }
      queryClient.invalidateQueries({ queryKey: ['series'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['rankings'] });
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <StarRating rating={0} size="md" />
        <Link to="/login" className="text-sm text-ruskin-blue hover:text-delta-green hover:underline transition-colors">
          Log in to rate
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-sidewalk-grey">Your Rating:</span>
      <StarRating
        rating={userRating}
        onRate={(star) => rateMutation.mutate(star)}
        interactive
        size="md"
      />
      {userRating > 0 && (
        <span className="text-sm text-black-feather font-medium">{userRating}/5</span>
      )}
    </div>
  );
}

function SeriesDetail() {
  const { slug } = useParams();

  const { data: series, isLoading } = useQuery({
    queryKey: ['series', slug],
    queryFn: () => seriesApi.getById(slug),
  });

  const { data: chapters } = useQuery({
    queryKey: ['series', slug, 'chapters'],
    queryFn: () => seriesApi.getChapters(slug),
    enabled: !!slug,
  });

  useEffect(() => {
    if (series?.data?.slug) {
      addRecentlyViewed(series.data);
    }
  }, [series?.data?.slug]);

  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }

  if (!series?.data) {
    return (
      <div className="text-center py-12">
        <p className="text-sidewalk-grey">Series not found.</p>
      </div>
    );
  }

  const seriesData = series.data;

  return (
    <>
      <Helmet>
        <title>{seriesData.title} - Myangar</title>
        <meta name="description" content={seriesData.description} />
        {seriesData.thumbnail_url && (
          <meta property="og:image" content={seriesData.thumbnail_url} />
        )}
      </Helmet>

      <div className="space-y-6">
        {/* Hero card */}
        <div className="bg-white rounded-xl border border-quarzo shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-6">
            <img
              src={seriesData.cover_url || seriesData.thumbnail_url || '/placeholder.svg?height=400&width=280'}
              alt={seriesData.title}
              className="w-full sm:w-48 md:w-56 lg:w-64 h-auto rounded-lg mx-auto sm:mx-0 shadow-sm"
            />
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-black-feather mb-1 text-balance">
                {seriesData.title}
              </h1>

              {/* Alternate Names */}
              {seriesData.alt_names?.length > 0 && (
                <p className="text-sm text-sidewalk-grey mb-3">
                  Also known as: {seriesData.alt_names.map((a) => a.name).join(', ')}
                </p>
              )}

              {/* Rating Summary & Favorite */}
              <div className="flex flex-wrap items-center gap-4 mb-3">
                <div className="flex items-center gap-2">
                  {(() => {
                    const rating1to10 = seriesData.average_rating ?? seriesData.rating;
                    const rating1to5 = rating1to10 != null && rating1to10 > 0 ? Number(rating1to10) / 2 : null;
                    const starRating = rating1to5 != null ? Math.round(rating1to5) : 0;
                    const displayText = rating1to5 != null ? `${rating1to5.toFixed(1)}/5` : 'N/A';
                    const count = seriesData.rating_count ?? 0;
                    return (
                      <>
                        <StarRating rating={starRating} />
                        <span className="text-sm text-black-feather font-medium">
                          {displayText}
                          {count > 0 && <span className="ml-1 text-sidewalk-grey font-normal">({count} ratings)</span>}
                        </span>
                      </>
                    );
                  })()}
                </div>
                <FavoriteButton seriesId={seriesData.id} />
                {seriesData.total_favorites > 0 && (
                  <span className="text-sm text-sidewalk-grey">
                    {seriesData.total_favorites.toLocaleString()} favorites
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-sm sm:text-base text-black-feather/80 mb-3 sm:mb-4 leading-relaxed line-clamp-4">
                {seriesData.description}
              </p>

              {/* Categories */}
              <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                {seriesData.categories?.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/browse?categories=${cat.id}`}
                    className="px-2.5 py-1 bg-ruskin-blue/10 text-ruskin-blue rounded-full text-xs sm:text-sm hover:bg-ruskin-blue/20 transition-colors border border-ruskin-blue/20"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>

              {/* Manga Types */}
              {seriesData.manga_types?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {seriesData.manga_types.map((type) => (
                    <Link
                      key={type.id}
                      to={`/browse?types=${type.id}`}
                      className="px-2 py-1 bg-dockside-blue/20 text-delta-green rounded-full text-xs hover:bg-dockside-blue/30 transition-colors border border-dockside-blue/30"
                    >
                      {type.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-black-feather/80">
                {seriesData.authors?.length > 0 ? (
                  <p>
                    <span className="font-semibold text-black-feather">Author(s):</span>{' '}
                    {seriesData.authors
                      .filter((a) => a.pivot?.role !== 'artist')
                      .map((a) => a.name)
                      .join(', ') || seriesData.author}
                  </p>
                ) : (
                  seriesData.author && <p><span className="font-semibold text-black-feather">Author:</span> {seriesData.author}</p>
                )}
                {seriesData.authors?.length > 0 ? (
                  <p>
                    <span className="font-semibold text-black-feather">Artist(s):</span>{' '}
                    {seriesData.authors
                      .filter((a) => a.pivot?.role === 'artist')
                      .map((a) => a.name)
                      .join(', ') || seriesData.artist || '-'}
                  </p>
                ) : (
                  seriesData.artist && <p><span className="font-semibold text-black-feather">Artist:</span> {seriesData.artist}</p>
                )}
                <p><span className="font-semibold text-black-feather">Type:</span> {seriesData.type}</p>
                <p>
                  <span className="font-semibold text-black-feather">Status:</span>{' '}
                  <span className={`font-medium ${
                    seriesData.status === 'ongoing' ? 'text-emerald-600' :
                    seriesData.status === 'completed' ? 'text-sky-600' :
                    'text-sidewalk-grey'
                  }`}>
                    {seriesData.status?.charAt(0).toUpperCase() + seriesData.status?.slice(1)}
                  </span>
                </p>
                <p><span className="font-semibold text-black-feather">Chapters:</span> {seriesData.total_chapters}</p>
                {seriesData.release_date && (
                  <p><span className="font-semibold text-black-feather">Released:</span> {new Date(seriesData.release_date).getFullYear()}</p>
                )}
                {seriesData.total_views > 0 && (
                  <p><span className="font-semibold text-black-feather">Views:</span> {seriesData.total_views.toLocaleString()}</p>
                )}
              </div>

              {/* User Rating */}
              <div className="mt-4 pt-3 border-t border-quarzo">
                <UserRating seriesId={seriesData.id} slug={slug} />
              </div>
            </div>
          </div>
        </div>

        {/* Chapters */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-black-feather mb-3 sm:mb-4">
            Chapters
          </h2>
          <ChapterList
            chapters={chapters?.data || []}
            seriesSlug={seriesData.slug}
          />
        </div>
      </div>
    </>
  );
}

export default SeriesDetail;
