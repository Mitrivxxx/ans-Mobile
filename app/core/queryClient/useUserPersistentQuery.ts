import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, type QueryKey } from '@tanstack/react-query';

import { useNetworkReconnectEffect } from '../../hooks/useNetworkReconnect';
import { cacheUntilReplaceQueryOptions } from './cacheUntilReplace';
import { runWithManualRefreshCooldown } from './manualRefreshCooldown';
import { usePersistentCacheSyncEffects } from './usePersistentCacheSyncEffects';
import { useQueryUserKey } from './useQueryUserKey';
import { useScrapeEnabled } from './useScrapeEnabled';
import type { SyncStatus } from './syncTypes';

type UserPersistentQueryConfig<TData> = {
  queryKey: (userKey: string) => QueryKey;
  queryFn: () => Promise<TData>;
  enabled?: boolean;
  syncOnMount?: boolean;
  refetchInterval?: number | false;
};

export function useUserPersistentQuery<TData>({
  queryKey,
  queryFn,
  enabled = true,
  syncOnMount = false,
  refetchInterval = false,
}: UserPersistentQueryConfig<TData>) {
  const userKey = useQueryUserKey();
  const scrapeEnabled = useScrapeEnabled();
  const queryEnabled = enabled && scrapeEnabled;
  const resolvedQueryKey = useMemo(
    () => queryKey(userKey),
    [queryKey, userKey]
  );
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const syncStatusRef = useRef(syncStatus);
  syncStatusRef.current = syncStatus;

  const query = useQuery<TData>({
    queryKey: resolvedQueryKey,
    queryFn,
    enabled: queryEnabled,
    refetchInterval: refetchInterval === false ? false : refetchInterval,
    ...cacheUntilReplaceQueryOptions<TData>(),
  });

  const { refetch, data, dataUpdatedAt } = query;
  const hasCachedData = data !== undefined;

  const hasCachedDataRef = useRef(hasCachedData);
  hasCachedDataRef.current = hasCachedData;

  const runSync = useCallback(
    async (options?: { minLoadingMs?: number; manual?: boolean }) => {
      if (!queryEnabled) {
        return;
      }

      const manual = options?.manual ?? Boolean(options?.minLoadingMs);
      const showBlockingLoading = manual || !hasCachedDataRef.current;

      if (showBlockingLoading) {
        setSyncStatus('loading');
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => resolve());
        });
      } else {
        setSyncStatus('loading');
      }

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
    [queryEnabled, refetch]
  );

  const syncInBackground = useCallback(
    () => runSync({ manual: false }),
    [runSync]
  );

  /** Ręczny pull-to-refresh — baner „Aktualizowanie…” i „Jesteś na bieżąco”. */
  const forceRefresh = useCallback(
    () =>
      runWithManualRefreshCooldown(() =>
        runSync({ minLoadingMs: 400, manual: true })
      ),
    [runSync]
  );

  usePersistentCacheSyncEffects({
    enabled: queryEnabled,
    hasCachedData,
    dataUpdatedAt,
    syncOnMount,
    syncInBackground,
    setSyncStatus,
  });

  useNetworkReconnectEffect(() => {
    if (!queryEnabled || !hasCachedData) {
      return;
    }
    if (syncStatusRef.current === 'error') {
      void syncInBackground();
    }
  });

  return {
    data: query.data,
    syncStatus,
    isInitialLoading:
      !hasCachedData && (query.isPending || query.isLoading),
    hasCachedData,
    refresh: syncInBackground,
    forceRefresh,
    refetch,
    isFatalError: query.isError && !hasCachedData,
  };
}
