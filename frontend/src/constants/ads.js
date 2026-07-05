/**
 * Monetag ad zones — update IDs from https://publishers.monetag.com/
 *
 * Formats:
 * - Push Notifications (OnClick combo): tag.min.js in <head> + sw.js at site root
 * - In-Page Push (Banner): zone script via nap5k.com
 * - Vignette Banner: zone script via n6wxm.com
 */
export const ADS = {
  /** Push Notifications — tag script domain (5gvci) ≠ sw.js domain (3nbf4) per Monetag dashboard */
  pushZoneId: 11239732,
  pushTagDomain: '5gvci.com',
  pushSwDomain: '3nbf4.com',
  pushScriptSrc: 'https://5gvci.com/act/files/tag.min.js?z=11239732',
  serviceWorkerPath: '/sw.js',

  /** In-Page Push (Banner) — https://help.monetag.com/en/articles/6959534-in-page-push-notifications-ipp */
  inPagePushZone: '11239789',
  inPagePushScriptSrc: 'https://nap5k.com/tag.min.js',

  /** Vignette Banner — https://help.monetag.com/en/articles/6725606-vignette-banners */
  vignetteZone: '10659422',
  vignetteScriptSrc: 'https://n6wxm.com/vignette.min.js',

  /** Direct / iframe banner (footer strip) */
  iframeBannerUrl: 'https://omg10.com/4/11239737',
};
