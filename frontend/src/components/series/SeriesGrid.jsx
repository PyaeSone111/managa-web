import SeriesCard from './SeriesCard';
import MangaCardByDesign from './cards';
import { useBranding } from '../../context/BrandingContext';

/** Tailwind safelist: grid-cols-1..6 and sm/md/lg/xl variants so dynamic classes work */
const COLS_CLASS = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
};
const SM_COLS = { 1: 'sm:grid-cols-1', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-4', 5: 'sm:grid-cols-5', 6: 'sm:grid-cols-6' };
const MD_COLS = { 1: 'md:grid-cols-1', 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-4', 5: 'md:grid-cols-5', 6: 'md:grid-cols-6' };
const LG_COLS = { 1: 'lg:grid-cols-1', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5', 6: 'lg:grid-cols-6' };
const XL_COLS = { 1: 'xl:grid-cols-1', 2: 'xl:grid-cols-2', 3: 'xl:grid-cols-3', 4: 'xl:grid-cols-4', 5: 'xl:grid-cols-5', 6: 'xl:grid-cols-6' };

function getGridClass(columns, gap = 'gap-3 sm:gap-4') {
  if (!columns || typeof columns !== 'object') {
    return 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4';
  }
  const c = (v) => Math.min(6, Math.max(1, Number(v) || 1));
  const parts = [
    COLS_CLASS[c(columns.default)] || 'grid-cols-2',
    columns.sm != null && SM_COLS[c(columns.sm)],
    columns.md != null && MD_COLS[c(columns.md)],
    columns.lg != null && LG_COLS[c(columns.lg)],
    columns.xl != null && XL_COLS[c(columns.xl)],
  ].filter(Boolean);
  return `grid ${parts.join(' ')} ${gap}`;
}

function SeriesGrid({ series = [], loading = false, layout = 'horizontal', sectionKey }) {
  const { cardLayout, gridColumns } = useBranding();
  const isVertical = layout === 'vertical';
  const designId = sectionKey ? (cardLayout?.[sectionKey] || (isVertical ? 'card_01' : 'card_11')) : null;
  const useDesignCards = Boolean(designId);
  const columnKey = isVertical ? 'vertical' : 'horizontal';
  const columnsConfig = gridColumns?.[columnKey];
  const gridClass = getGridClass(columnsConfig);

  if (loading) {
    return (
      <div className={gridClass}>
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

  const wrapperClass = isVertical ? 'max-w-6xl' : 'max-w-5xl';
  return (
    <div className={`${gridClass} ${wrapperClass}`}>
      {series.map((item, index) =>
        useDesignCards ? (
          <MangaCardByDesign
            key={item.id}
            series={item}
            designId={designId}
            rank={item.rank ?? index + 1}
          />
        ) : (
          <SeriesCard key={item.id} series={item} layout={layout} />
        )
      )}
    </div>
  );
}

export default SeriesGrid;
