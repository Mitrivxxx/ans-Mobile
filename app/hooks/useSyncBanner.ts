import { useCallback, useEffect, useRef, useState } from 'react';

import type { SyncStatus } from '../core/queryClient/syncTypes';
import { useNetworkStatus } from './useNetworkStatus';

export function useSyncBanner(syncStatus: SyncStatus) {
  const [bannerStatus, setBannerStatus] = useState(syncStatus);
  const { isOnline } = useNetworkStatus();
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    setBannerStatus(syncStatus);
  }, [syncStatus]);

  useEffect(() => {
    if (isOnline === false) {
      wasOfflineRef.current = true;
      return;
    }
    if (isOnline === true && wasOfflineRef.current) {
      wasOfflineRef.current = false;
      if (bannerStatus === 'error') {
        setBannerStatus('idle');
      }
    }
  }, [isOnline, bannerStatus]);

  const dismissUpToDate = useCallback(() => {
    setBannerStatus('idle');
  }, []);

  return { bannerStatus, dismissUpToDate };
}
