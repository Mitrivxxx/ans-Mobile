import { useEffect, useRef } from 'react';

import { onNetworkReconnect } from '../core/network/networkSubscription';

/** Uruchamia efekt po powrocie z offline do online. */
export function useNetworkReconnectEffect(effect: () => void) {
  const effectRef = useRef(effect);
  effectRef.current = effect;

  useEffect(() => onNetworkReconnect(() => effectRef.current()), []);
}
