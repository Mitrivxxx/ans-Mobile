import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';

import { isNetworkOnline } from './networkStatus';

type NetworkListener = (online: boolean, state: NetInfoState) => void;

let lastOnline: boolean | null = null;
let started = false;
const listeners = new Set<NetworkListener>();
const reconnectListeners = new Set<() => void>();

function emit(state: NetInfoState) {
  const online = isNetworkOnline(state);
  const wasOffline = lastOnline === false;
  lastOnline = online;

  for (const listener of listeners) {
    listener(online, state);
  }

  if (wasOffline && online) {
    for (const handler of reconnectListeners) {
      handler();
    }
  }
}

function ensureStarted() {
  if (started) {
    return;
  }
  started = true;

  void NetInfo.fetch().then(emit);
  NetInfo.addEventListener(emit);
}

/** Subskrybuje zmiany online/offline (wspólny listener NetInfo). */
export function subscribeNetworkStatus(listener: NetworkListener): () => void {
  ensureStarted();
  listeners.add(listener);

  if (lastOnline !== null) {
    void NetInfo.fetch().then((state) => {
      listener(isNetworkOnline(state), state);
    });
  }

  return () => {
    listeners.delete(listener);
  };
}

/** Wywoływane przy przejściu offline → online. */
export function onNetworkReconnect(handler: () => void): () => void {
  ensureStarted();
  reconnectListeners.add(handler);
  return () => {
    reconnectListeners.delete(handler);
  };
}
