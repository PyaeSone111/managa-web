import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { seriesApi, rankingsApi } from '../services/api';
import SeriesGrid from '../components/series/SeriesGrid';
import HeroBanner from '../components/home/HeroBanner';
import RecentlyViewedCarousel from '../components/home/RecentlyViewedCarousel';

function SectionHeader({ title, linkTo, linkText = 'View All' }) {
  return (
    <div className="flex items-center justify-between mb-4 sm:mb-6">
      <h2 className="text-xl sm:text-2xl font-bold text-black-feather">
        {title}
      </h2>
      {linkTo && (
        <Link
          to={linkTo}
          className="text-sm text-ruskin-blue hover:text-delta-green font-medium transition-colors"
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
        <title>Myangar - Read Manga, Manhwa, and Manhua Online</title>
        <meta
          name="description"
          content="Read the latest manga, manhwa, and manhua online. Browse thousands of series and enjoy high-quality reading experience."
        />
      </Helmet>

      {/* Full-width hero */}
      <div className="-mx-4 sm:-mx-6 lg:-mx-8">
        <HeroBanner />
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 mt-8">
        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-10 md:space-y-12">
          {/* Latest Release */}
          <section>
            <SectionHeader title="Latest Release" linkTo="/browse?sort=latest" linkText="View All" />
            <SeriesGrid
              series={latest?.data || []}
              loading={latestLoading}
              section="home_latest"
            />
          </section>

          {/* Popular */}
          <section>
            <SectionHeader title="Popular" linkTo="/rankings" linkText="See Rankings" />
            <SeriesGrid
              series={topRated?.data || []}
              loading={topLoading}
              section="home_popular"
            />
          </section>

          {/* Weekly Highlights */}
          <section>
            <SectionHeader title="Weekly Highlights" linkTo="/rankings" linkText="See Rankings" />
            <SeriesGrid
              series={trending?.data || []}
              loading={trendingLoading}
              section="home_weekly_highlights"
            />
          </section>

          {/* Recently Added */}
          <section>
            <SectionHeader title="Recently Added" linkTo="/browse?sort=newest" linkText="View All" />
            <SeriesGrid
              series={newSeries?.data || []}
              loading={newLoading}
              section="home_recently_added"
            />
          </section>
        </div>

        {/* Sidebar */}
        <aside className="lg:w-80 xl:w-96 flex-shrink-0 lg:sticky lg:top-24 lg:self-start space-y-6">
          <RecentlyViewedCarousel />
          <section className="bg-white rounded-xl p-4 border border-quarzo shadow-sm">
            <h3 className="text-lg font-semibold text-black-feather mb-2">Browse</h3>
            <p className="text-sm text-sidewalk-grey mb-3 leading-relaxed">
              Explore by category, status, or search. Find your next favorite series.
            </p>
            <Link
              to="/browse"
              className="inline-block px-4 py-2 text-sm font-medium bg-delta-green text-white rounded-lg hover:bg-ruskin-blue transition-all duration-200"
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
