import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useRecentlyViewed } from '../../hooks/useRecentlyViewed';
import { seriesApi } from '../../services/api';

function CarouselCard({ item, isCompact = true }) {
  const imageUrl = item.thumbnail_url || item.cover_url || '/placeholder.jpg';
  return (
    <Link
      to={`/series/${item.slug}`}
      className="flex-shrink-0 w-[120px] sm:w-[140px] snap-start rounded-lg overflow-hidden glass-card border border-silver-grass/30 hover:border-silver-grass/50 transition-all duration-200 hover:shadow-lg group"
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-silver-grass/10">
        <img
          src={imageUrl}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      <p className="p-2 text-xs font-medium text-white line-clamp-2 group-hover:text-silver-grass transition-colors">
        {item.title}
      </p>
    </Link>
  );
}

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
        {displayItems.map((item) => (
          <CarouselCard key={item.slug} item={item} />
        ))}
      </div>
    </section>
  );
}

export default RecentlyViewedCarousel;
