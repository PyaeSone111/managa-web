/** Flat continuous pager item (multiple chapters stitch into one array). */
export type MangaPage = {
  id: string;
  imageUrl: string;
  chapterId: string;
  pageNumber: number;
};

export type MangaReadPosition = {
  pageIndex: number;
  chapterId: string;
  pageId?: string;
};

export const MMKV_KEYS = {
  lastReadPage: 'last_read_page',
  currentChapterId: 'current_chapter_id',
  lastReadPageId: 'last_read_page_id',
} as const;
