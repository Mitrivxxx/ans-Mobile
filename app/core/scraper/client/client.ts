import axios from "axios";

import {
  applySetCookiePairs,
  clearCookieStore,
  flushCookieWrites,
  getCookieHeaderSync,
  initCookieStore,
  mergeCookieHeader,
  setCookieHeader,
  WD_BASE_URL,
} from "./cookieStore";

export { WD_BASE_URL };

/**
 * Load session on app start (CookieManager + jednorazowa migracja z AsyncStorage).
 */
export async function initClient() {
  await initCookieStore();
}

export const client = axios.create({
  baseURL: WD_BASE_URL,
  validateStatus: () => true,
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120",
  },
});

client.interceptors.request.use(async (config) => {
  await flushCookieWrites();
  config.headers = config.headers || {};

  const header = getCookieHeaderSync();
  if (header) {
    config.headers.Cookie = header;
  }

  return config;
});

/**
 * Na Androidzie kilka Set-Cookie bywa scalone w jeden string.
 * Dzielimy tylko tam, gdzie po ", " zaczyna się nowe ciasteczko (nazwa=wartość),
 * żeby nie ciąć przecinków w Expires=Wed, 14 May ...
 */
function splitJoinedSetCookieString(raw: string): string[] {
  const parts: string[] = [];
  let segmentStart = 0;
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] !== ",") continue;
    const after = raw.slice(i + 1).replace(/^\s+/, "");
    if (/^[\w.-]+\=/.test(after)) {
      parts.push(raw.slice(segmentStart, i).trim());
      segmentStart = i + 1;
    }
  }
  parts.push(raw.slice(segmentStart).trim());
  return parts.filter(Boolean);
}

/** Z nagłówka(ów) Set-Cookie wyciąga listę "Nazwa=Wartość" (pierwszy segment każdej linii). */
function pairsFromSetCookieHeader(setCookie: string | string[]): string[] {
  const chunks = Array.isArray(setCookie) ? setCookie : [setCookie];
  const pairs: string[] = [];
  for (const chunk of chunks) {
    if (!chunk) continue;
    for (const line of splitJoinedSetCookieString(chunk)) {
      const first = line.split(";")[0]?.trim() ?? "";
      if (first.includes("=")) pairs.push(first);
    }
  }
  return pairs;
}

client.interceptors.response.use((res) => {
  const setCookie = res.headers?.["set-cookie"];

  if (setCookie) {
    const parsed = pairsFromSetCookieHeader(setCookie).join("; ");
    if (parsed) {
      applySetCookiePairs(parsed);
    }
  }

  return res;
});

export function getCookies() {
  return getCookieHeaderSync();
}

/** Scala nagłówek Cookie do jar (np. z CookieManager / OkHttp). */
export async function mergeCookieHeaderIntoJar(header: string) {
  await mergeCookieHeader(header);
}

export async function clearCookies() {
  await clearCookieStore();
}

export async function setSessionCookies(headerValue: string | null | undefined) {
  await setCookieHeader(headerValue);
}

export { flushCookieWrites };
