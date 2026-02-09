import SeriesCard from './SeriesCard';
import { MangaCard } from './cards/index.jsx';
import { useBranding } from '../../context/BrandingContext';
import GoogleAd from '../common/GoogleAd';

const DEFAULT_COLS_V = { default: 2, sm: 3, md: 4, lg: 5, xl: 6 };
const DEFAULT_COLS_H = { default: 1, sm: 1, md: 2, lg: 3, xl: 4 };

/** Tailwind safelist helpers for dynamic grid columns */
const COLS_CLASS = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4', 5: 'grid-cols-5', 6: 'grid-cols-6' };
const SM_COLS = { 1: 'sm:grid-cols-1', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-4', 5: 'sm:grid-cols-5', 6: 'sm:grid-cols-6' };
const MD_COLS = { 1: 'md:grid-cols-1', 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-4', 5: 'md:grid-cols-5', 6: 'md:grid-cols-6' };
const LG_COLS = { 1: 'lg:grid-cols-1', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5', 6: 'lg:grid-cols-6' };
const XL_COLS = { 1: 'xl:grid-cols-1', 2: 'xl:grid-cols-2', 3: 'xl:grid-cols-3', 4: 'xl:grid-cols-4', 5: 'xl:grid-cols-5', 6: 'xl:grid-cols-6' };

function getGridClass(columns) {
  if (!columns || typeof columns !== 'object') {
    return 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4';
  }
  const c = (v) => Math.min(6, Math.max(1, Number(v) || 1));
  const parts = [
    COLS_CLASS[c(columns.default)] || 'grid-cols-2',
    columns.sm != null && SM_COLS[c(columns.sm)],
    columns.md != null && MD_COLS[c(columns.md)],
    columns.lg != null && LG_COLS[c(columns.lg)],
    columns.xl != null && XL_COLS[c(columns.xl)],
  ].filter(Boolean);
  return `grid ${parts.join(' ')} gap-4`;
}

function SkeletonCard({ isVertical }) {
  if (isVertical) {
    return (
      <div className="animate-pulse bg-white rounded-xl border border-quarzo overflow-hidden">
        <div className="w-full aspect-[2/3] bg-quarzo/40" />
        <div className="p-3 space-y-2">
          <div className="h-3.5 bg-quarzo/40 rounded w-4/5" />
          <div className="h-2.5 bg-quarzo/40 rounded w-1/2" />
          <div className="h-2.5 bg-quarzo/40 rounded w-16 mt-1" />
        </div>
      </div>
    );
  }
  return (
    <div className="animate-pulse flex bg-white rounded-xl border border-quarzo overflow-hidden min-h-[140px]">
      <div className="flex-shrink-0 w-24 sm:w-28 bg-quarzo/40" />
      <div className="flex-1 p-3 space-y-2">
        <div className="h-3.5 bg-quarzo/40 rounded w-4/5" />
        <div className="h-2.5 bg-quarzo/40 rounded w-1/2" />
        <div className="h-2.5 bg-quarzo/40 rounded w-16 mt-1" />
        <div className="h-3 bg-quarzo/40 rounded w-20 mt-2" />
      </div>
    </div>
  );
}

const DEFAULT_AD_EVERY_N_CARDS = 12; // default: ad every 12 cards (~3 rows of 4)

function SeriesGrid({ series = [], loading = false, layout = 'vertical', section, onEdit, onDelete, adSlot, adEveryNCards = DEFAULT_AD_EVERY_N_CARDS, adFormat, adLayoutKey }) {
  const { gridColumns, cardLayout } = useBranding();
  const useDesignCards = Boolean(section);
  const isVertical = useDesignCards
    ? (cardLayout[section] || '').replace('card_', '') <= 10
    : layout === 'vertical';
  const columnsConfig = useDesignCards && gridColumns?.[section]
    ? gridColumns[section]
    : isVertical ? DEFAULT_COLS_V : DEFAULT_COLS_H;
  const gridClass = getGridClass(columnsConfig);

  if (loading) {
    return (
      <div className={gridClass}>
        {[...Array(isVertical ? 12 : 8)].map((_, i) => (
          <SkeletonCard key={i} isVertical={isVertical} />
        ))}
      </div>
    );
  }

  if (!series || series.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sidewalk-grey text-sm">No series found.</p>
      </div>
    );
  }

  const renderCard = (item, index) => {
    if (useDesignCards) {
      return (
        <MangaCard
          key={item.id}
          series={item}
          section={section}
          rank={index + 1}
        />
      );
    }
    return (
      <SeriesCard
        key={item.id}
        series={item}
        layout={isVertical ? 'vertical' : 'horizontal'}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );
  };

  if (!adSlot) {
    if (useDesignCards) {
      return (
        <div className={gridClass}>
          {series.map((item, index) => renderCard(item, index))}
        </div>
      );
    }
    return (
      <div className={gridClass}>
        {series.map((item) => renderCard(item, 0))}
      </div>
    );
  }

  const items = [];
  for (let i = 0; i < series.length; i++) {
    if (i > 0 && i % adEveryNCards === 0) {
      items.push(
        <div key={`ad-${i}`} className="col-span-full my-2">
          <GoogleAd adSlot={adSlot} adFormat={adFormat} adLayoutKey={adLayoutKey} className="w-full" />
        </div>
      );
    }
    items.push(renderCard(series[i], i));
  }

  return (
    <div className={gridClass}>
      {items}
    </div>
  );
}

export default SeriesGrid;
