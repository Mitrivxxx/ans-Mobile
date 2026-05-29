import AsyncStorage from '@react-native-async-storage/async-storage';

import type { LoginContextOption } from '../scraper/auth/contextSelection.parser';
import {
  findLoginContextOption,
  toStoredLoginContextRef,
  type StoredLoginContextRef,
} from '../scraper/auth/contextSelection.parser';

const storageKey = (username: string) =>
  `@wdmobile/lastLoginContext/${username.trim().toLowerCase()}`;

export async function saveLastLoginContext(
  username: string,
  option: LoginContextOption
): Promise<void> {
  const trimmed = username.trim();
  if (!trimmed) {
    return;
  }

  await AsyncStorage.setItem(
    storageKey(trimmed),
    JSON.stringify(toStoredLoginContextRef(option))
  );
}

export async function getLastLoginContext(
  username: string
): Promise<StoredLoginContextRef | null> {
  const trimmed = username.trim();
  if (!trimmed) {
    return null;
  }

  const raw = await AsyncStorage.getItem(storageKey(trimmed));
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as StoredLoginContextRef;
    if (
      typeof parsed.personType !== 'number' ||
      !Number.isFinite(parsed.personType) ||
      typeof parsed.href !== 'string' ||
      !parsed.href.trim()
    ) {
      return null;
    }
    return {
      personType: parsed.personType,
      id: typeof parsed.id === 'string' ? parsed.id : undefined,
      href: parsed.href.trim(),
    };
  } catch {
    return null;
  }
}

export function matchStoredLoginContext(
  options: LoginContextOption[],
  stored: StoredLoginContextRef
): LoginContextOption | null {
  return findLoginContextOption(options, stored);
}

export async function clearLastLoginContext(username: string): Promise<void> {
  const trimmed = username.trim();
  if (!trimmed) {
    return;
  }
  await AsyncStorage.removeItem(storageKey(trimmed));
}
