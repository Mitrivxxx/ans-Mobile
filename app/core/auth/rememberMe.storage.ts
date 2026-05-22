import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import secureStorage from './SecureStorageService';

const REMEMBER_ME_ENABLED_KEY = '@wdmobile/rememberMeEnabled';
/** Migracja z expo-secure-store (JSON) przed react-native-keychain. */
const LEGACY_CREDENTIALS_KEY = 'wdmobile.rememberMe.credentials';

export type SavedCredentials = {
  username: string;
  password: string;
};

let legacyMigrationDone = false;

async function migrateLegacyCredentialsOnce(): Promise<void> {
  if (legacyMigrationDone) {
    return;
  }
  legacyMigrationDone = true;

  const raw = await SecureStore.getItemAsync(LEGACY_CREDENTIALS_KEY);
  if (!raw) {
    return;
  }

  try {
    const parsed = JSON.parse(raw) as SavedCredentials;
    if (
      typeof parsed.username === 'string' &&
      typeof parsed.password === 'string' &&
      parsed.username.trim() &&
      parsed.password
    ) {
      await secureStorage.saveCredentials(
        parsed.username.trim(),
        parsed.password
      );
    }
  } catch {
    /* ignore corrupt payload */
  }

  try {
    await SecureStore.deleteItemAsync(LEGACY_CREDENTIALS_KEY);
  } catch {
    /* item may not exist */
  }
}

export async function isRememberMeEnabled(): Promise<boolean> {
  const value = await AsyncStorage.getItem(REMEMBER_ME_ENABLED_KEY);
  return value === 'true';
}

export async function getSavedCredentials(): Promise<SavedCredentials | null> {
  await migrateLegacyCredentialsOnce();

  const enabled = await isRememberMeEnabled();
  if (!enabled) {
    return null;
  }

  return secureStorage.getCredentials();
}

export async function saveRememberMeCredentials(
  username: string,
  password: string
): Promise<void> {
  await AsyncStorage.setItem(REMEMBER_ME_ENABLED_KEY, 'true');
  await secureStorage.saveCredentials(username, password);
}

export async function clearRememberMe(): Promise<void> {
  await AsyncStorage.removeItem(REMEMBER_ME_ENABLED_KEY);
  await secureStorage.clearCredentials();
}
