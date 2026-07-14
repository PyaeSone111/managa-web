const MOBILE_MAX = 640;

/** Typography, spacing, and cover ratio for dense portrait grids (2–6 columns). */
export function getCardGridScale(numColumns = 2, screenWidth) {
  const mobile = screenWidth != null && screenWidth < MOBILE_MAX;
  const tight = mobile && numColumns >= 3;
  const veryTight = mobile && numColumns >= 4;

  if (veryTight) {
    return {
      margin: 2,
      bodyPad: 4,
      titleSize: 8,
      authorSize: 7,
      metaSize: 7,
      ratingSize: 7,
      badgeScale: 0.72,
      coverAspect: 4 / 5,
      titleLines: 2,
      authorLines: 1,
      showGenre: false,
      showRatingCount: false,
      compactCard: true,
      borderRadius: 8,
    };
  }
  if (tight) {
    return {
      margin: 3,
      bodyPad: 5,
      titleSize: 9,
      authorSize: 8,
      metaSize: 8,
      ratingSize: 8,
      badgeScale: 0.82,
      coverAspect: 3 / 4,
      titleLines: 2,
      authorLines: 1,
      showGenre: false,
      showRatingCount: false,
      compactCard: true,
      borderRadius: 9,
    };
  }
  if (numColumns >= 4) {
    return {
      margin: 3,
      bodyPad: 5,
      titleSize: 10,
      authorSize: 9,
      metaSize: 8,
      ratingSize: 8,
      badgeScale: 0.85,
      coverAspect: 2 / 3,
      titleLines: 2,
      authorLines: 1,
      showGenre: false,
      showRatingCount: false,
    };
  }
  if (numColumns >= 3) {
    return {
      margin: 4,
      bodyPad: 7,
      titleSize: 11,
      authorSize: 10,
      metaSize: 9,
      ratingSize: 9,
      badgeScale: 0.92,
      coverAspect: 2 / 3,
      titleLines: 2,
      authorLines: 1,
      showGenre: false,
      showRatingCount: false,
    };
  }
  return {
    margin: 6,
    bodyPad: 10,
    titleSize: 13,
    authorSize: 11,
    metaSize: 10,
    ratingSize: 11,
    badgeScale: 1,
    coverAspect: 2 / 3,
    titleLines: 2,
    authorLines: 1,
    showGenre: true,
    showRatingCount: true,
  };
}

/** @deprecated Use getCardGridScale */
export const getBrowseGridScale = getCardGridScale;
