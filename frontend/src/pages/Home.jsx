import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { dashboardApi } from '../services/api';
import { useBranding } from '../context/BrandingContext';
import SeriesGrid from '../components/series/SeriesGrid';
import HeroBanner from '../components/home/HeroBanner';
import RecentlyViewedCarousel from '../components/home/RecentlyViewedCarousel';
import GoogleAd from '../components/common/GoogleAd';

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
  const { updateBranding } = useBranding();

  // Single consolidated API call for all homepage data
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard', 'home'],
    queryFn: () => dashboardApi.getHomepage({ limit: 12 }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update branding cache when dashboard loads
  useEffect(() => {
    if (dashboard?.data?.branding) {
      updateBranding(dashboard.data.branding);
    }
  }, [dashboard, updateBranding]);

  const latest = dashboard?.data?.latest || [];
  const newSeries = dashboard?.data?.new || [];
  const trending = dashboard?.data?.trending || [];
  const topRated = dashboard?.data?.top || [];

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
              series={latest}
              loading={isLoading}
              section="home_latest"
              adSlot={import.meta.env.VITE_ADSENSE_SLOT_CONTENT}
            />
          </section>

          {/* Popular - in-feed ad every 5 cards */}
          <section>
            <SectionHeader title="Popular" linkTo="/rankings" linkText="See Rankings" />
            <SeriesGrid
              series={topRated}
              loading={isLoading}
              section="home_popular"
              adSlot={import.meta.env.VITE_ADSENSE_SLOT_INFEED}
              adEveryNCards={5}
              adFormat="fluid"
              adLayoutKey="+1w+rz-i-q+3f"
            />
          </section>

          {/* Weekly Highlights */}
          <section>
            <SectionHeader title="Weekly Highlights" linkTo="/rankings" linkText="See Rankings" />
            <SeriesGrid
              series={trending}
              loading={isLoading}
              section="home_weekly_highlights"
              adSlot={import.meta.env.VITE_ADSENSE_SLOT_CONTENT}
            />
          </section>

          {/* Recently Added */}
          <section>
            <SectionHeader title="Recently Added" linkTo="/browse?sort=newest" linkText="View All" />
            <SeriesGrid
              series={newSeries}
              loading={isLoading}
              section="home_recently_added"
              adSlot={import.meta.env.VITE_ADSENSE_SLOT_CONTENT}
            />
          </section>
        </div>

        {/* Sidebar */}
        <aside className="lg:w-80 xl:w-96 flex-shrink-0 lg:sticky lg:top-24 lg:self-start space-y-6">
          <RecentlyViewedCarousel />
          {import.meta.env.VITE_ADSENSE_SLOT_HOME && (
            <GoogleAd adSlot={import.meta.env.VITE_ADSENSE_SLOT_HOME} className="my-4" />
          )}
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
