import { useNavigate } from 'react-router-dom';
import { seriesToManga } from '../../../utils/seriesToManga';
import {
  Card01Classic,
  Card02Overlay,
  Card03Neon,
  Card04Minimal,
  Card05Badges,
  Card06Stats,
  Card07Glass,
  Card08Accent,
  Card09Cinematic,
  Card10Rank,
} from './portrait-cards';
import {
  Card11Classic,
  Card12Cinematic,
  Card13Glass,
  Card14Action,
  Card15Compact,
  Card16Neon,
  Card17Dense,
  Card18Banner,
  Card19Timeline,
  Card20Trending,
} from './landscape-cards';

const CARD_REGISTRY = {
  card_01: Card01Classic,
  card_02: Card02Overlay,
  card_03: Card03Neon,
  card_04: Card04Minimal,
  card_05: Card05Badges,
  card_06: Card06Stats,
  card_07: Card07Glass,
  card_08: Card08Accent,
  card_09: Card09Cinematic,
  card_10: Card10Rank,
  card_11: Card11Classic,
  card_12: Card12Cinematic,
  card_13: Card13Glass,
  card_14: Card14Action,
  card_15: Card15Compact,
  card_16: Card16Neon,
  card_17: Card17Dense,
  card_18: Card18Banner,
  card_19: Card19Timeline,
  card_20: Card20Trending,
};

/** Cards that accept an optional rank prop (for rankings list) */
const RANK_CARDS = new Set(['card_10', 'card_15']);

export function getCardComponent(designId) {
  const id = designId && designId.startsWith('card_') ? designId : `card_${String(designId).padStart(2, '0')}`;
  return CARD_REGISTRY[id] || CARD_REGISTRY.card_01;
}

/** Portrait (vertical) cards: 01–10. Landscape: 11–20. */
export function isPortraitCard(designId) {
  const num = parseInt(String(designId).replace('card_', ''), 10);
  return num >= 1 && num <= 10;
}

export const CARD_OPTIONS = [
  { value: 'card_01', label: '01 Classic Portrait' },
  { value: 'card_02', label: '02 Overlay Gradient' },
  { value: 'card_03', label: '03 Neon Glow' },
  { value: 'card_04', label: '04 Minimal Clean' },
  { value: 'card_05', label: '05 Badge Heavy' },
  { value: 'card_06', label: '06 Stats Focus' },
  { value: 'card_07', label: '07 Glassmorphism' },
  { value: 'card_08', label: '08 Bordered Accent' },
  { value: 'card_09', label: '09 Cinematic' },
  { value: 'card_10', label: '10 Rank Card' },
  { value: 'card_11', label: '11 Classic Landscape' },
  { value: 'card_12', label: '12 Wide Cinematic' },
  { value: 'card_13', label: '13 Glass Landscape' },
  { value: 'card_14', label: '14 Action CTA' },
  { value: 'card_15', label: '15 Compact Row' },
  { value: 'card_16', label: '16 Neon Landscape' },
  { value: 'card_17', label: '17 Info Dense' },
  { value: 'card_18', label: '18 Featured Banner' },
  { value: 'card_19', label: '19 Timeline' },
  { value: 'card_20', label: '20 Trending' },
];

/**
 * Renders a series using the selected design card (designId from card_layout per section).
 */
function MangaCardByDesign({ series, designId, rank }) {
  const navigate = useNavigate();
  const id = designId || 'card_01';
  const Component = getCardComponent(id);
  const manga = seriesToManga(series || {}, rank);
  const handleClick = (e) => {
    if (e.target.closest('a')) return;
    if (series?.slug) navigate(`/series/${series.slug}`);
  };

  const needsRank = RANK_CARDS.has(id);
  const props = { manga, onClick: handleClick };
  if (needsRank) props.rank = rank ?? 0;

  return <Component {...props} />;
}

export default MangaCardByDesign;
