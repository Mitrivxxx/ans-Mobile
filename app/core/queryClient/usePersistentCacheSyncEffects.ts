import { useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import {
  PERSISTENT_DATA_AUTO_SYNC_CHECK_MS,
  shouldSyncPersistentCache,
} from './persistentAutoSync';
import type { SyncStatus } from './syncTypes';

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
  const syncIfNeeded = useCallback(async () => {
    if (!enabled) {
      return;
    }
    if (!shouldSyncPersistentCache(hasCachedData, dataUpdatedAt)) {
      setSyncStatus('upToDate');
      return;
    }
    await syncInBackground();
  }, [enabled, hasCachedData, dataUpdatedAt, syncInBackground, setSyncStatus]);

  useFocusEffect(
    useCallback(() => {
      void syncIfNeeded();
    }, [syncIfNeeded])
  );

  useEffect(() => {
    if (!syncOnMount || !enabled) {
      return;
    }
    void syncIfNeeded();
  }, [enabled, syncIfNeeded, syncOnMount]);

  useEffect(() => {
    if (!enabled || !hasCachedData) {
      return;
    }

    const tick = () => {
      if (shouldSyncPersistentCache(true, dataUpdatedAt)) {
        void syncInBackground();
      }
    };

    const id = setInterval(tick, PERSISTENT_DATA_AUTO_SYNC_CHECK_MS);
    return () => clearInterval(id);
  }, [enabled, hasCachedData, dataUpdatedAt, syncInBackground]);
}
