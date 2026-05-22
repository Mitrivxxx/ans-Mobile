import NetInfo from '@react-native-community/netinfo';

import { isNetworkOnline } from '../network/networkStatus';
import { hasAppLoginRecord } from './sessionUser.storage';

/** Czy urządzenie jest offline (brak sieci do odświeżenia sesji WD). */
export async function isDeviceOffline(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return !isNetworkOnline(state);
}

/**
 * Tryb offline (authenticated + sessionDegraded) jest dozwolony tylko przy
 * włączonym „Zapamiętaj mnie”. Bez tej opcji po restarcie aplikacji użytkownik
 * jest traktowany jako wylogowany.
 */
export function allowsOfflineDegradedMode(rememberMe: boolean): boolean {
  return rememberMe;
}

/** Czy można wejść w sesję offline (użytkownik wcześniej logował się z remember me). */
export async function canEnterOfflineDegradedSession(
  rememberMe: boolean
): Promise<boolean> {
  if (!allowsOfflineDegradedMode(rememberMe)) {
    return false;
  }
  return hasAppLoginRecord();
}
