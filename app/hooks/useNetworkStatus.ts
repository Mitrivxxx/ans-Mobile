import { useEffect, useState } from 'react';

import { subscribeNetworkStatus } from '../core/network/networkSubscription';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  useEffect(() => subscribeNetworkStatus(setIsOnline), []);

  return {
    isConnected: isOnline,
    isOnline: isOnline === true,
    isOffline: isOnline === false,
  };
}
