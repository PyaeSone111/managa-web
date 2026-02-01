import SeriesCard from './SeriesCard';

/** 6 cards per row: top image, below text UI */
const GRID_6 = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4';

/** 4 cards per row: image left, text right UI */
const GRID_4 = 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5';

function SeriesGrid({ series = [], loading = false, layout = 'horizontal' }) {
  const isVertical = layout === 'vertical';

  if (loading) {
    return (
      <div className={isVertical ? GRID_6 : GRID_4}>
        {[...Array(isVertical ? 12 : 8)].map((_, i) => (
          <div
            key={i}
            className={`animate-pulse glass-card rounded-xl overflow-hidden border border-silver-grass/30 ${
              isVertical ? '' : 'flex'
            }`}
          >
            {isVertical ? (
              <>
                <div className="w-full h-28 sm:h-32 bg-silver-grass/20 rounded-t-xl" />
                <div className="p-2 sm:p-3 space-y-1.5">
                  <div className="h-3 sm:h-3.5 bg-silver-grass/20 rounded w-4/5" />
                  <div className="h-2.5 bg-silver-grass/20 rounded w-1/2" />
                  <div className="h-2.5 bg-silver-grass/20 rounded w-12 mt-1" />
                  <div className="h-3 bg-silver-grass/20 rounded w-14 mt-2" />
                </div>
              </>
            ) : (
              <>
                <div className="flex-shrink-0 w-20 sm:w-24 h-24 sm:h-28 bg-silver-grass/20 rounded-l-xl" />
                <div className="flex-1 p-2 sm:p-3 space-y-1.5">
                  <div className="h-3 sm:h-3.5 bg-silver-grass/20 rounded w-4/5" />
                  <div className="h-2.5 bg-silver-grass/20 rounded w-1/2" />
                  <div className="h-2.5 bg-silver-grass/20 rounded w-12 mt-1" />
                  <div className="h-3 bg-silver-grass/20 rounded w-14 mt-2" />
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (!series || series.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white">No series found.</p>
      </div>
    );
  }

  return (
    <div className={isVertical ? GRID_6 : GRID_4}>
      {series.map((item) => (
        <SeriesCard key={item.id} series={item} layout={layout} />
      ))}
    </div>
  );
}

export default SeriesGrid;
