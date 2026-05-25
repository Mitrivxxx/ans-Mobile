import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useQuery, type QueryKey } from '@tanstack/react-query';

import { useNetworkReconnectEffect } from '../../hooks/useNetworkReconnect';
import { cacheUntilReplaceQueryOptions } from './cacheUntilReplace';
import { runWithManualRefreshCooldown } from './manualRefreshCooldown';
import { useQueryUserKey } from './useQueryUserKey';
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
    enabled,
    refetchInterval: refetchInterval === false ? false : refetchInterval,
    ...cacheUntilReplaceQueryOptions<TData>(),
  });

  const { refetch, data } = query;
  const hasCachedData = data !== undefined;

  const runSync = useCallback(
    async (options?: { minLoadingMs?: number }) => {
      if (!enabled) {
        return;
      }

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
    [enabled, refetch]
  );

  const syncInBackground = useCallback(() => runSync(), [runSync]);

  /** Ręczny pull-to-refresh — baner „Aktualizowanie…” i „Jesteś na bieżąco”. */
  const forceRefresh = useCallback(
    () =>
      runWithManualRefreshCooldown(() => runSync({ minLoadingMs: 400 })),
    [runSync]
  );

  const syncIfNoCache = useCallback(async () => {
    if (!enabled) {
      return;
    }
    const isPlanWeek =
      Array.isArray(resolvedQueryKey) && resolvedQueryKey[2] === 'weekLessons';
    if (isPlanWeek) {
      // #region agent log
      fetch('http://127.0.0.1:7884/ingest/daefe8e1-1e84-486a-b8a4-fabf03b42721',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'68a4b3'},body:JSON.stringify({sessionId:'68a4b3',location:'useUserPersistentQuery.ts:syncIfNoCache',message:'syncIfNoCache',data:{weekMondayKey:resolvedQueryKey[3],hasCachedData,syncOnMount,willFetch:!hasCachedData},timestamp:Date.now(),hypothesisId:'A,D'})}).catch(()=>{});
      // #endregion
    }
    if (hasCachedData) {
      setSyncStatus('upToDate');
      return;
    }
    await syncInBackground();
  }, [enabled, hasCachedData, syncInBackground, resolvedQueryKey, syncOnMount]);

  useFocusEffect(
    useCallback(() => {
      void syncIfNoCache();
    }, [syncIfNoCache])
  );

  useNetworkReconnectEffect(() => {
    if (!enabled || !hasCachedData) {
      return;
    }
    if (syncStatusRef.current === 'error') {
      void syncInBackground();
    }
  });

  useEffect(() => {
    if (!syncOnMount || !enabled) {
      return;
    }
    void syncIfNoCache();
  }, [enabled, syncIfNoCache, syncOnMount]);

  return {
    data: query.data,
    syncStatus,
    isInitialLoading: query.isPending && !hasCachedData,
    hasCachedData,
    refresh: syncInBackground,
    forceRefresh,
    refetch,
    isFatalError: query.isError && !hasCachedData,
  };
}
