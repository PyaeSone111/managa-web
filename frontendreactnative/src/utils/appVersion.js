import { EXPO_PUBLIC_SKIP_FORCE_UPDATE } from '@env';
import { LOCAL_APP_VERSION } from '../config/localAppVersion';

/** Installed version on this device (local build). Compared against branding API app_version. */
export const APP_VERSION = LOCAL_APP_VERSION;

function parseVersion(value) {
  return String(value || '0')
    .trim()
    .replace(/^v/i, '')
    .split(/[.-]/)
    .map((part) => {
      const num = parseInt(part, 10);
      return Number.isFinite(num) ? num : 0;
    });
}

export function compareVersions(left, right) {
  const a = parseVersion(left);
  const b = parseVersion(right);
  const len = Math.max(a.length, b.length);

  for (let i = 0; i < len; i += 1) {
    const diff = (a[i] ?? 0) - (b[i] ?? 0);
    if (diff !== 0) return diff;
  }

  return 0;
}

export function isUpdateRequired(installedVersion, latestVersion) {
  if (EXPO_PUBLIC_SKIP_FORCE_UPDATE === 'true') return false;
  if (!latestVersion) return false;
  return compareVersions(installedVersion, latestVersion) < 0;
}
