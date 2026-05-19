import { useCallback, useEffect, useState } from 'react';

import type { SyncStatus } from '../core/queryClient/syncTypes';

export function useSyncBanner(syncStatus: SyncStatus) {
  const [bannerStatus, setBannerStatus] = useState(syncStatus);

  useEffect(() => {
    setBannerStatus(syncStatus);
  }, [syncStatus]);

  const dismissUpToDate = useCallback(() => {
    setBannerStatus('idle');
  }, []);

  return { bannerStatus, dismissUpToDate };
}
