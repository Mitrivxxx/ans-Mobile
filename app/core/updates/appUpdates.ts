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

/** Kanał EAS Update przypisany do zainstalowanego builda. */
export function getOtaChannel(): string | null {
  if (__DEV__ || !Updates.isEnabled) {
    return null;
  }
  return Updates.channel ?? null;
}

function getUpdateDiagnostics(): string {
  if (__DEV__ || !Updates.isEnabled) {
    return '';
  }
  const parts: string[] = [];
  if (Updates.channel) {
    parts.push(`kanał: ${Updates.channel}`);
  }
  if (Updates.runtimeVersion) {
    parts.push(`runtime: ${Updates.runtimeVersion}`);
  }
  if (Updates.updateId) {
    parts.push(`aktualny pakiet: ${Updates.updateId.slice(0, 8)}…`);
  }
  return parts.length > 0 ? ` (${parts.join(', ')})` : '';
}

function formatUpdateErrorMessage(err: unknown): string {
  const raw =
    err instanceof Error ? err.message : 'Nie udało się sprawdzić aktualizacji.';
  const diagnostics = getUpdateDiagnostics();

  if (/failed to check for update/i.test(raw)) {
    return (
      'Nie udało się pobrać manifestu aktualizacji z EAS.\n\n' +
      'Najczęstsza przyczyna: APK na telefonie ma inny fingerprint niż opublikowany update ' +
      '(np. zmieniłeś app.config / eas.json po zbudowaniu APK).\n\n' +
      'Rozwiązanie:\n' +
      '1. npm run build:github\n' +
      '2. Zainstaluj nowy APK z expo.dev\n' +
      '3. npm run update:production -- --message "opis"\n' +
      '4. Ustawienia → Sprawdź teraz\n\n' +
      'Kolejne zmiany tylko w plikach .tsx/.ts możesz wysyłać samym update:production ' +
      '(bez nowego APK), o ile nie zmieniasz app.config ani zależności natywnych.\n\n' +
      `Szczegóły: ${raw}${diagnostics}`
    );
  }

  return `${raw}${diagnostics}`;
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
      const reason =
        'reason' in check && typeof check.reason === 'string'
          ? check.reason
          : null;
      if (reason === 'updateRejectedBySelectionPolicy') {
        return {
          status: 'error',
          message:
            'Serwer ma update, ale nie pasuje do tego APK (fingerprint / polityka selekcji). ' +
            'Zbuduj i zainstaluj nowy APK: npm run build:github, potem ponów update:production.' +
            getUpdateDiagnostics(),
        };
      }
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
      message: formatUpdateErrorMessage(err),
    };
  }
}

export async function reloadAppWithUpdate(): Promise<void> {
  await Updates.reloadAsync();
}
