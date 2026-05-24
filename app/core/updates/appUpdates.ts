import * as Updates from 'expo-updates';

export type AppUpdateCheckResult =
  | { status: 'dev' }
  | { status: 'disabled' }
  | { status: 'upToDate' }
  | { status: 'downloaded' }
  | { status: 'error'; message: string };

/** OTA działa tylko w buildzie release (nie w Expo Go / __DEV__). */
export function isAppUpdatesSupported(): boolean {
  return !__DEV__ && Updates.isEnabled;
}

export function getRunningUpdateLabel(): string | null {
  if (__DEV__ || !Updates.isEnabled) {
    return null;
  }
  return Updates.updateId ?? null;
}

export async function checkAndFetchAppUpdate(): Promise<AppUpdateCheckResult> {
  if (__DEV__) {
    return { status: 'dev' };
  }
  if (!Updates.isEnabled) {
    return { status: 'disabled' };
  }

  try {
    const check = await Updates.checkForUpdateAsync();
    if (!check.isAvailable) {
      return { status: 'upToDate' };
    }

    const fetch = await Updates.fetchUpdateAsync();
    if (!fetch.isNew) {
      return { status: 'upToDate' };
    }

    return { status: 'downloaded' };
  } catch (err: unknown) {
    return {
      status: 'error',
      message:
        err instanceof Error ? err.message : 'Nie udało się pobrać aktualizacji.',
    };
  }
}

export async function reloadAppWithUpdate(): Promise<void> {
  await Updates.reloadAsync();
}
