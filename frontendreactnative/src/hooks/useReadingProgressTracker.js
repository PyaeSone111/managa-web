import { useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { readingProgressApi } from '../services/api';

/**
 * Throttled writer for logged-in reading progress (series + chapter + page).
 */
export function useReadingProgressTracker({
  enabled,
  seriesId,
  chapterId,
  pageCount,
}) {
  const queryClient = useQueryClient();
  const lastSavedPage = useRef(null);
  const timerRef = useRef(null);
  const pendingPage = useRef(null);

  const flush = useCallback(async () => {
    const page = pendingPage.current;
    if (!enabled || !seriesId || !chapterId || !page) return;
    if (lastSavedPage.current === page) return;

    try {
      const completed = pageCount > 0 && page >= pageCount;
      await readingProgressApi.update({
        series_id: seriesId,
        chapter_id: chapterId,
        last_page: page,
        completed,
      });
      lastSavedPage.current = page;
      queryClient.invalidateQueries({ queryKey: ['reading'] });
    } catch {
      // Keep reading even if progress sync fails.
    }
  }, [chapterId, enabled, pageCount, queryClient, seriesId]);

  const reportPage = useCallback(
    (pageNumber) => {
      if (!enabled || !seriesId || !chapterId || !pageNumber) return;
      pendingPage.current = Math.max(1, Math.floor(pageNumber));

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        flush();
      }, 1200);
    },
    [chapterId, enabled, flush, seriesId]
  );

  useEffect(() => {
    lastSavedPage.current = null;
    pendingPage.current = null;
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      flush();
    };
  }, [chapterId, flush]);

  return { reportPage, flush };
}
