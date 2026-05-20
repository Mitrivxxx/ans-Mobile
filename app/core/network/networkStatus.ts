import type { NetInfoState } from '@react-native-community/netinfo';
import type { AxiosError } from 'axios';

/** Czy urządzenie ma aktywne połączenie sieciowe (Wi‑Fi / komórkowe). */
export function isNetworkOnline(state: NetInfoState): boolean {
  if (state.isConnected === false) {
    return false;
  }
  if (state.isInternetReachable === false) {
    return false;
  }
  return state.isConnected === true || state.isInternetReachable === true;
}

export function isNetworkError(error: unknown): boolean {
  const axiosErr = error as AxiosError | undefined;
  const code = axiosErr?.code ?? '';
  const message = (
    axiosErr?.message ?? (error instanceof Error ? error.message : String(error ?? ''))
  ).toLowerCase();

  if (
    code === 'ERR_NETWORK' ||
    code === 'ECONNABORTED' ||
    code === 'ETIMEDOUT' ||
    message === 'network error' ||
    message.includes('network request failed') ||
    message.includes('failed to connect') ||
    message.includes('unable to resolve host') ||
    message.includes('network is unreachable')
  ) {
    return true;
  }

  return !axiosErr?.response && Boolean(axiosErr?.request);
}
