import { useCallback, useState } from 'react';
import { RefreshControl } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useBranding } from '../context/BrandingContext';
import colors from '../theme/colors';

/**
 * Pull-to-refresh: refetch current screen data + branding (and related caches).
 * Branding stays ready during refresh so the app shell does not blank.
 */
export function usePullToRefresh(
  pageRefetch,
  { isFetching, isLoading, includeBranding = true } = {}
) {
  const queryClient = useQueryClient();
  const { refetchBranding } = useBranding();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const tasks = [];

      if (includeBranding && typeof refetchBranding === 'function') {
        tasks.push(refetchBranding());
      }

      if (typeof pageRefetch === 'function') {
        tasks.push(pageRefetch());
      }

      // Refresh other active lists so Home/Browse/etc. pick up admin changes.
      tasks.push(
        queryClient.invalidateQueries({
          predicate: (query) => {
            const key = query.queryKey?.[0];
            return (
              key === 'dashboard' ||
              key === 'series' ||
              key === 'reading' ||
              key === 'favorites' ||
              key === 'favorite' ||
              key === 'rankings' ||
              key === 'categories' ||
              key === 'manga' ||
              key === 'manga-types' ||
              key === 'authors' ||
              key === 'rating' ||
              key === 'user-ratings' ||
              key === 'chapter'
            );
          },
        })
      );

      await Promise.all(tasks);
    } finally {
      setIsRefreshing(false);
    }
  }, [includeBranding, pageRefetch, queryClient, refetchBranding]);

  const refreshing = isRefreshing || Boolean(isFetching && !isLoading);

  return { refreshing, onRefresh };
}

export function useRefreshControl(pageRefetch, queryState) {
  const { refreshing, onRefresh } = usePullToRefresh(pageRefetch, queryState);

  return (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={[colors.redOrange]}
      tintColor={colors.redOrange}
    />
  );
}
