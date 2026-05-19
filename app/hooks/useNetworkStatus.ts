import { useEffect, useState } from 'react';
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    const applyState = (state: NetInfoState) => {
      if (cancelled) {
        return;
      }
      setIsConnected(state.isConnected ?? state.isInternetReachable ?? null);
    };

    void NetInfo.fetch().then(applyState);

    const unsubscribe = NetInfo.addEventListener(applyState);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return {
    isConnected,
    isOffline: isConnected === false,
  };
}
