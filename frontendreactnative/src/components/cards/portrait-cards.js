import { StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import colors from '../../theme/colors';
import {
  cardStyles,
  CoverImage,
  GenreBadge,
  RatingRow,
  StatusBadge,
  ThemeLeftBorder,
} from './shared';
import { getCardGridScale } from '../../utils/cardGridScale';

function getScale(numColumns, screenWidth) {
  return numColumns ? getCardGridScale(numColumns, screenWidth) : null;
}

function coverStyle(scale, baseStyle) {
  if (scale?.coverAspect) {
    return [baseStyle, { aspectRatio: scale.coverAspect }];
  }
  return baseStyle;
}

function cardShell(scale, ...extra) {
  return [
    cardStyles.card,
    scale?.compactCard && styles.compactCard,
    scale?.borderRadius != null && { borderRadius: scale.borderRadius },
    ...extra,
  ];
}

function bodyStyle(scale) {
  return [
    cardStyles.cardBody,
    scale && { padding: scale.bodyPad, gap: scale.bodyPad > 6 ? 4 : 2 },
  ];
}

function titleStyle(scale) {
  return [
    cardStyles.title,
    scale && { fontSize: scale.titleSize, lineHeight: scale.titleSize + 3 },
  ];
}

function authorStyle(scale) {
  return [cardStyles.author, scale && { fontSize: scale.authorSize }];
}

function metaStyle(scale) {
  return [cardStyles.meta, scale && { fontSize: scale.metaSize }];
}

function overlayInset(scale, base = 8) {
  return scale?.compactCard ? Math.max(3, Math.round(base * 0.5)) : base;
}

function overlayTitleSize(scale) {
  return scale ? scale.titleSize + 2 : 14;
}

function overlayCardStyle(scale) {
  return [
    styles.overlayCard,
    scale?.coverAspect && { aspectRatio: scale.coverAspect },
  ];
}

/** Matches frontend Card02: bg-gradient-to-t from-black/80 via-black/40 to-transparent */
function Card02DarkGradient() {
  return (
    <LinearGradient
      colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
      locations={[0, 0.42, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    />
  );
}

function glassPillStyle(scale) {
  const inset = overlayInset(scale, 10);
  return [
    cardStyles.glass,
    styles.ratingPill,
    { top: inset, right: inset },
    scale?.compactCard && styles.glassTight,
  ];
}

export function Card01Classic({ manga, numColumns, screenWidth }) {
  const scale = getScale(numColumns, screenWidth);
  return (
    <View style={cardShell(scale, styles.portrait)}>
      <CoverImage uri={manga.coverUrl} style={coverStyle(scale, styles.coverPortrait)}>
        <View style={[styles.badgeTopRight, { top: overlayInset(scale), right: overlayInset(scale) }]}>
          <StatusBadge status={manga.status} scale={scale} />
        </View>
      </CoverImage>
      <View style={bodyStyle(scale)}>
        <Text numberOfLines={scale?.titleLines ?? 2} style={titleStyle(scale)}>
          {manga.title}
        </Text>
        <Text numberOfLines={scale?.authorLines ?? 1} style={authorStyle(scale)}>
          {manga.author}
        </Text>
        <RatingRow
          rating={manga.rating}
          size={scale?.ratingSize ?? 12}
          showValue={!scale || numColumns <= 2}
          scale={scale}
        />
        {(!scale || scale.showGenre) && <GenreBadge label={manga.genre} scale={scale} />}
      </View>
    </View>
  );
}

export function Card02Overlay({ manga, numColumns, screenWidth }) {
  const scale = getScale(numColumns, screenWidth);
  const uri = manga.coverImageUrl || manga.coverUrl;
  const inset = overlayInset(scale, 12);
  return (
    <View style={cardShell(scale, overlayCardStyle(scale))}>
      <CoverImage uri={uri} style={StyleSheet.absoluteFill} />
      <Card02DarkGradient />
      <View style={[styles.badgeTopLeft, { top: overlayInset(scale), left: overlayInset(scale) }]}>
        <StatusBadge status={manga.status} scale={scale} />
      </View>
      <View style={glassPillStyle(scale)}>
        <Text style={[styles.ratingPillText, scale && { fontSize: scale.metaSize }]}>
          ★ {manga.rating.toFixed(1)}
        </Text>
      </View>
      <View style={[styles.overlayFooter, { left: inset, right: inset, bottom: inset }]}>
        <Text
          numberOfLines={scale?.titleLines ?? 2}
          style={[styles.overlayTitle, { fontSize: overlayTitleSize(scale) }]}
        >
          {manga.title}
        </Text>
        <Text numberOfLines={1} style={[styles.overlayAuthor, authorStyle(scale)]}>
          {manga.author}
        </Text>
        {(!scale || scale.showGenre) && (
          <Text style={[styles.overlayMeta, metaStyle(scale)]}>
            {manga.genre} | {manga.chapters} Ch.
          </Text>
        )}
      </View>
    </View>
  );
}

export function Card03Neon({ manga, numColumns, screenWidth }) {
  const scale = getScale(numColumns, screenWidth);
  const inset = overlayInset(scale, 8);
  return (
    <View style={cardShell(scale, styles.portrait, scale?.compactCard && styles.neonCardTight)}>
      <CoverImage uri={manga.coverUrl} style={coverStyle(scale, styles.coverPortrait)}>
        <View style={[styles.neonStats, { left: inset, right: inset, bottom: inset }]}>
          {!scale?.compactCard && (
            <View style={[cardStyles.glass, scale?.compactCard && styles.glassTight]}>
              <Text style={[styles.neonStatText, metaStyle(scale)]}>🔥 {manga.views}</Text>
            </View>
          )}
          <View style={[cardStyles.glass, scale?.compactCard && styles.glassTight]}>
            <Text style={[styles.neonStatText, metaStyle(scale)]}>★ {manga.rating.toFixed(1)}</Text>
          </View>
        </View>
      </CoverImage>
      <View style={[bodyStyle(scale), styles.neonBody]}>
        <Text numberOfLines={scale?.titleLines ?? 2} style={titleStyle(scale)}>
          {manga.title}
        </Text>
        <Text numberOfLines={scale?.authorLines ?? 1} style={authorStyle(scale)}>
          {manga.author}
        </Text>
        {(!scale || scale.showGenre) && (
          <View style={styles.tagRow}>
            {(manga.tags || []).slice(0, scale?.compactCard ? 1 : 2).map((tag) => (
              <GenreBadge key={tag} label={tag} scale={scale} />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

export function Card04Minimal({ manga, numColumns, screenWidth }) {
  const scale = getScale(numColumns, screenWidth);
  const borderWidth = scale?.compactCard ? 3 : 4;
  const pad = scale?.compactCard ? 5 : 8;
  return (
    <View style={[styles.minimalCard, scale?.compactCard && styles.minimalCompact]}>
      <ThemeLeftBorder width={borderWidth} style={styles.minimalThemeBorder} />
      <CoverImage
        uri={manga.coverUrl}
        style={[
          coverStyle(scale, styles.minimalCover),
          { marginHorizontal: pad, marginTop: pad },
        ]}
        imageStyle={[styles.minimalImage, scale?.borderRadius != null && { borderRadius: scale.borderRadius }]}
      />
      <View
        style={[
          styles.minimalBody,
          {
            paddingHorizontal: pad + borderWidth,
            paddingTop: scale?.bodyPad ?? 10,
            paddingBottom: pad,
            gap: scale?.bodyPad > 6 ? 2 : 1,
          },
        ]}
      >
        <Text numberOfLines={scale?.titleLines ?? 1} style={titleStyle(scale)}>
          {manga.title}
        </Text>
        <Text numberOfLines={scale?.authorLines ?? 1} style={authorStyle(scale)}>
          {manga.author}
        </Text>
        <Text style={[styles.minimalRating, metaStyle(scale)]}>★ {manga.rating.toFixed(1)}</Text>
      </View>
    </View>
  );
}

export function Card05Badges({ manga, numColumns, screenWidth }) {
  const scale = getScale(numColumns, screenWidth);
  const inset = overlayInset(scale, 8);
  return (
    <View style={cardShell(scale, styles.portrait)}>
      <CoverImage uri={manga.coverUrl} style={coverStyle(scale, styles.coverPortrait)}>
        <View style={[styles.badgeTopLeft, { top: inset, left: inset }]}>
          <StatusBadge status={manga.status} scale={scale} />
          {!scale?.compactCard && (
            <View style={styles.hotBadge}>
              <Text style={[styles.hotText, metaStyle(scale)]}>HOT</Text>
            </View>
          )}
        </View>
        {!scale?.compactCard && (
          <View style={[styles.tagOverlay, { left: inset, right: inset, bottom: inset }]}>
            {(manga.tags || []).slice(0, scale ? 2 : 3).map((tag) => (
              <View key={tag} style={[cardStyles.glass, styles.glassTight]}>
                <Text style={[styles.tagOverlayText, metaStyle(scale)]}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </CoverImage>
      <View style={bodyStyle(scale)}>
        <Text numberOfLines={scale?.titleLines ?? 2} style={titleStyle(scale)}>
          {manga.title}
        </Text>
        <Text numberOfLines={scale?.authorLines ?? 1} style={authorStyle(scale)}>
          {manga.author}
        </Text>
        <RatingRow rating={manga.rating} ratingCount={manga.ratingCount} scale={scale} />
      </View>
    </View>
  );
}

export function Card06Stats({ manga, numColumns, screenWidth }) {
  const scale = getScale(numColumns, screenWidth);
  const inset = overlayInset(scale, 8);
  return (
    <View style={cardShell(scale, styles.portrait)}>
      <CoverImage uri={manga.coverUrl} style={coverStyle(scale, styles.coverPortrait)}>
        <View style={[styles.statsRow, { left: inset, right: inset, bottom: inset }]}>
          {!scale?.compactCard && (
            <View style={[styles.statBox, scale?.compactCard && styles.statBoxTight]}>
              <Text style={[styles.statLabel, metaStyle(scale)]}>Views</Text>
              <Text style={[styles.statValue, metaStyle(scale)]}>{manga.views}</Text>
            </View>
          )}
          <View style={[styles.statBox, scale?.compactCard && styles.statBoxTight]}>
            <Text style={[styles.statLabel, metaStyle(scale)]}>Ch.</Text>
            <Text style={[styles.statValue, metaStyle(scale)]}>{manga.chapters}</Text>
          </View>
          <View style={[styles.statBox, scale?.compactCard && styles.statBoxTight]}>
            <Text style={[styles.statLabel, metaStyle(scale)]}>★</Text>
            <Text style={[styles.statValue, metaStyle(scale)]}>{manga.rating.toFixed(1)}</Text>
          </View>
        </View>
      </CoverImage>
      <View style={bodyStyle(scale)}>
        <Text numberOfLines={scale?.titleLines ?? 2} style={titleStyle(scale)}>
          {manga.title}
        </Text>
        <Text numberOfLines={scale?.authorLines ?? 1} style={authorStyle(scale)}>
          {manga.author}
        </Text>
        <View style={styles.inlineRow}>
          <StatusBadge status={manga.status} scale={scale} />
          {(!scale || scale.showGenre) && (
            <Text style={metaStyle(scale)} numberOfLines={1}>
              {manga.genre}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

export function Card07Glass({ manga, numColumns, screenWidth }) {
  const scale = getScale(numColumns, screenWidth);
  const uri = manga.coverImageUrl || manga.coverUrl;
  const inset = overlayInset(scale, 10);
  return (
    <View style={cardShell(scale, overlayCardStyle(scale))}>
      <CoverImage uri={uri} style={StyleSheet.absoluteFill} />
      <View style={[cardStyles.overlay, styles.overlayGradient]} />
      <View style={glassPillStyle(scale)}>
        <Text style={[styles.ratingPillText, scale && { fontSize: scale.metaSize }]}>
          ★ {manga.rating.toFixed(1)}
        </Text>
      </View>
      <View
        style={[
          styles.glassPanel,
          {
            left: inset,
            right: inset,
            bottom: inset,
            padding: scale?.bodyPad ?? 12,
            gap: scale?.compactCard ? 2 : 4,
          },
        ]}
      >
        <Text numberOfLines={scale?.titleLines ?? 2} style={titleStyle(scale)}>
          {manga.title}
        </Text>
        <Text numberOfLines={1} style={authorStyle(scale)}>
          {manga.author}
        </Text>
        {(!scale || scale.showGenre) && (
          <View style={styles.inlineRow}>
            <Text style={[styles.neonStatText, metaStyle(scale)]} numberOfLines={1}>
              {manga.genre}
            </Text>
            <Text style={metaStyle(scale)}>{manga.chapters} ch.</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export function Card08Accent({ manga, numColumns, screenWidth }) {
  const scale = getScale(numColumns, screenWidth);
  return (
    <View style={cardShell(scale, styles.portrait, styles.accentCard)}>
      <CoverImage uri={manga.coverUrl} style={coverStyle(scale, styles.coverPortraitAccent)} />
      <View style={bodyStyle(scale)}>
        <Text numberOfLines={scale?.titleLines ?? 2} style={titleStyle(scale)}>
          {manga.title}
        </Text>
        <Text numberOfLines={scale?.authorLines ?? 1} style={authorStyle(scale)}>
          {manga.author}
        </Text>
        <View style={styles.inlineRow}>
          <Text style={[styles.minimalRating, metaStyle(scale)]}>★ {manga.rating.toFixed(1)}</Text>
          <StatusBadge status={manga.status} scale={scale} />
        </View>
      </View>
    </View>
  );
}

export function Card09Cinematic({ manga, numColumns, screenWidth }) {
  const scale = getScale(numColumns, screenWidth);
  return (
    <View style={cardShell(scale, styles.portrait)}>
      <CoverImage uri={manga.coverUrl} style={coverStyle(scale, styles.coverPortrait)}>
        {!scale?.compactCard && <View style={styles.mangoBarTop} />}
        {!scale?.compactCard && <View style={styles.mangoBarBottom} />}
        {!scale?.compactCard && (
          <Text style={[styles.topRated, { top: overlayInset(scale, 10), left: overlayInset(scale, 10) }]}>
            TOP RATED
          </Text>
        )}
      </CoverImage>
      <View style={[bodyStyle(scale), styles.cinematicBody]}>
        <Text
          numberOfLines={scale?.titleLines ?? 2}
          style={[titleStyle(scale), !scale?.compactCard && styles.uppercase]}
        >
          {manga.title}
        </Text>
        <Text
          numberOfLines={scale?.authorLines ?? 1}
          style={[authorStyle(scale), !scale?.compactCard && styles.italic]}
        >
          {manga.author}
        </Text>
        {!scale?.compactCard && (
          <Text numberOfLines={2} style={metaStyle(scale)}>
            {manga.description}
          </Text>
        )}
        <View style={styles.inlineRow}>
          <RatingRow
            rating={manga.rating}
            size={scale?.ratingSize ?? 10}
            showValue={false}
            scale={scale}
          />
          {!scale?.compactCard && <Text style={metaStyle(scale)}>{manga.latestChapter}</Text>}
        </View>
      </View>
    </View>
  );
}

export function Card10Rank({ manga, rank, numColumns, screenWidth }) {
  const scale = getScale(numColumns, screenWidth);
  const compact = Boolean(scale?.compactCard);
  const rankLabel = String(rank ?? 0).padStart(2, '0');
  const rankFontSize = compact ? Math.max(28, scale.titleSize * 3.2) : 64;
  const stroke = compact ? 1.5 : 2.5;

  return (
    <View
      style={[
        cardShell(scale, styles.portrait, styles.rankCard),
        scale?.borderRadius != null && { borderRadius: scale.borderRadius },
      ]}
    >
      <View style={[coverStyle(scale, styles.coverPortrait), styles.rankCover]}>
        <CoverImage
          uri={manga.coverUrl}
          style={StyleSheet.absoluteFill}
          imageStyle={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.4)', 'rgba(255,255,255,0.92)']}
          locations={[0.4, 0.72, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <View
          style={[
            styles.badgeTopRight,
            { top: overlayInset(scale), right: overlayInset(scale) },
          ]}
        >
          <StatusBadge status={manga.status} scale={scale} />
        </View>
      </View>

      {/* Overlaps cover → body like web Card10 */}
      <View
        style={[
          styles.rankWatermarkWrap,
          {
            left: compact ? 2 : 4,
            top: undefined,
            bottom: undefined,
            marginTop: compact ? -18 : -28,
            marginBottom: compact ? -4 : -6,
            zIndex: 3,
          },
        ]}
        pointerEvents="none"
      >
        {[
          [-stroke, 0],
          [stroke, 0],
          [0, -stroke],
          [0, stroke],
          [-stroke, -stroke],
          [stroke, -stroke],
          [-stroke, stroke],
          [stroke, stroke],
        ].map(([dx, dy], i) => (
          <Text
            key={i}
            style={[
              styles.rankWatermarkStroke,
              { fontSize: rankFontSize, left: dx, top: dy },
            ]}
          >
            {rankLabel}
          </Text>
        ))}
        <Text style={[styles.rankWatermarkFill, { fontSize: rankFontSize }]}>
          {rankLabel}
        </Text>
      </View>

      <View style={[bodyStyle(scale), styles.rankBody]}>
        <Text numberOfLines={scale?.titleLines ?? 2} style={titleStyle(scale)}>
          {manga.title}
        </Text>
        <Text numberOfLines={scale?.authorLines ?? 1} style={authorStyle(scale)}>
          {manga.author}
        </Text>
        <View style={[styles.inlineRow, styles.rankMetaRow]}>
          <Text style={[styles.rankRating, metaStyle(scale)]}>
            ★ {manga.rating.toFixed(1)}
          </Text>
          {!compact ? (
            <Text style={metaStyle(scale)}>{manga.views} views</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  portrait: { flex: 1 },
  compactCard: { borderRadius: 10 },
  coverPortrait: { aspectRatio: 2 / 3 },
  coverPortraitAccent: { aspectRatio: 3 / 4, borderLeftWidth: 4, borderLeftColor: colors.redOrange },
  overlayCard: { aspectRatio: 2 / 3 },
  overlayGradient: { backgroundColor: 'rgba(0,0,0,0.55)' },
  badgeTopRight: { position: 'absolute' },
  badgeTopLeft: { position: 'absolute', gap: 4 },
  ratingPill: { position: 'absolute' },
  ratingPillText: { fontSize: 11, fontWeight: '700', color: colors.navy },
  overlayFooter: { position: 'absolute', gap: 2 },
  overlayTitle: { color: colors.white, fontWeight: '700' },
  overlayAuthor: { color: colors.almond },
  overlayMeta: { color: 'rgba(245,240,225,0.95)' },
  neonCardTight: { borderWidth: 1, borderColor: `${colors.redOrange}33` },
  neonBody: { borderTopWidth: 1, borderTopColor: `${colors.almondBorder}99` },
  neonStats: { position: 'absolute', flexDirection: 'row', justifyContent: 'space-between' },
  neonStatText: { fontWeight: '600', color: colors.navy },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 2 },
  minimalCard: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.almondBorder,
    overflow: 'hidden',
  },
  minimalCompact: { borderRadius: 10 },
  minimalThemeBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 1,
  },
  minimalCover: { aspectRatio: 2 / 3, borderRadius: 12 },
  minimalImage: { borderRadius: 12 },
  minimalBody: {
    flex: 1,
    backgroundColor: colors.white,
  },
  minimalRating: { color: colors.muted, fontWeight: '600', marginTop: 2 },
  hotBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.navy,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  hotText: { color: colors.white, fontWeight: '700' },
  tagOverlay: { position: 'absolute', flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  tagOverlayText: { color: colors.navy, fontWeight: '500' },
  statsRow: { position: 'absolute', flexDirection: 'row', gap: 4 },
  statBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 8,
    paddingVertical: 6,
  },
  statBoxTight: { paddingVertical: 3, borderRadius: 5 },
  statLabel: { color: colors.muted },
  statValue: { fontWeight: '700', color: colors.navy },
  inlineRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2, flexWrap: 'wrap' },
  glassPanel: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 12,
  },
  glassTight: { paddingHorizontal: 5, paddingVertical: 2 },
  accentCard: { borderLeftWidth: 4, borderLeftColor: colors.redOrange },
  mangoBarTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 4, backgroundColor: colors.mango },
  mangoBarBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, backgroundColor: colors.mango },
  topRated: { position: 'absolute', fontWeight: '700', color: colors.almond },
  cinematicBody: { borderTopWidth: 1, borderTopColor: colors.almondBorder },
  uppercase: { textTransform: 'uppercase' },
  italic: { fontStyle: 'italic' },
  rankCard: {
    borderColor: colors.navy,
  },
  rankCover: {
    overflow: 'hidden',
  },
  rankBody: {
    backgroundColor: colors.white,
  },
  rankMetaRow: {
    marginTop: 'auto',
    paddingTop: 4,
  },
  rankRating: {
    color: colors.success,
    fontWeight: '700',
  },
  rankWatermarkWrap: {
    alignSelf: 'flex-start',
    marginLeft: 0,
  },
  rankWatermarkStroke: {
    position: 'absolute',
    fontWeight: '900',
    color: colors.white,
  },
  rankWatermarkFill: {
    fontWeight: '900',
    color: colors.navy,
  },
});
