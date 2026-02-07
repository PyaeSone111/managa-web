import { useNavigate } from 'react-router-dom';
import { useBranding } from '../../../context/BrandingContext';
import { seriesToManga } from '../../../lib/seriesToManga';
import * as Portrait from './portrait-cards';
import * as Landscape from './landscape-cards';

const CARD_MAP = {
  card_01: Portrait.Card01Classic,
  card_02: Portrait.Card02Overlay,
  card_03: Portrait.Card03Neon,
  card_04: Portrait.Card04Minimal,
  card_05: Portrait.Card05Badges,
  card_06: Portrait.Card06Stats,
  card_07: Portrait.Card07Glass,
  card_08: Portrait.Card08Accent,
  card_09: Portrait.Card09Cinematic,
  card_10: Portrait.Card10Rank,
  card_11: Landscape.Card11Classic,
  card_12: Landscape.Card12Cinematic,
  card_13: Landscape.Card13Glass,
  card_14: Landscape.Card14Action,
  card_15: Landscape.Card15Compact,
  card_16: Landscape.Card16Neon,
  card_17: Landscape.Card17Dense,
  card_18: Landscape.Card18Banner,
  card_19: Landscape.Card19Timeline,
  card_20: Landscape.Card20Trending,
};

const RANK_CARDS = new Set(['card_10', 'card_15']);

/**
 * Renders the admin-chosen card UI for the given section.
 * Uses branding.cardLayout[section] to pick card_01..card_20.
 * @param {Object} props
 * @param {Object} props.series - API series object
 * @param {string} props.section - Section key (e.g. 'home_latest', 'browse', 'rankings_top')
 * @param {number} [props.rank] - Optional 1-based rank (for rankings; used by card_10, card_15)
 */
export function MangaCard({ series, section, rank }) {
  const navigate = useNavigate();
  const { cardLayout } = useBranding();
  const cardKey = (section && cardLayout[section]) ? cardLayout[section] : 'card_01';
  const CardComponent = CARD_MAP[cardKey] || CARD_MAP.card_01;
  const manga = seriesToManga(series);
  if (!manga) return null;

  const handleClick = (e) => {
    if (e.target.closest('a') || e.target.closest('button')) return;
    if (series?.slug) navigate(`/series/${series.slug}`);
  };

  const needsRank = RANK_CARDS.has(cardKey);
  const cardProps = { manga };
  if (needsRank && rank != null) cardProps.rank = rank;

  return (
    <div onClick={handleClick} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(e); } }} className="outline-none">
      <CardComponent {...cardProps} />
    </div>
  );
}

export { CARD_MAP };
export * from './portrait-cards';
export * from './landscape-cards';
