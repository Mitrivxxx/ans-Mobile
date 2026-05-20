import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useQuery, type QueryKey } from '@tanstack/react-query';

import { useNetworkReconnectEffect } from '../../hooks/useNetworkReconnect';
import { isDataEqual } from './isDataEqual';
import { BACKGROUND_SYNC_INTERVAL_MS } from './persistentQueryConstants';
import type { SyncStatus } from './syncTypes';

type PersistentQueryConfig<TData> = {
  queryKey: QueryKey;
  queryFn: () => Promise<TData>;
  equals?: (a: TData, b: TData) => boolean;
  backgroundSyncIntervalMs?: number;
};

function shouldRunBackgroundSync(
  hasCachedData: boolean,
  dataUpdatedAt: number,
  intervalMs: number
): boolean {
  if (!hasCachedData) {
    return true;
  }
  if (dataUpdatedAt === 0) {
    return true;
  }
  return Date.now() - dataUpdatedAt >= intervalMs;
}

export function createPersistentQueryHook<TData>({
  queryKey,
  queryFn,
  equals = isDataEqual,
  backgroundSyncIntervalMs = BACKGROUND_SYNC_INTERVAL_MS,
}: PersistentQueryConfig<TData>) {
  return function usePersistentQuery() {
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
    const syncStatusRef = useRef(syncStatus);
    syncStatusRef.current = syncStatus;

    const query = useQuery<TData>({
      queryKey,
      queryFn,
      staleTime: Number.POSITIVE_INFINITY,
      gcTime: Number.POSITIVE_INFINITY,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      structuralSharing: (previousData, newData) => {
        const prev = previousData as TData | undefined;
        const next = newData as TData | undefined;
        if (prev === undefined) {
          return next;
        }
        if (next === undefined) {
          return prev;
        }
        return equals(prev, next) ? prev : next;
      },
    });

    const { refetch, dataUpdatedAt } = query;
    const hasCachedData = query.data !== undefined;

    const runSync = useCallback(
      async (options?: { minLoadingMs?: number }) => {
        setSyncStatus('loading');
        // Pozwól Reactowi wyrenderować baner „Aktualizowanie…” przed fetch.
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

    /** Ręczny pull-to-refresh — zawsze pokazuje baner ładowania i „Jesteś na bieżąco”. */
    const forceRefresh = useCallback(
      () => runSync({ minLoadingMs: 400 }),
      [runSync]
    );

    const maybeSyncInBackground = useCallback(() => {
      if (
        !shouldRunBackgroundSync(
          hasCachedData,
          dataUpdatedAt,
          backgroundSyncIntervalMs
        )
      ) {
        return;
      }
      void syncInBackground();
    }, [
      backgroundSyncIntervalMs,
      dataUpdatedAt,
      hasCachedData,
      syncInBackground,
    ]);

    useFocusEffect(
      useCallback(() => {
        maybeSyncInBackground();
      }, [maybeSyncInBackground])
    );

    useNetworkReconnectEffect(() => {
      if (!hasCachedData) {
        return;
      }
      if (syncStatusRef.current === 'error' || syncStatusRef.current === 'idle') {
        void syncInBackground();
      }
    });

    return {
      data: query.data,
      syncStatus,
      isInitialLoading: query.isPending && !hasCachedData,
      hasCachedData,
      /** Wymusza scrape i aktualizuje syncStatus (PTR, przycisk odśwież). */
      refresh: syncInBackground,
      refetch,
      syncInBackground,
      forceRefresh,
      isFatalError: query.isError && !hasCachedData,
    };
  };
}
