import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";

import { devLog } from "../../../config/devLog";
import { client, WD_BASE_URL } from "../client/client";

import {
  getResponseFinalUrl,
  responseNeedsContextSelection,
} from "./contextSelection";
import {
  isContextSelectionPageHtml,
  urlIndicatesContextSelection,
} from "./contextSelection.parser";
import { isLoginFormHtml } from "./login.parser";
import { isSessionFresh } from "./sessionLifetime";
import { ensureWdUserConsentCookie } from "./userConsent";

export class SessionExpiredError extends Error {
  constructor(message = "Sesja WD wygasła. Zaloguj się ponownie.") {
    super(message);
    this.name = "SessionExpiredError";
  }
}

declare module "axios" {
  export interface AxiosRequestConfig {
    /** Pomija guard sesji (probe, logowanie). */
    skipSessionGuard?: boolean;
    /** Nie sprawdza wygaśnięcia w response interceptorze. */
    skipSessionExpiryCheck?: boolean;
    /** Jednorazowy retry po odświeżeniu sesji. */
    _sessionRetried?: boolean;
  }

  export interface InternalAxiosRequestConfig {
    skipSessionGuard?: boolean;
    skipSessionExpiryCheck?: boolean;
    _sessionRetried?: boolean;
  }
}

function responseBody(data: unknown): string {
  return typeof data === "string" ? data : String(data ?? "");
}

export function isLoginRedirectResponse(response: AxiosResponse): boolean {
  if (response.status !== 301 && response.status !== 302) {
    return false;
  }

  const location = String(response.headers?.location ?? "");
  return location.includes("/Logowanie");
}

export function responseFinalUrlIndicatesLogin(
  response: AxiosResponse
): boolean {
  const url = String(
    (response.request as { responseURL?: string } | undefined)?.responseURL ??
      response.config.url ??
      ""
  );
  return url.includes("/Logowanie");
}

export function responseIndicatesSessionExpired(
  response: AxiosResponse<unknown>
): boolean {
  if (response.config.skipSessionExpiryCheck) {
    return false;
  }

  if (response.status === 401 || response.status === 403) {
    return true;
  }

  if (isLoginRedirectResponse(response)) {
    return true;
  }

  if (responseFinalUrlIndicatesLogin(response)) {
    return true;
  }

  const contentType = String(response.headers?.["content-type"] ?? "");
  const body = responseBody(response.data);

  if (!body || body.length < 80) {
    return false;
  }

  const looksHtml =
    contentType.includes("text/html") ||
    body.includes("<html") ||
    body.includes("<!DOCTYPE");

  if (!looksHtml) {
    return false;
  }

  if (isContextSelectionPageHtml(body)) {
    return true;
  }

  if (urlIndicatesContextSelection(getResponseFinalUrl(response))) {
    return true;
  }

  return isLoginFormHtml(body);
}

export function assertAuthenticatedHtml(
  html: string,
  message?: string
): void {
  if (isContextSelectionPageHtml(html)) {
    throw new SessionExpiredError(
      message ??
        "Wymagany wybór kontekstu logowania — zaloguj się ponownie i wybierz kierunek."
    );
  }

  if (isLoginFormHtml(html)) {
    throw new SessionExpiredError(
      message ?? "Sesja wygasła — serwer zwrócił stronę logowania."
    );
  }
}

const PROBE_HEADERS = {
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7",
  Referer: `${WD_BASE_URL}/`,
  "Content-Type": undefined,
} as const;

/** Lżejszy niż GET / — wystarczy do wykrycia redirectu / formularza logowania. */
const SESSION_PROBE_PATH = "/konto/accountdetails";

const SESSION_PROBE_TIMEOUT_MS = 15_000;

type ProbeWdSessionAliveOptions = {
  /** Wymuś GET nawet przy świeżej sesji (np. tuż po logowaniu). */
  force?: boolean;
};

/** Lekki GET — czy serwer nadal honoruje ciasteczka (bez pełnego guarda). */
export async function probeWdSessionAlive(
  options?: ProbeWdSessionAliveOptions
): Promise<boolean> {
  if (!options?.force && (await isSessionFresh())) {
    devLog("Auth", "probe skipped — fresh session (sessionLifetime)");
    return true;
  }

  await ensureWdUserConsentCookie();

  const response = await client.get<string>(SESSION_PROBE_PATH, {
    responseType: "text",
    transformResponse: [(data) => data],
    maxRedirects: 5,
    timeout: SESSION_PROBE_TIMEOUT_MS,
    skipSessionGuard: true,
    skipSessionExpiryCheck: true,
    headers: PROBE_HEADERS,
  });

  if (responseNeedsContextSelection(response)) {
    return false;
  }

  return !responseIndicatesSessionExpired(response);
}

export function isSessionProbeConfig(
  config: Pick<InternalAxiosRequestConfig, "skipSessionGuard">
): boolean {
  return Boolean(config.skipSessionGuard);
}

/** Po udanym logowaniu — upewnij się, że WD honoruje ciasteczka zanim odpalisz prefetch. */
export async function confirmWdSessionAfterLogin(): Promise<boolean> {
  return probeWdSessionAlive({ force: true });
}
