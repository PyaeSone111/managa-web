import { useState } from 'react';
import { ImageBackground, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from '../../theme/colors';
import {
  cardStyles,
  CoverImage,
  GenreBadge,
  RatingRow,
  StatusBadge,
  ThemeLeftBorder,
} from './shared';

/** Soft card lift — outer shell only (overflow:hidden kills shadow). */
const bannerShadow = Platform.select({
  ios: {
    shadowColor: '#0D211F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
  },
  android: {
    elevation: 10,
  },
  default: {},
});

const thumbShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
  },
  android: {
    elevation: 14,
  },
  default: {},
});

export function Card11Classic({ manga }) {
  return (
    <View style={[cardStyles.card, cardStyles.landscape]}>
      <CoverImage uri={manga.coverUrl} style={cardStyles.landscapeCover} />
      <View style={cardStyles.landscapeBody}>
        <View>
          <View style={styles.headerRow}>
            <Text numberOfLines={2} style={[cardStyles.title, styles.flexTitle]}>{manga.title}</Text>
            <StatusBadge status={manga.status} />
          </View>
          <Text numberOfLines={1} style={cardStyles.author}>{manga.author}</Text>
          <Text numberOfLines={2} style={cardStyles.meta}>{manga.description}</Text>
        </View>
        <View style={styles.inlineRow}>
          <Text style={styles.ratingText}>★ {manga.rating.toFixed(1)}</Text>
          <Text style={cardStyles.meta}>{manga.chapters} Ch.</Text>
          <GenreBadge label={manga.genre} />
        </View>
      </View>
    </View>
  );
}

export function Card12Cinematic({ manga }) {
  const uri = manga.coverImageUrl || manga.coverUrl;
  return (
    <View style={[styles.shadowShell, bannerShadow]}>
      <View style={styles.bannerInner}>
        <CoverImage
          uri={uri}
          style={StyleSheet.absoluteFill}
          imageStyle={{ opacity: 0.88 }}
        />
        {/* Frontend: from-black/75 via-black/40 to-transparent */}
        <LinearGradient
          colors={['rgba(0,0,0,0.78)', 'rgba(0,0,0,0.42)', 'rgba(0,0,0,0.08)', 'transparent']}
          locations={[0, 0.35, 0.65, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <View style={styles.bannerContent}>
          <View style={styles.bannerTextCol}>
            <View style={styles.inlineRow}>
              <StatusBadge status={manga.status} />
              {manga.genre ? (
                <Text numberOfLines={1} style={styles.bannerGenre}>
                  {manga.genre}
                </Text>
              ) : null}
            </View>
            <Text numberOfLines={1} style={styles.bannerTitle}>
              {manga.title}
            </Text>
            <Text numberOfLines={1} style={styles.bannerAuthor}>
              {manga.author}
            </Text>
            {manga.description ? (
              <Text numberOfLines={2} style={styles.bannerDesc}>
                {manga.description}
              </Text>
            ) : null}
            <View style={[styles.inlineRow, styles.bannerMetaRow]}>
              <View style={styles.metaChip}>
                <Ionicons name="star" size={12} color={colors.almond} />
                <Text style={styles.bannerRating}>{manga.rating.toFixed(1)}</Text>
              </View>
              <View style={styles.metaChip}>
                <Ionicons name="eye-outline" size={12} color="rgba(255,255,255,0.85)" />
                <Text style={styles.bannerMeta}>{manga.views}</Text>
              </View>
              <View style={styles.metaChip}>
                <Ionicons name="book-outline" size={12} color="rgba(255,255,255,0.85)" />
                <Text style={styles.bannerMeta}>{manga.chapters}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

export function Card13Glass({ manga }) {
  return (
    <View style={[cardStyles.card, cardStyles.landscape, styles.glassCard]}>
      <CoverImage uri={manga.coverUrl} style={[cardStyles.landscapeCover, { width: 112 }]} />
      <View style={[cardStyles.landscapeBody, styles.glassBody]}>
        <View>
          <Text numberOfLines={1} style={cardStyles.title}>{manga.title}</Text>
          <Text numberOfLines={1} style={cardStyles.author}>{manga.author}</Text>
          <View style={[styles.tagRow, { marginTop: 6 }]}>
            {(manga.tags || []).slice(0, 3).map((tag) => (
              <GenreBadge key={tag} label={tag} />
            ))}
          </View>
        </View>
        <View style={styles.footerRow}>
          <RatingRow rating={manga.rating} ratingCount={manga.ratingCount} size={10} />
          <Text style={cardStyles.meta}>{manga.latestChapter}</Text>
        </View>
      </View>
    </View>
  );
}

export function Card14Action({ manga }) {
  return (
    <View style={[cardStyles.card, cardStyles.landscape]}>
      <CoverImage uri={manga.coverUrl} style={cardStyles.landscapeCover} />
      <View style={cardStyles.landscapeBody}>
        <View>
          <Text numberOfLines={1} style={cardStyles.title}>{manga.title}</Text>
          <Text numberOfLines={1} style={cardStyles.author}>{manga.author}</Text>
          <Text numberOfLines={1} style={cardStyles.meta}>{manga.description}</Text>
        </View>
        <View style={styles.inlineRow}>
          <View style={styles.actionButton}><Text style={styles.actionButtonText}>Read Now</Text></View>
          <View style={styles.saveButton}><Text style={styles.saveButtonText}>Save</Text></View>
        </View>
      </View>
    </View>
  );
}

export function Card15Compact({ manga, rank }) {
  return (
    <View style={[cardStyles.card, styles.compactCard]}>
      <ThemeLeftBorder width={4} />
      <Text style={styles.rankNumber}>{rank ?? 0}</Text>
      <CoverImage uri={manga.coverUrl} style={styles.compactCover} />
      <View style={styles.compactBody}>
        <Text numberOfLines={1} style={cardStyles.title}>{manga.title}</Text>
        <Text numberOfLines={1} style={cardStyles.meta}>{manga.author} | {manga.genre}</Text>
      </View>
      <View style={styles.compactRight}>
        <Text style={styles.ratingText}>★ {manga.rating.toFixed(1)}</Text>
        <StatusBadge status={manga.status} />
      </View>
    </View>
  );
}

export function Card16Neon({ manga }) {
  return (
    <View style={[cardStyles.card, cardStyles.landscape, styles.neonLandscape]}>
      <CoverImage uri={manga.coverUrl} style={[cardStyles.landscapeCover, { width: 112 }]} />
      <View style={cardStyles.landscapeBody}>
        <View>
          <Text style={styles.neonLabel}>{manga.genre}</Text>
          <Text numberOfLines={1} style={cardStyles.title}>{manga.title}</Text>
          <Text numberOfLines={1} style={cardStyles.author}>{manga.author}</Text>
        </View>
        <View style={styles.footerRow}>
          <RatingRow rating={manga.rating} size={10} showValue={false} />
          <Text style={cardStyles.meta}>{manga.updatedAt}</Text>
        </View>
      </View>
    </View>
  );
}

export function Card17Dense({ manga }) {
  return (
    <View style={[cardStyles.card, cardStyles.landscape, { minHeight: 160 }]}>
      <CoverImage uri={manga.coverUrl} style={[cardStyles.landscapeCover, { width: 112 }]} />
      <View style={cardStyles.landscapeBody}>
        <Text numberOfLines={1} style={cardStyles.title}>{manga.title}</Text>
        <Text numberOfLines={1} style={cardStyles.author}>
          {manga.author}{manga.artist ? ` / ${manga.artist}` : ''}
        </Text>
        <Text numberOfLines={2} style={cardStyles.meta}>{manga.description}</Text>
        <View style={styles.tagRow}>
          {(manga.tags || []).slice(0, 3).map((tag) => (
            <GenreBadge key={tag} label={tag} />
          ))}
        </View>
        <View style={styles.footerRow}>
          <RatingRow rating={manga.rating} ratingCount={manga.ratingCount} size={10} />
          <Text style={cardStyles.meta}>{manga.chapters} Ch.</Text>
          <StatusBadge status={manga.status} />
        </View>
      </View>
    </View>
  );
}

export function Card18Banner({
  manga,
  chapterLabel,
  onContinue,
  continueLabel = 'Continue',
}) {
  const uri = manga.coverImageUrl || manga.coverUrl;
  const showRecentActions = chapterLabel != null || typeof onContinue === 'function';
  const [cardWidth, setCardWidth] = useState(0);
  const leftW = cardWidth > 0 ? cardWidth * 0.48 : 0;
  const blendLeft = cardWidth > 0 ? cardWidth * 0.42 : 0;
  const blendW = cardWidth > 0 ? cardWidth * 0.48 : 0;

  return (
    <View style={[styles.shadowShell, styles.featureShadowShell, bannerShadow]}>
      <ImageBackground
        source={uri ? { uri } : undefined}
        style={[styles.featureFrame, showRecentActions && styles.featureFrameTall]}
        imageStyle={styles.featureBgImageStyle}
        resizeMode="cover"
        onLayout={(e) => setCardWidth(e.nativeEvent.layout.width)}
      >
        {/* Left solid navy · mid fade · right uncovered cover (pixel widths — % fails on Android) */}
        {cardWidth > 0 ? (
          <>
            <View
              pointerEvents="none"
              style={[styles.featureBgLeftBlock, { width: leftW }]}
            />
            <LinearGradient
              pointerEvents="none"
              colors={[
                colors.navyDark,
                'rgba(22,46,68,0.95)',
                'rgba(22,46,68,0.7)',
                'rgba(22,46,68,0.35)',
                'rgba(22,46,68,0)',
              ]}
              locations={[0, 0.25, 0.5, 0.75, 1]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={[styles.featureBgBlend, { left: blendLeft, width: blendW }]}
            />
          </>
        ) : null}

        <View style={[styles.featureContent, showRecentActions && styles.featureContentTall]}>
          <View style={[styles.featureThumbShell, thumbShadow]}>
            <CoverImage
              uri={uri}
              style={styles.featureThumb}
              imageStyle={styles.featureThumbImage}
            />
          </View>

          <View style={styles.featureText}>
            <View style={styles.featureTextTop}>
              <View style={styles.featureTagRow}>
                <View style={styles.featuredBadge}>
                  <Text style={styles.featuredText}>FEATURED</Text>
                </View>
                <View style={styles.featureStatusTag}>
                  <Text style={styles.featureStatusTagText}>{manga.status}</Text>
                </View>
              </View>
              <Text numberOfLines={2} style={styles.featureTitle}>
                {manga.title}
              </Text>
              <View style={styles.featureMetaRow}>
                <View style={styles.metaChip}>
                  <Ionicons name="star" size={10} color={colors.almond} />
                  <Text style={styles.featureRating}>{manga.rating.toFixed(1)}</Text>
                </View>
                <View style={styles.metaChip}>
                  <Ionicons name="eye-outline" size={10} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.featureStat}>{manga.views}</Text>
                </View>
                <Text style={styles.featureStat}>{manga.chapters} ch.</Text>
              </View>
            </View>

            {showRecentActions ? (
              <View style={styles.featureRecentRow}>
                <Text style={styles.featureChapter} numberOfLines={1}>
                  {chapterLabel || 'In progress'}
                </Text>
                {typeof onContinue === 'function' ? (
                  <Pressable
                    onPress={onContinue}
                    style={({ pressed }) => [
                      styles.featureContinueBtn,
                      pressed && styles.featureContinueBtnPressed,
                    ]}
                    hitSlop={6}
                  >
                    <Text style={styles.featureContinueText}>{continueLabel}</Text>
                    <Ionicons name="play" size={10} color={colors.white} />
                  </Pressable>
                ) : null}
              </View>
            ) : (
              <Text numberOfLines={1} style={styles.featureAuthor}>
                {manga.author}
              </Text>
            )}
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

export function Card19Timeline({ manga }) {
  return (
    <View style={[cardStyles.card, cardStyles.landscape, styles.timelineCard]}>
      <View style={styles.timelineAccent} />
      <CoverImage uri={manga.coverUrl} style={[cardStyles.landscapeCover, { width: 80 }]} />
      <View style={cardStyles.landscapeBody}>
        <View>
          <Text style={styles.timelineUpdated}>{manga.updatedAt}</Text>
          <Text numberOfLines={1} style={cardStyles.title}>{manga.title}</Text>
          <Text numberOfLines={1} style={cardStyles.author}>{manga.author}</Text>
        </View>
        <View style={styles.footerRow}>
          <View style={styles.chapterPill}><Text style={styles.chapterPillText}>{manga.latestChapter}</Text></View>
          <Text style={styles.ratingText}>★ {manga.rating.toFixed(1)}</Text>
        </View>
      </View>
    </View>
  );
}

export function Card20Trending({ manga }) {
  return (
    <View style={[cardStyles.card, cardStyles.landscape]}>
      <CoverImage uri={manga.coverUrl} style={[cardStyles.landscapeCover, { width: 112 }]}>
        <View style={styles.badgeTopLeft}>
          <View style={styles.trendingBadge}><Text style={styles.trendingText}>TRENDING</Text></View>
        </View>
      </CoverImage>
      <View style={cardStyles.landscapeBody}>
        <View>
          <Text numberOfLines={1} style={cardStyles.title}>{manga.title}</Text>
          <Text numberOfLines={1} style={cardStyles.author}>{manga.author}</Text>
          <Text numberOfLines={2} style={cardStyles.meta}>{manga.description}</Text>
        </View>
        <View style={[styles.inlineRow, { flexWrap: 'wrap' }]}>
          <Text style={styles.ratingText}>★ {manga.rating.toFixed(1)}</Text>
          <Text style={cardStyles.meta}>{manga.views}</Text>
          <Text style={cardStyles.meta}>{manga.chapters} Ch.</Text>
          <StatusBadge status={manga.status} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' },
  flexTitle: { flex: 1 },
  inlineRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  ratingText: { fontSize: 11, color: colors.redOrange, fontWeight: '600' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' },
  shadowShell: {
    borderRadius: 12,
    backgroundColor: colors.navyDark,
    marginVertical: 2,
  },
  bannerInner: {
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 152,
    backgroundColor: colors.navyDark,
  },
  bannerContent: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 152,
  },
  bannerTextCol: {
    maxWidth: '72%',
    gap: 5,
  },
  bannerGenre: {
    flexShrink: 1,
    fontSize: 10,
    color: colors.almond,
    fontWeight: '500',
  },
  bannerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.3,
    lineHeight: 22,
  },
  bannerAuthor: { fontSize: 11, color: colors.almond },
  bannerDesc: { fontSize: 11, color: 'rgba(255,255,255,0.9)', lineHeight: 15 },
  bannerRating: { fontSize: 12, color: colors.almond, fontWeight: '700' },
  bannerMeta: { fontSize: 11, color: 'rgba(255,255,255,0.85)' },
  bannerMetaRow: { marginTop: 4, gap: 12 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  glassCard: { backgroundColor: 'rgba(255,255,255,0.95)' },
  glassBody: { backgroundColor: 'rgba(255,255,255,0.92)' },
  actionButton: { backgroundColor: colors.redOrange, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  actionButtonText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  saveButton: { backgroundColor: `${colors.almond}99`, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: colors.almondBorder },
  saveButtonText: { color: colors.navy, fontSize: 11, fontWeight: '600' },
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingRight: 10,
    paddingLeft: 0,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  rankNumber: { fontSize: 16, fontWeight: '900', color: colors.navy, minWidth: 24, textAlign: 'center' },
  compactCover: { width: 48, height: 64, borderRadius: 6 },
  compactBody: { flex: 1, minWidth: 0, gap: 2 },
  compactRight: { alignItems: 'flex-end', gap: 6 },
  neonLandscape: { borderWidth: 2, borderColor: `${colors.redOrange}33` },
  neonLabel: { fontSize: 10, color: colors.redOrange, fontWeight: '700', textTransform: 'uppercase', marginBottom: 2 },
  featureShadowShell: {
    backgroundColor: colors.navy,
  },
  featureFrame: {
    width: '100%',
    borderRadius: 12,
    minHeight: 128,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  featureFrameTall: {
    minHeight: 142,
  },
  featureBgImageStyle: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  featureContent: {
    position: 'relative',
    zIndex: 2,
    elevation: 2,
    flexDirection: 'row',
    paddingVertical: 10,
    paddingLeft: 10,
    paddingRight: 12,
    gap: 12,
    alignItems: 'center',
    minHeight: 128,
  },
  featureContentTall: {
    minHeight: 142,
    alignItems: 'stretch',
  },
  // Solid navy block on left; gradient only in the blend zone
  featureBgLeftBlock: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: colors.navyDark,
    zIndex: 1,
  },
  featureBgBlend: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    zIndex: 1,
  },
  featureThumbShell: {
    borderRadius: 10,
    backgroundColor: colors.navyDark,
    alignSelf: 'center',
  },
  featureThumb: {
    width: 84,
    height: 118,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(245,240,225,0.92)',
    overflow: 'hidden',
  },
  featureThumbImage: {
    borderRadius: 8,
  },
  featureText: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 2,
    gap: 8,
    justifyContent: 'space-between',
  },
  featureTextTop: {
    gap: 4,
  },
  featureTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  featuredBadge: {
    backgroundColor: colors.redOrange,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  featuredText: { color: colors.white, fontSize: 8, fontWeight: '700', letterSpacing: 0.3 },
  featureStatusTag: {
    backgroundColor: colors.redOrange,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  featureStatusTagText: {
    color: colors.white,
    fontSize: 8,
    fontWeight: '600',
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: -0.15,
    lineHeight: 17,
  },
  featureAuthor: { fontSize: 10, color: colors.almond, marginTop: 2 },
  featureMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 1,
  },
  featureRating: {
    fontSize: 10,
    color: colors.almond,
    fontWeight: '700',
  },
  featureStat: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.82)',
  },
  featureRecentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  featureChapter: {
    flex: 1,
    minWidth: 0,
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(245,240,225,0.92)',
  },
  featureContinueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: colors.redOrange,
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderRadius: 8,
  },
  featureContinueBtnPressed: {
    opacity: 0.88,
  },
  featureContinueText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  timelineCard: { minHeight: 120 },
  timelineAccent: { width: 4, backgroundColor: colors.redOrange },
  timelineUpdated: { fontSize: 10, color: colors.redOrange, fontWeight: '600', marginBottom: 2 },
  chapterPill: { backgroundColor: `${colors.redOrange}18`, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: `${colors.redOrange}33` },
  chapterPillText: { fontSize: 10, color: colors.redOrange, fontWeight: '600' },
  badgeTopLeft: { position: 'absolute', top: 8, left: 8 },
  trendingBadge: { backgroundColor: colors.navy, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  trendingText: { color: colors.white, fontSize: 10, fontWeight: '700' },
});
