import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useBranding } from '../../context/BrandingContext';
import { seriesToManga } from '../../lib/seriesToManga';
import { getCardGridScale } from '../../utils/cardGridScale';
import { getCardKeyForSection, isPortraitCard } from '../../utils/cardLayout';
import { formatChapterLabel } from '../../utils/helpers';
import colors from '../../theme/colors';
import { CARD_MAP } from './MangaCard';
import * as Portrait from './portrait-cards';

const FALLBACK = Portrait.Card01Classic;
const RANK_CARDS = new Set(['card_10', 'card_15']);
/** Cards that embed Continue + chapter inside their own layout. */
const INLINE_RECENT_CARDS = new Set(['card_18']);

/**
 * Recent-only wrapper: branding card UI (01–20) + chapter + Continue + delete.
 */
export default function RecentMangaCard({
  series,
  rank,
  onContinue,
  onDelete,
  deleting = false,
  numColumns,
  screenWidth: screenWidthProp,
  style,
}) {
  const { width } = useWindowDimensions();
  const screenWidth = screenWidthProp ?? width;
  const { cardLayout, layoutVersion } = useBranding();

  const cardKey = getCardKeyForSection('recently_viewed', cardLayout);
  const isLandscape = !isPortraitCard(cardKey);
  const inlineRecent = INLINE_RECENT_CARDS.has(cardKey);
  const CardComponent = CARD_MAP[cardKey] || FALLBACK;
  const manga = seriesToManga(series);
  const scale = numColumns ? getCardGridScale(numColumns, screenWidth) : null;
  const margin = scale?.margin ?? 6;

  const progress = series?._continue;
  const chapterNumber = progress?.chapter?.chapter_number;
  const lastPage = progress?.last_page;
  const chapterLabel =
    chapterNumber != null
      ? formatChapterLabel(chapterNumber)
      : manga?.latestChapter && manga.latestChapter !== '—'
        ? manga.latestChapter
        : null;
  const pageLabel = lastPage != null ? ` · p.${lastPage}` : '';
  const chapterDisplay = chapterLabel ? `${chapterLabel}${pageLabel}` : null;

  if (!manga) return null;

  const cardProps = { manga, numColumns, screenWidth };
  if (RANK_CARDS.has(cardKey) && rank != null) {
    cardProps.rank = rank;
  }
  if (inlineRecent) {
    cardProps.chapterLabel = chapterDisplay || 'In progress';
    cardProps.onContinue = () => onContinue?.(series);
  }

  return (
    <View style={[{ margin }, !isLandscape && { flex: 1 }, isLandscape && styles.landscapeWrap, style]}>
      <View style={styles.cardWrap}>
        <Pressable onPress={() => onContinue?.(series)} style={styles.cardPress}>
          <View
            key={`recent-card-${cardKey}-${layoutVersion}-${series.id}`}
            style={isLandscape ? styles.landscapeCardHost : null}
          >
            <CardComponent {...cardProps} />
          </View>
        </Pressable>

        {onDelete ? (
          <Pressable
            onPress={() => onDelete(series)}
            disabled={deleting}
            hitSlop={8}
            style={({ pressed }) => [
              styles.deleteBtn,
              pressed && styles.deleteBtnPressed,
              deleting && styles.deleteBtnDisabled,
            ]}
            accessibilityLabel="Remove from recent"
          >
            <Ionicons name="trash-outline" size={15} color={colors.white} />
          </Pressable>
        ) : null}
      </View>

      {!inlineRecent ? (
        <View style={styles.footer}>
          {chapterDisplay ? (
            <Text style={styles.chapter} numberOfLines={1}>
              {chapterDisplay}
            </Text>
          ) : (
            <Text style={styles.chapterMuted} numberOfLines={1}>
              In progress
            </Text>
          )}
          <Pressable
            onPress={() => onContinue?.(series)}
            style={({ pressed }) => [styles.continueBtn, pressed && styles.continueBtnPressed]}
          >
            <Text style={styles.continueText}>Continue</Text>
            <Ionicons name="play" size={12} color={colors.white} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  landscapeWrap: {
    flex: 0,
    width: '100%',
    alignSelf: 'stretch',
  },
  landscapeCardHost: {
    width: '100%',
  },
  cardWrap: {
    position: 'relative',
  },
  cardPress: {
    width: '100%',
  },
  deleteBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 3,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnPressed: {
    opacity: 0.75,
  },
  deleteBtnDisabled: {
    opacity: 0.45,
  },
  footer: {
    marginTop: 8,
    gap: 6,
    paddingHorizontal: 2,
  },
  chapter: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.navy,
  },
  chapterMuted: {
    fontSize: 12,
    color: colors.muted,
  },
  continueBtn: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.redOrange,
    paddingVertical: 8,
    borderRadius: 8,
  },
  continueBtnPressed: {
    opacity: 0.88,
  },
  continueText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
});
