import type { MangaPage } from './mangaReader.types';

export type LoadNextChapterResult = {
  chapterId: string;
  pages: MangaPage[];
};

type LoadNextChapterArgs = {
  currentChapterId: string;
  /** Already-loaded chapter ids — skip duplicates. */
  loadedChapterIds: string[];
};

/**
 * Mock next-chapter fetch. Replace with your API (e.g. chapterApi.getBySeriesAndNumber).
 * Returns null when there is no further chapter.
 */
export async function loadNextChapter(
  args: LoadNextChapterArgs
): Promise<LoadNextChapterResult | null> {
  const { currentChapterId, loadedChapterIds } = args;
  const currentNum = Number(String(currentChapterId).replace(/\D/g, '')) || 0;
  const nextId = `chapter-${currentNum + 1}`;

  if (loadedChapterIds.includes(nextId)) {
    return null;
  }

  // Simulate network latency
  await new Promise((r) => setTimeout(r, 350));

  // Cap mock series so demos don't grow forever
  if (currentNum >= 5) {
    return null;
  }

  const pageCount = 8;
  const pages: MangaPage[] = Array.from({ length: pageCount }, (_, i) => {
    const pageNumber = i + 1;
    return {
      id: `${nextId}-p${pageNumber}`,
      imageUrl: `https://picsum.photos/seed/${nextId}-${pageNumber}/800/1200`,
      chapterId: nextId,
      pageNumber,
    };
  });

  return { chapterId: nextId, pages };
}

/** Seed pages for first open / Storybook-style preview. */
export function createMockChapterPages(
  chapterId: string,
  pageCount = 10
): MangaPage[] {
  return Array.from({ length: pageCount }, (_, i) => {
    const pageNumber = i + 1;
    return {
      id: `${chapterId}-p${pageNumber}`,
      imageUrl: `https://picsum.photos/seed/${chapterId}-${pageNumber}/800/1200`,
      chapterId,
      pageNumber,
    };
  });
}
