import { storage } from '../storage/mmkv';
import {
  MMKV_KEYS,
  type MangaPage,
  type MangaReadPosition,
} from './mangaReader.types';

/** Sync read of last position — safe during first render (MMKV is sync). */
export function readSavedPosition(): MangaReadPosition {
  const pageIndex = storage.getNumber(MMKV_KEYS.lastReadPage) ?? 0;
  const chapterId = storage.getString(MMKV_KEYS.currentChapterId) ?? '';
  const pageId = storage.getString(MMKV_KEYS.lastReadPageId) ?? undefined;
  return {
    pageIndex: Math.max(0, Math.floor(pageIndex)),
    chapterId,
    pageId,
  };
}

/** Prefer page id, then clamp saved flat index into the current page list. */
export function resolveInitialPageIndex(
  pages: MangaPage[],
  saved: MangaReadPosition
): number {
  if (!pages.length) return 0;

  if (saved.pageId) {
    const byId = pages.findIndex((p) => p.id === saved.pageId);
    if (byId >= 0) return byId;
  }

  if (saved.chapterId) {
    const inChapter = pages.findIndex((p) => p.chapterId === saved.chapterId);
    if (inChapter >= 0) {
      // If last_read_page was stored as flat index while this chapter is first
      // in the list, prefer flat clamp; otherwise open chapter start.
      const clamped = Math.min(saved.pageIndex, pages.length - 1);
      if (pages[clamped]?.chapterId === saved.chapterId) return clamped;
      return inChapter;
    }
  }

  return Math.min(saved.pageIndex, pages.length - 1);
}

export function persistReadPosition(position: MangaReadPosition): void {
  storage.set(MMKV_KEYS.lastReadPage, position.pageIndex);
  storage.set(MMKV_KEYS.currentChapterId, position.chapterId);
  if (position.pageId) {
    storage.set(MMKV_KEYS.lastReadPageId, position.pageId);
  }
}
