import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useRecentlyViewed } from '../../hooks/useRecentlyViewed';
import { seriesApi } from '../../services/api';
import { MangaCard } from '../series/cards/index.jsx';

function RecentlyViewedCarousel() {
  const { items: recentItems } = useRecentlyViewed();

  const { data: latestData } = useQuery({
    queryKey: ['series', 'latest', 'carousel'],
    queryFn: () => seriesApi.getLatest({ limit: 10 }),
    enabled: recentItems.length === 0,
  });

  const displayItems = recentItems.length > 0 ? recentItems : (latestData?.data || []);
  const title = recentItems.length > 0 ? 'Recently Viewed' : 'Recently Updated';
  const viewAllLink = recentItems.length > 0 ? '/browse' : '/browse?sort=latest';

  if (displayItems.length === 0) {
    return (
      <section className="bg-white rounded-xl p-4 border border-quarzo shadow-sm">
        <h3 className="text-lg font-semibold text-black-feather mb-3">{title}</h3>
        <p className="text-sm text-sidewalk-grey">Nothing here yet. Browse to discover series.</p>
        <Link
          to="/browse"
          className="mt-2 inline-block text-sm text-ruskin-blue hover:text-delta-green font-medium transition-colors"
        >
          View All
        </Link>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-xl p-4 border border-quarzo shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-black-feather">{title}</h3>
        <Link
          to={viewAllLink}
          className="text-sm text-ruskin-blue hover:text-delta-green font-medium transition-colors"
        >
          View All
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto overflow-y-hidden pb-2 -mx-1 snap-x snap-mandatory scroll-smooth [scrollbar-width:thin] items-stretch">
        {displayItems.map((item) => (
          <div key={item.slug ?? item.id} className="flex-shrink-0 w-[140px] sm:w-[160px] h-[300px] sm:h-[320px] snap-start flex flex-col">
            <MangaCard series={item} section="recently_viewed" wrapperClassName="h-full" />
          </div>
        ))}
      </div>
    </section>
  );
}

export default RecentlyViewedCarousel;
