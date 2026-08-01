import type { MangaPage } from './mangaReader.types';

export type ChapterBounds = {
  chapterId: string;
  startIndex: number;
  endIndex: number;
  pageCount: number;
};

/** Inclusive flat-index range for a chapter inside the continuous page array. */
export function getChapterBounds(
  pages: MangaPage[],
  chapterId: string
): ChapterBounds | null {
  let startIndex = -1;
  let endIndex = -1;
  for (let i = 0; i < pages.length; i += 1) {
    if (pages[i].chapterId !== chapterId) continue;
    if (startIndex < 0) startIndex = i;
    endIndex = i;
  }
  if (startIndex < 0 || endIndex < 0) return null;
  return {
    chapterId,
    startIndex,
    endIndex,
    pageCount: endIndex - startIndex + 1,
  };
}

/**
 * True when the reader is on page ≥ N-2 of the *current* chapter
 * (1-based page numbers), so Chapter N+1 can prefetch in the background.
 *
 * Example: chapter length N=10 → trigger from page 8 onward
 * (flat indices endIndex-2 … endIndex).
 */
export function shouldPrefetchNextChapter(
  pages: MangaPage[],
  flatIndex: number,
  pagesFromEnd = 2
): boolean {
  const page = pages[flatIndex];
  if (!page) return false;

  const bounds = getChapterBounds(pages, page.chapterId);
  if (!bounds) return false;

  const { endIndex, pageCount } = bounds;
  if (pageCount <= 0) return false;

  // Prefer pageNumber when present; fall back to flat distance from chapter end.
  if (typeof page.pageNumber === 'number' && page.pageNumber > 0) {
    return page.pageNumber >= pageCount - pagesFromEnd;
  }

  return flatIndex >= endIndex - pagesFromEnd + 1;
}
