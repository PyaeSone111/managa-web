import { ADS } from '../../constants/ads';

/**
 * Monetag zone tags (In-Page Push, Vignette) use this IIFE pattern:
 * https://help.monetag.com/en/articles/6959534-in-page-push-notifications-ipp
 * https://help.monetag.com/en/articles/6725606-vignette-banners
 */
export function injectMonetagZoneScript(zone, src) {
  const parent = [document.documentElement, document.body].filter(Boolean).pop();
  if (!parent) return null;

  const script = document.createElement('script');
  script.dataset.zone = String(zone);
  script.src = src;
  parent.appendChild(script);
  return script;
}

/** Push Notifications — head tag with data-cfasync (Monetag docs). */
export function loadMonetagPushTag() {
  if (document.querySelector(`script[src="${ADS.pushScriptSrc}"]`)) return;

  const script = document.createElement('script');
  script.src = ADS.pushScriptSrc;
  script.async = true;
  script.dataset.cfasync = 'false';
  script.dataset.monetagPush = 'true';
  document.head.appendChild(script);
}

/** Vignette Banner — load once globally. */
export function loadMonetagVignetteTag() {
  if (document.querySelector(`script[src="${ADS.vignetteScriptSrc}"][data-zone="${ADS.vignetteZone}"]`)) {
    return;
  }
  injectMonetagZoneScript(ADS.vignetteZone, ADS.vignetteScriptSrc);
}

/** In-Page Push — load once globally (install check reads static HTML). */
export function loadMonetagInPagePushTag() {
  if (document.querySelector(`script[src="${ADS.inPagePushScriptSrc}"][data-zone="${ADS.inPagePushZone}"]`)) {
    return;
  }
  injectMonetagZoneScript(ADS.inPagePushZone, ADS.inPagePushScriptSrc);
}

/** Re-inject In-Page Push (e.g. on reader chapter change). */
export function reloadMonetagInPagePushTag() {
  injectMonetagZoneScript(ADS.inPagePushZone, ADS.inPagePushScriptSrc);
}
