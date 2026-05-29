import type { AxiosResponse } from "axios";

import { WD_BASE_URL, client, flushCookieWrites } from "../client/client";
import { mergeAuthCookiesFromNativeIfNeeded } from "../client/cookies";
import { LOGIN_REQUEST_TIMEOUT_MS } from "./login.errors";
import {
  isContextSelectionPageHtml,
  parseContextSelectionOptions,
  urlIndicatesContextSelection,
  type LoginContextOption,
} from "./contextSelection.parser";
import {
  getLastLoginContext,
  matchStoredLoginContext,
} from "../../auth/lastLoginContext.storage";
import {
  getSavedCredentials,
  isRememberMeEnabled,
} from "../../auth/rememberMe.storage";
import { ensureWdUserConsentCookie } from "./userConsent";
import { markSessionEstablished } from "./sessionLifetime";

const LOGIN_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/147.0.0.0 Safari/537.36";

const HTML_HEADERS = {
  Accept: "text/html,application/xhtml+xml",
  "User-Agent": LOGIN_USER_AGENT,
} as const;

export type { LoginContextOption } from "./contextSelection.parser";

export type ContextResolutionResult =
  | { ok: true }
  | { ok: false; error: string };

export type LoginContextFetchResult =
  | { status: "not_required" }
  | { status: "required"; options: LoginContextOption[] }
  | { status: "error"; error: string };

function responseHtml(data: unknown): string {
  return typeof data === "string" ? data : String(data ?? "");
}

function redirectLocation(res: AxiosResponse<string>): string {
  return String(res.headers?.location ?? "");
}

export function getResponseFinalUrl(response: AxiosResponse): string {
  return String(
    (response.request as { responseURL?: string } | undefined)?.responseURL ??
      response.config.url ??
      ""
  );
}

function resolveRedirectPath(location: string): string {
  const trimmed = location.trim();
  if (!trimmed) {
    return "/";
  }
  if (trimmed.startsWith("http")) {
    const url = new URL(trimmed);
    return `${url.pathname}${url.search}`;
  }
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

async function fetchWdHtml(
  path: string,
  referer?: string
): Promise<{ html: string; finalUrl: string }> {
  const res = await client.get<string>(path, {
    responseType: "text",
    transformResponse: [(data) => data],
    maxRedirects: 5,
    skipSessionGuard: true,
    skipSessionExpiryCheck: true,
    timeout: LOGIN_REQUEST_TIMEOUT_MS,
    headers: {
      ...HTML_HEADERS,
      ...(referer ? { Referer: referer } : {}),
    },
  });

  await flushCookieWrites();
  await mergeAuthCookiesFromNativeIfNeeded();

  return {
    html: responseHtml(res.data),
    finalUrl: getResponseFinalUrl(res),
  };
}

function sessionStillOnContextSelection(
  html: string,
  finalUrl: string
): boolean {
  return (
    isContextSelectionPageHtml(html) || urlIndicatesContextSelection(finalUrl)
  );
}

/**
 * Po logowaniu: sprawdź, czy portal wymaga wyboru kontekstu i zwróć listę opcji.
 */
export async function fetchLoginContextSelection(
  postLoginResponse?: AxiosResponse<string>
): Promise<LoginContextFetchResult> {
  await ensureWdUserConsentCookie();

  const location = postLoginResponse
    ? redirectLocation(postLoginResponse)
    : "";

  const tryParsePage = (html: string): LoginContextFetchResult | null => {
    if (!isContextSelectionPageHtml(html)) {
      return null;
    }
    const options = parseContextSelectionOptions(html);
    if (options.length === 0) {
      return {
        status: "error",
        error:
          "Portal wymaga wyboru kontekstu, ale nie znaleziono dostępnych opcji. Spróbuj w przeglądarce.",
      };
    }
    return { status: "required", options };
  };

  if (location.includes("WyborKontekstu")) {
    const page = await fetchWdHtml(
      "/WyborKontekstu",
      `${WD_BASE_URL}/Logowanie`
    );
    const parsed = tryParsePage(page.html);
    if (parsed) {
      return parsed;
    }
  }

  const wyborPage = await fetchWdHtml(
    "/WyborKontekstu",
    `${WD_BASE_URL}/Logowanie`
  );
  const fromWybor = tryParsePage(wyborPage.html);
  if (fromWybor) {
    return fromWybor;
  }

  const homePage = await fetchWdHtml("/", `${WD_BASE_URL}/Logowanie`);
  const fromHome = tryParsePage(homePage.html);
  if (fromHome) {
    return fromHome;
  }

  return { status: "not_required" };
}

export async function applyLoginContextSelection(
  option: LoginContextOption
): Promise<ContextResolutionResult> {
  await ensureWdUserConsentCookie();

  const path = option.href.startsWith("http")
    ? new URL(option.href).pathname + new URL(option.href).search
    : option.href.startsWith("/")
      ? option.href
      : `/${option.href}`;

  const selectRes = await client.get<string>(path, {
    responseType: "text",
    transformResponse: [(data) => data],
    maxRedirects: 0,
    skipSessionGuard: true,
    skipSessionExpiryCheck: true,
    timeout: LOGIN_REQUEST_TIMEOUT_MS,
    headers: {
      ...HTML_HEADERS,
      Referer: `${WD_BASE_URL}/WyborKontekstu`,
    },
  });

  await flushCookieWrites();
  await mergeAuthCookiesFromNativeIfNeeded();

  if (selectRes.status === 301 || selectRes.status === 302) {
    const nextPath = resolveRedirectPath(redirectLocation(selectRes));
    const follow = await fetchWdHtml(nextPath, `${WD_BASE_URL}/WyborKontekstu`);
    if (sessionStillOnContextSelection(follow.html, follow.finalUrl)) {
      return {
        ok: false,
        error:
          "Po wyborze kontekstu portal nadal pokazuje ekran wyboru. Spróbuj ponownie.",
      };
    }
  } else {
    const html = responseHtml(selectRes.data);
    const finalUrl = getResponseFinalUrl(selectRes);
    if (sessionStillOnContextSelection(html, finalUrl)) {
      return {
        ok: false,
        error:
          "Nie udało się przełączyć na wybrany kontekst (brak przekierowania z portalu).",
      };
    }
  }

  const afterHome = await fetchWdHtml("/", `${WD_BASE_URL}/WyborKontekstu`);
  if (sessionStillOnContextSelection(afterHome.html, afterHome.finalUrl)) {
    return {
      ok: false,
      error:
        "Portal nadal oczekuje wyboru kontekstu logowania. Spróbuj ponownie.",
    };
  }

  return { ok: true };
}

/**
 * Przy włączonym „zapamiętaj mnie”: automatycznie wybiera ostatni kontekst,
 * jeśli nadal jest na liście portalu.
 */
export async function tryAutoApplyRememberedLoginContext(
  options: LoginContextOption[]
): Promise<{ applied: boolean }> {
  if (options.length === 0) {
    return { applied: false };
  }

  if (!(await isRememberMeEnabled())) {
    return { applied: false };
  }

  const credentials = await getSavedCredentials();
  const username = credentials?.username?.trim();
  if (!username) {
    return { applied: false };
  }

  const stored = await getLastLoginContext(username);
  if (!stored) {
    return { applied: false };
  }

  const option = matchStoredLoginContext(options, stored);
  if (!option) {
    return { applied: false };
  }

  const outcome = await confirmLoginContextSelection(option);
  return { applied: outcome.ok };
}

/** Zatwierdź wybór kontekstu i oznacz sesję WD jako gotową do scrapowania. */
export async function confirmLoginContextSelection(
  option: LoginContextOption
): Promise<ContextResolutionResult> {
  try {
    const selected = await applyLoginContextSelection(option);
    if (!selected.ok) {
      return selected;
    }
    await markSessionEstablished();
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: "Nie udało się potwierdzić wybranego kontekstu. Spróbuj ponownie.",
    };
  }
}

/** Interceptor: odpowiedź HTML/URL wskazuje /WyborKontekstu. */
export function responseNeedsContextSelection(
  response: AxiosResponse<unknown>
): boolean {
  const body = responseHtml(response.data);
  const finalUrl = getResponseFinalUrl(response);

  return (
    isContextSelectionPageHtml(body) || urlIndicatesContextSelection(finalUrl)
  );
}
