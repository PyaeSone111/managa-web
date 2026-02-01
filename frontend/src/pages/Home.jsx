import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { seriesApi, rankingsApi } from '../services/api';
import SeriesGrid from '../components/series/SeriesGrid';
import LoadingSpinner from '../components/common/LoadingSpinner';
import HeroBanner from '../components/home/HeroBanner';
import InfoStrip from '../components/home/InfoStrip';
import RecentlyViewedCarousel from '../components/home/RecentlyViewedCarousel';

function SectionHeader({ title, linkTo, linkText = 'View All' }) {
  return (
    <div className="flex items-center justify-between mb-4 sm:mb-6">
      <h2 className="text-xl sm:text-2xl font-bold text-white">
        {title}
      </h2>
      {linkTo && (
        <Link
          to={linkTo}
          className="text-sm text-silver-grass hover:text-white font-medium transition-colors"
        >
          {linkText}
        </Link>
      )}
    </div>
  );
}

function Home() {
  const { data: latest, isLoading: latestLoading } = useQuery({
    queryKey: ['series', 'latest'],
    queryFn: () => seriesApi.getLatest({ limit: 12 }),
  });

  const { data: newSeries, isLoading: newLoading } = useQuery({
    queryKey: ['series', 'new'],
    queryFn: () => seriesApi.getNew({ limit: 12 }),
  });

  const { data: trending, isLoading: trendingLoading } = useQuery({
    queryKey: ['rankings', 'trending', 'home'],
    queryFn: () => rankingsApi.getTrending({ per_page: 12, period: 'weekly' }),
  });

  const { data: topRated, isLoading: topLoading } = useQuery({
    queryKey: ['rankings', 'top', 'home'],
    queryFn: () => rankingsApi.getTop({ per_page: 12 }),
  });

  return (
    <>
      <Helmet>
        <title>Manga Web - Read Manga, Manhwa, and Manhua Online</title>
        <meta
          name="description"
          content="Read the latest manga, manhwa, and manhua online. Browse thousands of series and enjoy high-quality reading experience."
        />
      </Helmet>

      {/* Full-width hero */}
      <div className="-mx-4 sm:-mx-6 lg:-mx-8">
        <HeroBanner />
        <InfoStrip />
      </div>

      {/* Two-column: main content + sidebar (main is already container in App) */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 mt-8">
        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-10 md:space-y-12">
          {/* Latest Release: 6 cards per row (top image, below text) */}
          <section>
            <SectionHeader title="Latest Release" linkTo="/browse?sort=latest" linkText="View All" />
            {latestLoading ? (
              <LoadingSpinner size="lg" />
            ) : (
              <SeriesGrid series={latest?.data || []} layout="vertical" />
            )}
          </section>

          {/* Popular: 4 cards per row (image left, text right) */}
          <section>
            <SectionHeader title="Popular" linkTo="/rankings" linkText="See Rankings" />
            {topLoading ? (
              <LoadingSpinner size="lg" />
            ) : (
              <SeriesGrid series={topRated?.data || []} layout="horizontal" />
            )}
          </section>

          {/* Weekly Highlights: 6 cards per row (top image, below text) */}
          <section>
            <SectionHeader title="Weekly Highlights" linkTo="/rankings" linkText="See Rankings" />
            {trendingLoading ? (
              <LoadingSpinner size="lg" />
            ) : (
              <SeriesGrid series={trending?.data || []} layout="vertical" />
            )}
          </section>

          {/* Recently Added: 4 cards per row (image left, text right) */}
          <section>
            <SectionHeader title="Recently Added" linkTo="/browse?sort=newest" linkText="View All" />
            {newLoading ? (
              <LoadingSpinner size="lg" />
            ) : (
              <SeriesGrid series={newSeries?.data || []} layout="horizontal" />
            )}
          </section>
        </div>

        {/* Sidebar: sticky on desktop, below content on mobile */}
        <aside className="lg:w-80 xl:w-96 flex-shrink-0 lg:sticky lg:top-24 lg:self-start space-y-6">
          <RecentlyViewedCarousel />
          <section className="glass-card rounded-xl p-4 border border-silver-grass/30">
            <h3 className="text-lg font-semibold text-white mb-2">Browse</h3>
            <p className="text-sm text-silver-grass mb-3">
              Explore by category, status, or search. Find your next favorite series.
            </p>
            <Link
              to="/browse"
              className="inline-block px-4 py-2 text-sm font-medium bg-bracken-green text-silver-grass rounded-lg hover:bg-bracken-fern transition-all duration-200"
            >
              Browse All
            </Link>
          </section>
        </aside>
      </div>
    </>
  );
}

export default Home;
