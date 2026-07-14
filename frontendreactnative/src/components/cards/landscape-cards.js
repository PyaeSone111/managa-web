import { StyleSheet, Text, View } from 'react-native';
import colors from '../../theme/colors';
import {
  cardStyles,
  CoverImage,
  GenreBadge,
  RatingRow,
  StatusBadge,
  ThemeLeftBorder,
} from './shared';

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
    <View style={[cardStyles.card, styles.bannerCard]}>
      <CoverImage uri={uri} style={StyleSheet.absoluteFill} />
      <View style={styles.bannerOverlay} />
      <View style={styles.bannerContent}>
        <View style={styles.inlineRow}>
          <StatusBadge status={manga.status} />
          <Text style={styles.bannerGenre}>{manga.genre}</Text>
        </View>
        <Text numberOfLines={1} style={styles.bannerTitle}>{manga.title}</Text>
        <Text numberOfLines={1} style={styles.bannerAuthor}>{manga.author}</Text>
        <Text numberOfLines={2} style={styles.bannerDesc}>{manga.description}</Text>
        <View style={styles.inlineRow}>
          <Text style={styles.bannerRating}>★ {manga.rating.toFixed(1)}</Text>
          <Text style={styles.bannerMeta}>{manga.views} views</Text>
          <Text style={styles.bannerMeta}>{manga.chapters} Ch.</Text>
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

export function Card18Banner({ manga }) {
  const uri = manga.coverImageUrl || manga.coverUrl;
  return (
    <View style={[cardStyles.card, styles.featureBanner]}>
      <CoverImage uri={uri} style={StyleSheet.absoluteFill} />
      <View style={styles.featureOverlay} />
      <View style={styles.featureContent}>
        <CoverImage uri={uri} style={styles.featureThumb} />
        <View style={styles.featureText}>
          <View style={styles.inlineRow}>
            <View style={styles.featuredBadge}><Text style={styles.featuredText}>FEATURED</Text></View>
            <StatusBadge status={manga.status} />
          </View>
          <Text numberOfLines={1} style={styles.featureTitle}>{manga.title}</Text>
          <Text numberOfLines={1} style={styles.featureAuthor}>{manga.author}</Text>
          <Text numberOfLines={2} style={styles.featureDesc}>{manga.description}</Text>
          <View style={styles.inlineRow}>
            <RatingRow rating={manga.rating} size={10} showValue />
            <Text style={styles.bannerMeta}>{manga.views}</Text>
            <Text style={styles.bannerMeta}>{manga.chapters} chapters</Text>
          </View>
        </View>
      </View>
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
  bannerCard: { minHeight: 160, overflow: 'hidden' },
  bannerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  bannerContent: { flex: 1, justifyContent: 'center', padding: 16, gap: 4 },
  bannerGenre: { fontSize: 10, color: colors.almond, fontWeight: '500' },
  bannerTitle: { fontSize: 18, fontWeight: '700', color: colors.white },
  bannerAuthor: { fontSize: 11, color: colors.almond },
  bannerDesc: { fontSize: 11, color: 'rgba(255,255,255,0.9)' },
  bannerRating: { fontSize: 12, color: colors.almond, fontWeight: '700' },
  bannerMeta: { fontSize: 11, color: 'rgba(255,255,255,0.85)' },
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
  featureBanner: { minHeight: 180, overflow: 'hidden' },
  featureOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: `${colors.redOrange}CC` },
  featureContent: { flexDirection: 'row', padding: 16, gap: 12, alignItems: 'center' },
  featureThumb: { width: 88, height: 120, borderRadius: 8, borderWidth: 2, borderColor: `${colors.almond}CC` },
  featureText: { flex: 1, gap: 4 },
  featuredBadge: { backgroundColor: colors.navy, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  featuredText: { color: colors.white, fontSize: 10, fontWeight: '700' },
  featureTitle: { fontSize: 18, fontWeight: '700', color: colors.white },
  featureAuthor: { fontSize: 12, color: colors.almond },
  featureDesc: { fontSize: 11, color: 'rgba(255,255,255,0.9)' },
  timelineCard: { minHeight: 120 },
  timelineAccent: { width: 4, backgroundColor: colors.redOrange },
  timelineUpdated: { fontSize: 10, color: colors.redOrange, fontWeight: '600', marginBottom: 2 },
  chapterPill: { backgroundColor: `${colors.redOrange}18`, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: `${colors.redOrange}33` },
  chapterPillText: { fontSize: 10, color: colors.redOrange, fontWeight: '600' },
  badgeTopLeft: { position: 'absolute', top: 8, left: 8 },
  trendingBadge: { backgroundColor: colors.navy, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  trendingText: { color: colors.white, fontSize: 10, fontWeight: '700' },
});
