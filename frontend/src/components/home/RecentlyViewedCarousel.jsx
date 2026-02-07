import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useRecentlyViewed } from '../../hooks/useRecentlyViewed';
import { useBranding } from '../../context/BrandingContext';
import { seriesApi } from '../../services/api';
import MangaCardByDesign from '../series/cards';

function RecentlyViewedCarousel() {
  const { items: recentItems } = useRecentlyViewed();
  const { cardLayout } = useBranding();
  const designId = cardLayout?.recently_viewed || 'card_04';

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
      <section className="glass-card rounded-xl p-4 border border-silver-grass/30">
        <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
        <p className="text-sm text-silver-grass">Nothing here yet. Browse to discover series.</p>
        <Link
          to="/browse"
          className="mt-2 inline-block text-sm text-bracken-green hover:text-bracken-fern font-medium"
        >
          View All
        </Link>
      </section>
    );
  }

  return (
    <section className="glass-card rounded-xl p-4 border border-silver-grass/30">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <Link
          to={viewAllLink}
          className="text-sm text-white hover:text-silver-grass font-medium transition-colors"
        >
          View All
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto overflow-y-hidden pb-2 -mx-1 snap-x snap-mandatory scroll-smooth [scrollbar-width:thin]">
        {displayItems.map((item, index) => (
          <div key={item.slug ?? item.id} className="flex-shrink-0 w-[140px] sm:w-[160px] snap-start">
            <MangaCardByDesign
              series={item}
              designId={designId}
              rank={index + 1}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default RecentlyViewedCarousel;
