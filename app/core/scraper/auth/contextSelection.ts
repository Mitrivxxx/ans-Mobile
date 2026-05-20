import type { AxiosResponse } from "axios";

import { WD_BASE_URL, client, flushCookieWrites } from "../client/client";
import { mergeAuthCookiesFromNativeIfNeeded } from "../client/cookies";
import { LOGIN_REQUEST_TIMEOUT_MS } from "./login.errors";
import {
  isContextSelectionPageHtml,
  parseContextSelectionOptions,
  pickStudentLoginContext,
  urlIndicatesContextSelection,
  type LoginContextOption,
} from "./contextSelection.parser";
import { ensureWdUserConsentCookie } from "./userConsent";

const LOGIN_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/147.0.0.0 Safari/537.36";

const HTML_HEADERS = {
  Accept: "text/html,application/xhtml+xml",
  "User-Agent": LOGIN_USER_AGENT,
} as const;

export type ContextResolutionResult =
  | { ok: true }
  | { ok: false; error: string };

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

async function selectLoginContext(
  option: LoginContextOption
): Promise<ContextResolutionResult> {
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
          "Po wyborze kontekstu Student portal nadal pokazuje ekran wyboru. Spróbuj ponownie.",
      };
    }
    return { ok: true };
  }

  const html = responseHtml(selectRes.data);
  const finalUrl = getResponseFinalUrl(selectRes);
  if (sessionStillOnContextSelection(html, finalUrl)) {
    return {
      ok: false,
      error:
        "Nie udało się przełączyć na kontekst studenta (brak przekierowania z portalu).",
    };
  }

  return { ok: true };
}

async function completeContextSelectionFromHtml(
  html: string
): Promise<ContextResolutionResult> {
  await ensureWdUserConsentCookie();

  const options = parseContextSelectionOptions(html);
  const student = pickStudentLoginContext(options);

  if (!student) {
    return {
      ok: false,
      error:
        "Po zalogowaniu portal wymaga wyboru kontekstu, ale nie znaleziono opcji „Student”. Zaloguj się w przeglądarce i wybierz kierunek studiów.",
    };
  }

  try {
    const selected = await selectLoginContext(student);
    if (!selected.ok) {
      return selected;
    }
  } catch {
    return {
      ok: false,
      error:
        "Nie udało się potwierdzić kontekstu studenta na portalu. Spróbuj ponownie.",
    };
  }

  const afterHome = await fetchWdHtml("/", `${WD_BASE_URL}/WyborKontekstu`);
  if (sessionStillOnContextSelection(afterHome.html, afterHome.finalUrl)) {
    return {
      ok: false,
      error:
        "Portal nadal oczekuje wyboru kontekstu logowania. Spróbuj ponownie lub wybierz kierunek w przeglądarce.",
    };
  }

  return { ok: true };
}

/**
 * Po logowaniu: wymuszenie GET /WyborKontekstu i wybór Student (personType=1).
 * Bez tego scraper działa na stronie z „testowym” avatarem i pada plan/profil.
 */
export async function ensureLoginContextResolved(
  postLoginResponse?: AxiosResponse<string>
): Promise<ContextResolutionResult> {
  await ensureWdUserConsentCookie();

  const location = postLoginResponse
    ? redirectLocation(postLoginResponse)
    : "";

  if (location.includes("WyborKontekstu")) {
    const page = await fetchWdHtml(
      "/WyborKontekstu",
      `${WD_BASE_URL}/Logowanie`
    );
    if (isContextSelectionPageHtml(page.html)) {
      return completeContextSelectionFromHtml(page.html);
    }
  }

  const wyborPage = await fetchWdHtml(
    "/WyborKontekstu",
    `${WD_BASE_URL}/Logowanie`
  );
  if (isContextSelectionPageHtml(wyborPage.html)) {
    return completeContextSelectionFromHtml(wyborPage.html);
  }

  const homePage = await fetchWdHtml("/", `${WD_BASE_URL}/Logowanie`);
  if (isContextSelectionPageHtml(homePage.html)) {
    return completeContextSelectionFromHtml(homePage.html);
  }

  return { ok: true };
}

/** Gdy response / probe zwraca HTML wyboru kontekstu. */
export async function ensureLoginContextResolvedFromHtml(
  html: string
): Promise<ContextResolutionResult> {
  if (!isContextSelectionPageHtml(html)) {
    return { ok: true };
  }

  return completeContextSelectionFromHtml(html);
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
