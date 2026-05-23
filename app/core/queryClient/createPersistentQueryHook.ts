import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useQuery, type QueryKey } from '@tanstack/react-query';

import { useNetworkReconnectEffect } from '../../hooks/useNetworkReconnect';
import { cacheUntilReplaceQueryOptions } from './cacheUntilReplace';
import type { SyncStatus } from './syncTypes';

type PersistentQueryConfig<TData> = {
  queryKey: QueryKey;
  queryFn: () => Promise<TData>;
};

export function createPersistentQueryHook<TData>({
  queryKey,
  queryFn,
}: PersistentQueryConfig<TData>) {
  return function usePersistentQuery() {
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
    const syncStatusRef = useRef(syncStatus);
    syncStatusRef.current = syncStatus;

    const query = useQuery<TData>({
      queryKey,
      queryFn,
      ...cacheUntilReplaceQueryOptions<TData>(),
    });

    const { refetch } = query;
    const hasCachedData = query.data !== undefined;

    const runSync = useCallback(
      async (options?: { minLoadingMs?: number }) => {
        setSyncStatus('loading');
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => resolve());
        });

        const startedAt = Date.now();
        try {
          const result = await refetch();
          const minLoadingMs = options?.minLoadingMs ?? 0;
          const elapsed = Date.now() - startedAt;
          if (elapsed < minLoadingMs) {
            await new Promise((resolve) => setTimeout(resolve, minLoadingMs - elapsed));
          }
          if (result.isError) {
            setSyncStatus('error');
            return;
          }
          setSyncStatus('upToDate');
        } catch {
          setSyncStatus('error');
        }
      },
      [refetch]
    );

    const syncInBackground = useCallback(
      () => runSync(),
      [runSync]
    );

    const forceRefresh = useCallback(
      () => runSync({ minLoadingMs: 400 }),
      [runSync]
    );

    const syncIfNoCache = useCallback(() => {
      if (hasCachedData) {
        setSyncStatus('upToDate');
        return;
      }
      void syncInBackground();
    }, [hasCachedData, syncInBackground]);

    useFocusEffect(
      useCallback(() => {
        syncIfNoCache();
      }, [syncIfNoCache])
    );

    useNetworkReconnectEffect(() => {
      if (!hasCachedData) {
        return;
      }
      if (syncStatusRef.current === 'error') {
        void syncInBackground();
      }
    });

    return {
      data: query.data,
      syncStatus,
      isInitialLoading: query.isPending && !hasCachedData,
      hasCachedData,
      refresh: syncInBackground,
      refetch,
      syncInBackground,
      forceRefresh,
      isFatalError: query.isError && !hasCachedData,
    };
  };
}
