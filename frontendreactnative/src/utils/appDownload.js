import { APP_DOWNLOAD_PAGE_URL } from './constants';

/** Always the website download page — never a direct .apk or file-host link. */
export function getAppDownloadPageUrl() {
  return APP_DOWNLOAD_PAGE_URL;
}
