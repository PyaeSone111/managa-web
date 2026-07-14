import { useCallback, useState } from 'react';
import { RefreshControl } from 'react-native';
import colors from '../theme/colors';

/**
 * Pull-to-refresh for the current screen only.
 * Does not refetch global branding (that remounts the app shell).
 */
export function usePullToRefresh(pageRefetch, { isFetching, isLoading } = {}) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    if (typeof pageRefetch !== 'function') return;
    setIsRefreshing(true);
    try {
      await pageRefetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [pageRefetch]);

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
