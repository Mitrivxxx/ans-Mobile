import type { InternalAxiosRequestConfig } from "axios";

import { isDeviceOffline } from "../../auth/authSessionPolicy";
import {
  getSavedCredentials,
  isRememberMeEnabled,
} from "../../auth/rememberMe.storage";
import {
  getCookies as getAxiosCookieHeader,
  client,
  initClient,
  mergeCookieHeaderIntoJar,
} from "../client/client";
import {
  getCookiesFromManager,
  hasAuthenticationCookie,
  mergeAuthCookiesFromNativeIfNeeded,
} from "../client/cookies";
import { getLoginResultErrorMessage } from "../../../features/login/loginErrorDisplay";

import { AuthService } from "./auth.service";
import {
  responseNeedsContextSelection,
  tryAutoApplyRememberedLoginContext,
} from "./contextSelection";
import {
  parseContextSelectionOptions,
  type LoginContextOption,
} from "./contextSelection.parser";
import {
  canAttemptSilentLogin,
  getSilentLoginBlockedMessage,
  recordSilentLoginAttempt,
} from "./silentLoginLimiter";
import { isSessionAuthenticated } from "./session.store";
import {
  isSessionPastTtl,
  markSessionEstablished,
} from "./sessionLifetime";
import {
  probeWdSessionAlive,
  responseIndicatesSessionExpired,
  SessionExpiredError,
} from "./sessionValidation";

export { SessionExpiredError } from "./sessionValidation";

export class NotAuthenticatedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotAuthenticatedError";
  }
}

let authGuardRegistered = false;
let ensureInFlight: Promise<void> | null = null;
let loginInFlight: Promise<{ success: boolean; errorMessage?: string }> | null =
  null;
let restoreRememberMeInFlight: Promise<RememberMeResolveResult> | null = null;

let onSessionLostHandler: (() => void) | null = null;

export function registerSessionLostHandler(handler: () => void): () => void {
  onSessionLostHandler = handler;
  return () => {
    if (onSessionLostHandler === handler) {
      onSessionLostHandler = null;
    }
  };
}

function notifySessionLost(): void {
  onSessionLostHandler?.();
}

function pathFromRequestUrl(url?: string): string {
  if (!url) {
    return "";
  }

  if (url.startsWith("http")) {
    try {
      return new URL(url).pathname;
    } catch {
      return url.split("?")[0] ?? url;
    }
  }

  return url.split("?")[0] ?? url;
}

export function shouldSkipAuthForRequest(
  config: Pick<InternalAxiosRequestConfig, "url">
): boolean {
  const path = pathFromRequestUrl(config.url);
  return path === "/Logowanie" || path.endsWith("/Logowanie");
}

export async function hasScraperSession(): Promise<boolean> {
  await initClient();
  await mergeAuthCookiesFromNativeIfNeeded();
  const native = await getCookiesFromManager();
  if (native) {
    await mergeCookieHeaderIntoJar(native);
  }

  if (hasAuthenticationCookie(getAxiosCookieHeader())) {
    return true;
  }

  if (await isSessionAuthenticated()) {
    return true;
  }

  return false;
}

export async function loginWithSavedCredentials(): Promise<{
  success: boolean;
  errorMessage?: string;
  requiresContextSelection?: boolean;
  contextOptions?: LoginContextOption[];
}> {
  const credentials = await getSavedCredentials();
  if (!credentials) {
    return {
      success: false,
      errorMessage: "Brak zapisanych danych logowania.",
    };
  }

  const authService = new AuthService();
  const result = await authService.login(
    credentials.username,
    credentials.password
  );

  if (result.requiresContextSelection && result.contextOptions?.length) {
    await mergeAuthCookiesFromNativeIfNeeded();
    const auto = await tryAutoApplyRememberedLoginContext(
      result.contextOptions
    );
    if (auto.applied) {
      return { success: true };
    }
    return {
      success: false,
      requiresContextSelection: true,
      contextOptions: result.contextOptions,
      errorMessage: "Wybierz kontekst logowania na ekranie logowania.",
    };
  }

  if (result.success) {
    await mergeAuthCookiesFromNativeIfNeeded();
    await markSessionEstablished();
    return { success: true };
  }

  return {
    success: false,
    errorMessage: getLoginResultErrorMessage(result),
  };
}

/** Jedna współdzielona próba silent login (remember me). */
export async function silentLoginOnce(): Promise<{
  success: boolean;
  errorMessage?: string;
}> {
  if (!canAttemptSilentLogin()) {
    return {
      success: false,
      errorMessage: getSilentLoginBlockedMessage(),
    };
  }

  if (!loginInFlight) {
    loginInFlight = (async () => {
      recordSilentLoginAttempt();
      return loginWithSavedCredentials();
    })().finally(() => {
      loginInFlight = null;
    });
  }

  return loginInFlight;
}

async function sessionNeedsRefresh(): Promise<boolean> {
  if (!(await hasScraperSession())) {
    return true;
  }
  return isSessionPastTtl();
}

async function ensureRememberMeSessionAlive(): Promise<void> {
  if (await isDeviceOffline()) {
    return;
  }

  if (!(await sessionNeedsRefresh())) {
    return;
  }

  const outcome = await silentLoginOnce();

  if (outcome.success || (await hasScraperSession())) {
    return;
  }

  throw new NotAuthenticatedError(
    outcome.errorMessage
      ? `Nie udało się odświeżyć sesji: ${outcome.errorMessage}`
      : "Nie udało się odświeżyć sesji. Zaloguj się ponownie."
  );
}

async function ensureAuthenticatedInternal(): Promise<void> {
  const rememberMe = await isRememberMeEnabled();

  if (rememberMe) {
    await ensureRememberMeSessionAlive();
    return;
  }

  if (await hasScraperSession()) {
    return;
  }

  throw new NotAuthenticatedError(
    "Brak aktywnej sesji. Zaloguj się, aby pobrać dane."
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

export type RememberMeResolveResult = {
  authenticated: boolean;
  sessionDegraded: boolean;
  errorMessage?: string;
};

/**
 * Przy starcie / foreground: probe (gdy sesja świeża), potem ewentualnie silent login.
 * Przy pastTtl pomijamy probe — od razu silent login (−1 request).
 */
export async function restoreRememberMeSession(): Promise<RememberMeResolveResult> {
  if (!restoreRememberMeInFlight) {
    restoreRememberMeInFlight = (async () => {
      if (await isDeviceOffline()) {
        return {
          authenticated: false,
          sessionDegraded: true,
        };
      }

      const pastTtl = await isSessionPastTtl();

      if (!pastTtl && (await hasScraperSession())) {
        try {
          const alive = await probeWdSessionAlive();
          if (alive) {
            return { authenticated: true, sessionDegraded: false };
          }
        } catch {
          /* probe failed — silent login poniżej */
        }
      }

      const outcome = await silentLoginOnce();

      if (outcome.success) {
        return { authenticated: true, sessionDegraded: false };
      }

      return {
        authenticated: false,
        sessionDegraded: false,
        errorMessage: outcome.errorMessage,
      };
    })().finally(() => {
      restoreRememberMeInFlight = null;
    });
  }

  return restoreRememberMeInFlight;
}

export async function refreshSessionOnForeground(): Promise<RememberMeResolveResult> {
  const rememberMe = await isRememberMeEnabled();
  if (!rememberMe) {
    return { authenticated: await hasScraperSession(), sessionDegraded: false };
  }

  return restoreRememberMeSession();
}

export function setupScraperAuthGuard(): void {
  if (authGuardRegistered) {
    return;
  }

  authGuardRegistered = true;

  client.interceptors.request.use(
    async (config) => {
      if (config.skipSessionGuard || shouldSkipAuthForRequest(config)) {
        return config;
      }

      await ensureAuthenticatedBeforeScrape();
      return config;
    },
    (error) => Promise.reject(error)
  );

  client.interceptors.response.use(
    async (response) => {
      if (
        response.config.skipSessionExpiryCheck ||
        shouldSkipAuthForRequest(response.config) ||
        response.config._sessionRetried
      ) {
        return response;
      }

      if (responseNeedsContextSelection(response)) {
        const body =
          typeof response.data === "string"
            ? response.data
            : String(response.data ?? "");
        const options = parseContextSelectionOptions(body);
        if (options.length > 0) {
          const auto = await tryAutoApplyRememberedLoginContext(options);
          if (auto.applied) {
            const retryConfig: InternalAxiosRequestConfig = {
              ...response.config,
              _sessionRetried: true,
            };
            return client.request(retryConfig);
          }
        }

        notifySessionLost();
        throw new SessionExpiredError(
          "Wymagany wybór kontekstu logowania — zaloguj się ponownie i wybierz kierunek."
        );
      }

      if (!responseIndicatesSessionExpired(response)) {
        return response;
      }

      const rememberMe = await isRememberMeEnabled();

      if (!rememberMe) {
        notifySessionLost();
        throw new SessionExpiredError();
      }

      const outcome = await silentLoginOnce();

      if (!outcome.success && !(await hasScraperSession())) {
        notifySessionLost();
        throw new SessionExpiredError(
          outcome.errorMessage ?? "Sesja wygasła i nie udało się jej odnowić."
        );
      }

      const retryConfig: InternalAxiosRequestConfig = {
        ...response.config,
        _sessionRetried: true,
      };

      return client.request(retryConfig);
    },
    (error) => Promise.reject(error)
  );
}
