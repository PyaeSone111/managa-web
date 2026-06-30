import { StyleSheet, Text, View } from 'react-native';
import colors from '../../theme/colors';
import {
  cardStyles,
  CoverImage,
  GenreBadge,
  RatingRow,
  StatusBadge,
} from './shared';

export function Card01Classic({ manga }) {
  return (
    <View style={[cardStyles.card, styles.portrait]}>
      <CoverImage uri={manga.coverUrl} style={styles.coverPortrait}>
        <View style={styles.badgeTopRight}>
          <StatusBadge status={manga.status} />
        </View>
      </CoverImage>
      <View style={cardStyles.cardBody}>
        <Text numberOfLines={2} style={cardStyles.title}>{manga.title}</Text>
        <Text numberOfLines={1} style={cardStyles.author}>{manga.author}</Text>
        <RatingRow rating={manga.rating} />
        <GenreBadge label={manga.genre} />
      </View>
    </View>
  );
}

export function Card02Overlay({ manga }) {
  const uri = manga.coverImageUrl || manga.coverUrl;
  return (
    <View style={[cardStyles.card, styles.overlayCard]}>
      <CoverImage uri={uri} style={StyleSheet.absoluteFill} />
      <View style={[cardStyles.overlay, styles.overlayGradient]} />
      <View style={styles.badgeTopLeft}>
        <StatusBadge status={manga.status} />
      </View>
      <View style={[cardStyles.glass, styles.ratingPill]}>
        <Text style={styles.ratingPillText}>★ {manga.rating.toFixed(1)}</Text>
      </View>
      <View style={styles.overlayFooter}>
        <Text numberOfLines={2} style={styles.overlayTitle}>{manga.title}</Text>
        <Text numberOfLines={1} style={styles.overlayAuthor}>{manga.author}</Text>
        <Text style={styles.overlayMeta}>{manga.genre} | {manga.chapters} Ch.</Text>
      </View>
    </View>
  );
}

export function Card03Neon({ manga }) {
  return (
    <View style={[cardStyles.card, styles.neonCard]}>
      <CoverImage uri={manga.coverUrl} style={styles.coverPortrait}>
        <View style={styles.neonStats}>
          <View style={cardStyles.glass}><Text style={styles.neonStatText}>🔥 {manga.views}</Text></View>
          <View style={cardStyles.glass}><Text style={styles.neonStatText}>★ {manga.rating.toFixed(1)}</Text></View>
        </View>
      </CoverImage>
      <View style={[cardStyles.cardBody, styles.neonBody]}>
        <Text numberOfLines={2} style={cardStyles.title}>{manga.title}</Text>
        <Text numberOfLines={1} style={cardStyles.author}>{manga.author}</Text>
        <View style={styles.tagRow}>
          {(manga.tags || []).slice(0, 2).map((tag) => (
            <GenreBadge key={tag} label={tag} />
          ))}
        </View>
      </View>
    </View>
  );
}

export function Card04Minimal({ manga }) {
  return (
    <View style={[styles.minimalCard]}>
      <CoverImage uri={manga.coverUrl} style={styles.minimalCover} imageStyle={styles.minimalImage} />
      <View style={styles.minimalBody}>
        <Text numberOfLines={1} style={cardStyles.title}>{manga.title}</Text>
        <Text numberOfLines={1} style={cardStyles.author}>{manga.author}</Text>
        <Text style={styles.minimalRating}>★ {manga.rating.toFixed(1)}</Text>
      </View>
    </View>
  );
}

export function Card05Badges({ manga }) {
  return (
    <View style={[cardStyles.card, styles.portrait]}>
      <CoverImage uri={manga.coverUrl} style={styles.coverPortrait}>
        <View style={styles.badgeTopLeft}>
          <StatusBadge status={manga.status} />
          <View style={styles.hotBadge}><Text style={styles.hotText}>HOT</Text></View>
        </View>
        <View style={styles.tagOverlay}>
          {(manga.tags || []).slice(0, 3).map((tag) => (
            <View key={tag} style={cardStyles.glass}><Text style={styles.tagOverlayText}>{tag}</Text></View>
          ))}
        </View>
      </CoverImage>
      <View style={cardStyles.cardBody}>
        <Text numberOfLines={2} style={cardStyles.title}>{manga.title}</Text>
        <Text numberOfLines={1} style={cardStyles.author}>{manga.author}</Text>
        <RatingRow rating={manga.rating} ratingCount={manga.ratingCount} />
      </View>
    </View>
  );
}

export function Card06Stats({ manga }) {
  return (
    <View style={[cardStyles.card, styles.portrait]}>
      <CoverImage uri={manga.coverUrl} style={styles.coverPortrait}>
        <View style={styles.statsRow}>
          <View style={styles.statBox}><Text style={styles.statLabel}>Views</Text><Text style={styles.statValue}>{manga.views}</Text></View>
          <View style={styles.statBox}><Text style={styles.statLabel}>Ch.</Text><Text style={styles.statValue}>{manga.chapters}</Text></View>
          <View style={styles.statBox}><Text style={styles.statLabel}>★</Text><Text style={styles.statValue}>{manga.rating.toFixed(1)}</Text></View>
        </View>
      </CoverImage>
      <View style={cardStyles.cardBody}>
        <Text numberOfLines={2} style={cardStyles.title}>{manga.title}</Text>
        <Text numberOfLines={1} style={cardStyles.author}>{manga.author}</Text>
        <View style={styles.inlineRow}>
          <StatusBadge status={manga.status} />
          <Text style={cardStyles.meta}>{manga.genre}</Text>
        </View>
      </View>
    </View>
  );
}

export function Card07Glass({ manga }) {
  const uri = manga.coverImageUrl || manga.coverUrl;
  return (
    <View style={[cardStyles.card, styles.overlayCard]}>
      <CoverImage uri={uri} style={StyleSheet.absoluteFill} />
      <View style={[cardStyles.overlay, styles.overlayGradient]} />
      <View style={[cardStyles.glass, styles.ratingPill]}>
        <Text style={styles.ratingPillText}>★ {manga.rating.toFixed(1)}</Text>
      </View>
      <View style={styles.glassPanel}>
        <Text numberOfLines={2} style={cardStyles.title}>{manga.title}</Text>
        <Text numberOfLines={1} style={cardStyles.author}>{manga.author}</Text>
        <View style={styles.inlineRow}>
          <Text style={styles.neonStatText}>{manga.genre}</Text>
          <Text style={cardStyles.meta}>{manga.chapters} chapters</Text>
        </View>
      </View>
    </View>
  );
}

export function Card08Accent({ manga }) {
  return (
    <View style={[cardStyles.card, styles.accentCard]}>
      <CoverImage uri={manga.coverUrl} style={styles.coverPortraitAccent} />
      <View style={cardStyles.cardBody}>
        <Text numberOfLines={2} style={cardStyles.title}>{manga.title}</Text>
        <Text numberOfLines={1} style={cardStyles.author}>{manga.author}</Text>
        <View style={styles.inlineRow}>
          <Text style={styles.minimalRating}>★ {manga.rating.toFixed(1)}</Text>
          <StatusBadge status={manga.status} />
        </View>
      </View>
    </View>
  );
}

export function Card09Cinematic({ manga }) {
  return (
    <View style={[cardStyles.card, styles.portrait]}>
      <CoverImage uri={manga.coverUrl} style={styles.coverPortrait}>
        <View style={styles.mangoBarTop} />
        <View style={styles.mangoBarBottom} />
        <Text style={styles.topRated}>TOP RATED</Text>
      </CoverImage>
      <View style={[cardStyles.cardBody, styles.cinematicBody]}>
        <Text numberOfLines={2} style={[cardStyles.title, styles.uppercase]}>{manga.title}</Text>
        <Text numberOfLines={1} style={[cardStyles.author, styles.italic]}>{manga.author}</Text>
        <Text numberOfLines={2} style={cardStyles.meta}>{manga.description}</Text>
        <View style={styles.inlineRow}>
          <RatingRow rating={manga.rating} size={10} showValue={false} />
          <Text style={cardStyles.meta}>{manga.latestChapter}</Text>
        </View>
      </View>
    </View>
  );
}

export function Card10Rank({ manga, rank }) {
  return (
    <View style={[cardStyles.card, styles.portrait]}>
      <CoverImage uri={manga.coverUrl} style={styles.coverPortrait}>
        <Text style={styles.rankWatermark}>{String(rank ?? 0).padStart(2, '0')}</Text>
        <View style={styles.badgeTopRight}>
          <StatusBadge status={manga.status} />
        </View>
      </CoverImage>
      <View style={cardStyles.cardBody}>
        <Text numberOfLines={2} style={cardStyles.title}>{manga.title}</Text>
        <Text numberOfLines={1} style={cardStyles.author}>{manga.author}</Text>
        <View style={styles.inlineRow}>
          <Text style={styles.minimalRating}>★ {manga.rating.toFixed(1)}</Text>
          <Text style={cardStyles.meta}>{manga.views} views</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  portrait: { flex: 1 },
  coverPortrait: { aspectRatio: 2 / 3 },
  coverPortraitAccent: { aspectRatio: 3 / 4, borderLeftWidth: 4, borderLeftColor: colors.redOrange },
  overlayCard: { aspectRatio: 2 / 3 },
  overlayGradient: { backgroundColor: 'rgba(0,0,0,0.55)' },
  badgeTopRight: { position: 'absolute', top: 8, right: 8 },
  badgeTopLeft: { position: 'absolute', top: 8, left: 8, gap: 4 },
  ratingPill: { position: 'absolute', top: 10, right: 10 },
  ratingPillText: { fontSize: 11, fontWeight: '700', color: colors.navy },
  overlayFooter: { position: 'absolute', left: 12, right: 12, bottom: 12, gap: 2 },
  overlayTitle: { color: colors.white, fontSize: 14, fontWeight: '700' },
  overlayAuthor: { color: colors.almond, fontSize: 11 },
  overlayMeta: { color: 'rgba(255,255,255,0.9)', fontSize: 10 },
  neonCard: { borderWidth: 2, borderColor: `${colors.redOrange}33` },
  neonBody: { borderTopWidth: 1, borderTopColor: `${colors.almondBorder}99` },
  neonStats: { position: 'absolute', left: 8, right: 8, bottom: 8, flexDirection: 'row', justifyContent: 'space-between' },
  neonStatText: { fontSize: 10, fontWeight: '600', color: colors.navy },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  minimalCard: { flex: 1, backgroundColor: `${colors.almond}88`, borderRadius: 16, borderWidth: 1, borderColor: `${colors.almondBorder}88`, padding: 8 },
  minimalCover: { aspectRatio: 2 / 3, borderRadius: 12, marginBottom: 8 },
  minimalImage: { borderRadius: 12 },
  minimalBody: { paddingHorizontal: 4, paddingBottom: 4, gap: 2 },
  minimalRating: { fontSize: 11, color: colors.muted, fontWeight: '600', marginTop: 4 },
  hotBadge: { alignSelf: 'flex-start', backgroundColor: colors.navy, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  hotText: { color: colors.white, fontSize: 10, fontWeight: '700' },
  tagOverlay: { position: 'absolute', left: 8, right: 8, bottom: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  tagOverlayText: { fontSize: 9, color: colors.navy, fontWeight: '500' },
  statsRow: { position: 'absolute', left: 8, right: 8, bottom: 8, flexDirection: 'row', gap: 4 },
  statBox: { flex: 1, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 8, paddingVertical: 6 },
  statLabel: { fontSize: 9, color: colors.muted },
  statValue: { fontSize: 10, fontWeight: '700', color: colors.navy },
  inlineRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' },
  glassPanel: { position: 'absolute', left: 10, right: 10, bottom: 10, backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 12, padding: 12, gap: 4 },
  accentCard: { borderLeftWidth: 4, borderLeftColor: colors.redOrange },
  mangoBarTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 4, backgroundColor: colors.mango },
  mangoBarBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, backgroundColor: colors.mango },
  topRated: { position: 'absolute', top: 10, left: 10, fontSize: 10, fontWeight: '700', color: colors.almond },
  cinematicBody: { borderTopWidth: 1, borderTopColor: colors.almondBorder },
  uppercase: { textTransform: 'uppercase' },
  italic: { fontStyle: 'italic' },
  rankWatermark: { position: 'absolute', left: 0, bottom: -8, fontSize: 56, fontWeight: '900', color: colors.navy, opacity: 0.85 },
});
