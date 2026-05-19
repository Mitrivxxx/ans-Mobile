import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const REMEMBER_ME_ENABLED_KEY = '@wdmobile/rememberMeEnabled';
const CREDENTIALS_KEY = 'wdmobile.rememberMe.credentials';

export type SavedCredentials = {
  username: string;
  password: string;
};

export async function isRememberMeEnabled(): Promise<boolean> {
  const value = await AsyncStorage.getItem(REMEMBER_ME_ENABLED_KEY);
  return value === 'true';
}

export async function getSavedCredentials(): Promise<SavedCredentials | null> {
  const raw = await SecureStore.getItemAsync(CREDENTIALS_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as SavedCredentials;
    if (
      typeof parsed.username === 'string' &&
      typeof parsed.password === 'string' &&
      parsed.username.trim() &&
      parsed.password
    ) {
      return {
        username: parsed.username.trim(),
        password: parsed.password,
      };
    }
  } catch {
    /* ignore corrupt payload */
  }

  return null;
}

export async function saveRememberMeCredentials(
  username: string,
  password: string
): Promise<void> {
  await AsyncStorage.setItem(REMEMBER_ME_ENABLED_KEY, 'true');
  await SecureStore.setItemAsync(
    CREDENTIALS_KEY,
    JSON.stringify({ username: username.trim(), password })
  );
}

export async function clearRememberMe(): Promise<void> {
  await AsyncStorage.removeItem(REMEMBER_ME_ENABLED_KEY);
  try {
    await SecureStore.deleteItemAsync(CREDENTIALS_KEY);
  } catch {
    /* item may not exist */
  }
}
