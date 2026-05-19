import type { InternalAxiosRequestConfig } from 'axios';

import {
  getSavedCredentials,
  isRememberMeEnabled,
} from '../../auth/rememberMe.storage';
import {
  getCookies as getAxiosCookieHeader,
  client,
  initClient,
  mergeCookieHeaderIntoJar,
} from '../client/client';
import {
  getCookiesFromManager,
  hasAuthenticationCookie,
  mergeAuthCookiesFromNativeIfNeeded,
} from '../client/cookies';
import { getLoginResultErrorMessage } from '../../../features/login/loginErrorDisplay';

import { AuthService } from './auth.service';
import { isSessionAuthenticated } from './session.store';

export class NotAuthenticatedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotAuthenticatedError';
  }
}

let authGuardRegistered = false;
let ensureInFlight: Promise<void> | null = null;
let loginInFlight: Promise<{ success: boolean; errorMessage?: string }> | null =
  null;

function pathFromRequestUrl(url?: string): string {
  if (!url) {
    return '';
  }

  if (url.startsWith('http')) {
    try {
      return new URL(url).pathname;
    } catch {
      return url.split('?')[0] ?? url;
    }
  }

  return url.split('?')[0] ?? url;
}

export function shouldSkipAuthForRequest(
  config: Pick<InternalAxiosRequestConfig, 'url'>
): boolean {
  const path = pathFromRequestUrl(config.url);
  return path === '/Logowanie' || path.endsWith('/Logowanie');
}

export async function hasScraperSession(): Promise<boolean> {
  await initClient();
  await mergeAuthCookiesFromNativeIfNeeded();

  if (hasAuthenticationCookie(getAxiosCookieHeader())) {
    return true;
  }

  if (await isSessionAuthenticated()) {
    const native = await getCookiesFromManager();
    if (native) {
      mergeCookieHeaderIntoJar(native);
    }
    return true;
  }

  return false;
}

export async function loginWithSavedCredentials(): Promise<{
  success: boolean;
  errorMessage?: string;
}> {
  const credentials = await getSavedCredentials();
  if (!credentials) {
    return {
      success: false,
      errorMessage: 'Brak zapisanych danych logowania.',
    };
  }

  const authService = new AuthService();
  const result = await authService.login(
    credentials.username,
    credentials.password
  );

  if (result.success) {
    await mergeAuthCookiesFromNativeIfNeeded();
    return { success: true };
  }

  return {
    success: false,
    errorMessage: getLoginResultErrorMessage(result),
  };
}

async function ensureAuthenticatedInternal(): Promise<void> {
  if (await hasScraperSession()) {
    return;
  }

  const rememberMe = await isRememberMeEnabled();

  if (!rememberMe) {
    throw new NotAuthenticatedError(
      'Brak aktywnej sesji. Zaloguj się, aby pobrać dane.'
    );
  }

  if (!loginInFlight) {
    loginInFlight = loginWithSavedCredentials().finally(() => {
      loginInFlight = null;
    });
  }

  const outcome = await loginInFlight;

  if (outcome.success || (await hasScraperSession())) {
    return;
  }

  throw new NotAuthenticatedError(
    outcome.errorMessage
      ? `Nie udało się zalogować: ${outcome.errorMessage}`
      : 'Nie udało się odświeżyć sesji. Zaloguj się ponownie.'
  );
}

export async function ensureAuthenticatedBeforeScrape(): Promise<void> {
  if (ensureInFlight) {
    return ensureInFlight;
  }

  ensureInFlight = ensureAuthenticatedInternal().finally(() => {
    ensureInFlight = null;
  });

  return ensureInFlight;
}

export function setupScraperAuthGuard(): void {
  if (authGuardRegistered) {
    return;
  }

  authGuardRegistered = true;

  client.interceptors.request.use(
    async (config) => {
      if (shouldSkipAuthForRequest(config)) {
        return config;
      }

      await ensureAuthenticatedBeforeScrape();
      return config;
    },
    (error) => Promise.reject(error)
  );
}
