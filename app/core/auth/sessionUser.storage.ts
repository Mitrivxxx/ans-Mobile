import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  getSavedCredentials,
  isRememberMeEnabled,
} from './rememberMe.storage';

const LAST_USERNAME_KEY = '@wdmobile/lastUsername';

export async function saveLastUsername(username: string): Promise<void> {
  const trimmed = username.trim();
  if (!trimmed) {
    return;
  }
  await AsyncStorage.setItem(LAST_USERNAME_KEY, trimmed);
}

export async function getLastUsername(): Promise<string | null> {
  const value = await AsyncStorage.getItem(LAST_USERNAME_KEY);
  return value?.trim() || null;
}

export async function clearLastUsername(): Promise<void> {
  await AsyncStorage.removeItem(LAST_USERNAME_KEY);
}

/** Czy użytkownik kiedykolwiek zalogował się w tej instalacji aplikacji. */
export async function hasAppLoginRecord(): Promise<boolean> {
  if (await getLastUsername()) {
    return true;
  }

  if (await isRememberMeEnabled()) {
    return (await getSavedCredentials()) !== null;
  }

  return false;
}
