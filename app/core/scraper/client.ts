import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https://wd.ans-ns.edu.pl";

let cookieJar = "";

/**
 * Load session on app start
 */
export async function initClient() {
  const saved = await AsyncStorage.getItem("cookieJar");
  if (saved) cookieJar = saved;
}

/**
 * Persist cookies
 */
async function saveCookies() {
  await AsyncStorage.setItem("cookieJar", cookieJar);
}

/**
 * Merge cookies like real browser (ASP.NET safe)
 */
function mergeCookies(oldC: string, newC: string) {
  const map = new Map<string, string>();

  [...oldC.split("; "), ...newC.split("; ")]
    .filter(Boolean)
    .forEach((c) => {
      const idx = c.indexOf("=");
      if (idx === -1) return;

      const k = c.slice(0, idx);
      const v = c.slice(idx + 1);

      map.set(k.trim(), v.trim());
    });

  return Array.from(map.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

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

/**
 * Axios client WITHOUT cookie magic (we control everything)
 */
export const client = axios.create({
  baseURL: BASE_URL,
  validateStatus: () => true,
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120"
  }
});

/**
 * Attach cookies (browser-like)
 */
client.interceptors.request.use((config) => {
  config.headers = config.headers || {};

  if (cookieJar) {
    config.headers.Cookie = cookieJar;
  }

  return config;
});

/**
 * Capture Set-Cookie (ASP.NET session binding)
 * Synchroniczna aktualizacja cookieJar — unikamy wyścigu z await przed odczytem getCookies().
 */
client.interceptors.response.use((res) => {
  const setCookie = res.headers?.["set-cookie"];

  if (setCookie) {
    const parsed = pairsFromSetCookieHeader(setCookie).join("; ");

    if (parsed) {
      cookieJar = mergeCookies(cookieJar, parsed);
      void saveCookies();
    }
  }

  return res;
});

export function getCookies() {
  return cookieJar;
}

/** Scala dodatkowy nagłówek Cookie do jar (np. cookie z CookieManager / OkHttp). */
export function mergeCookieHeaderIntoJar(header: string) {
  if (!header?.trim()) return;
  cookieJar = mergeCookies(cookieJar, header.trim());
  void saveCookies();
}

export async function clearCookies() {
  cookieJar = "";
  await AsyncStorage.removeItem("cookieJar");
}

/** Ustawia ciasteczka sesji dla axios (np. po logowaniu przez CookieManager + fetch). */
export async function setSessionCookies(headerValue: string | null | undefined) {
  if (!headerValue?.trim()) return;
  cookieJar = headerValue.trim();
  await saveCookies();
}