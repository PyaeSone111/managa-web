const DOWNLOAD_PAGE_PATTERN = /\/download\/?(\?|#|$)/i;

/** Direct APK / file-host URL from branding — not the website /download page. */
export function getApkDownloadUrl(appDownload) {
  const url = appDownload?.url?.trim();
  if (!url) return null;
  if (DOWNLOAD_PAGE_PATTERN.test(url)) return null;
  return url;
}
