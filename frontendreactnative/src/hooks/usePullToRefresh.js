import { useCallback, useState } from 'react';
import { RefreshControl } from 'react-native';
import { useBranding } from '../context/BrandingContext';
import colors from '../theme/colors';

export function usePullToRefresh(pageRefetch, { isFetching, isLoading } = {}) {
  const { refetchBranding } = useBranding();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetchBranding();
      if (typeof pageRefetch === 'function') {
        await pageRefetch();
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [pageRefetch, refetchBranding]);

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
