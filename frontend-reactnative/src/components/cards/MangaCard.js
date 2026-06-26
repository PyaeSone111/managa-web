import { Pressable } from 'react-native';
import { useBranding } from '../../context/BrandingContext';
import { seriesToManga } from '../../lib/seriesToManga';
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

export function getCardKeyForSection(section, cardLayout) {
  if (section && cardLayout?.[section]) {
    return cardLayout[section];
  }
  return 'card_01';
}

export function isPortraitCard(cardKey) {
  const num = Number(String(cardKey || 'card_01').replace('card_', ''));
  return !Number.isNaN(num) && num <= 10;
}

export function getNumColumnsForSection(section, cardLayout, gridColumns) {
  const cardKey = getCardKeyForSection(section, cardLayout);
  const portrait = isPortraitCard(cardKey);
  const defaults = portrait
    ? { default: 2, sm: 3, md: 4 }
    : { default: 1, sm: 1, md: 1 };
  const config = gridColumns?.[section] || defaults;
  const value = config.default ?? (portrait ? 2 : 1);
  return Math.min(3, Math.max(1, Number(value) || (portrait ? 2 : 1)));
}

export default function MangaCard({ series, section, cardKey: cardKeyOverride, rank, onPress, style }) {
  const { cardLayout } = useBranding();
  const cardKey = cardKeyOverride ?? getCardKeyForSection(section, cardLayout);
  const CardComponent = CARD_MAP[cardKey] || CARD_MAP.card_01;
  const manga = seriesToManga(series);

  if (!manga) return null;

  const cardProps = { manga };
  if (RANK_CARDS.has(cardKey) && rank != null) {
    cardProps.rank = rank;
  }

  return (
    <Pressable
      key={cardKey}
      onPress={() => onPress?.(series)}
      style={[{ flex: 1, margin: 6 }, style]}
    >
      <CardComponent {...cardProps} />
    </Pressable>
  );
}

export { CARD_MAP };
