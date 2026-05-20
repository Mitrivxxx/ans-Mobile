import axios from "axios";

import {
  applySetCookieHeader,
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
  validateStatus: (status) => status >= 200 && status < 500,
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

client.interceptors.response.use(async (res) => {
  const setCookie = res.headers?.["set-cookie"];

  if (setCookie) {
    await applySetCookieHeader(setCookie);
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
