import { useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { useDataRefreshInterval } from '../../context/DataRefreshIntervalContext';
import {
  PERSISTENT_DATA_AUTO_SYNC_CHECK_MS,
  shouldSyncPersistentCache,
} from './persistentAutoSync';
import type { SyncStatus } from './syncTypes';

function scheduleBackgroundSync(task: () => void, hasCachedData: boolean): void {
  if (!hasCachedData) {
    task();
    return;
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(task);
  });
}

type Options = {
  enabled: boolean;
  hasCachedData: boolean;
  dataUpdatedAt: number;
  syncOnMount?: boolean;
  syncInBackground: () => Promise<void>;
  setSyncStatus: (status: SyncStatus) => void;
};

/** Focus, mount i interwał 12h — wspólne dla cache bez persystencji (np. opłaty). */
export function usePersistentCacheSyncEffects({
  enabled,
  hasCachedData,
  dataUpdatedAt,
  syncOnMount = false,
  syncInBackground,
  setSyncStatus,
}: Options): void {
  const { intervalMs } = useDataRefreshInterval();

  const syncIfNeeded = useCallback(async () => {
    if (!enabled) {
      return;
    }
    if (!shouldSyncPersistentCache(hasCachedData, dataUpdatedAt, intervalMs)) {
      setSyncStatus('upToDate');
      return;
    }
    await syncInBackground();
  }, [
    enabled,
    hasCachedData,
    dataUpdatedAt,
    intervalMs,
    syncInBackground,
    setSyncStatus,
  ]);

  useFocusEffect(
    useCallback(() => {
      scheduleBackgroundSync(() => {
        void syncIfNeeded();
      }, hasCachedData);
    }, [hasCachedData, syncIfNeeded])
  );

  useEffect(() => {
    if (!syncOnMount || !enabled) {
      return;
    }
    scheduleBackgroundSync(() => {
      void syncIfNeeded();
    }, hasCachedData);
  }, [enabled, hasCachedData, syncIfNeeded, syncOnMount]);

  useEffect(() => {
    if (!enabled || !hasCachedData) {
      return;
    }

    const tick = () => {
      if (shouldSyncPersistentCache(true, dataUpdatedAt, intervalMs)) {
        scheduleBackgroundSync(() => {
          void syncInBackground();
        }, true);
      }
    };

    const id = setInterval(tick, PERSISTENT_DATA_AUTO_SYNC_CHECK_MS);
    return () => clearInterval(id);
  }, [enabled, hasCachedData, dataUpdatedAt, intervalMs, syncInBackground]);
}
