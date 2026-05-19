import CookieManager from "@react-native-cookies/cookies";

import {
  flushCookieWrites,
  getCookieHeaderSync,
  mergeCookieHeader,
  WD_BASE_URL,
} from "./cookieStore";

export { flushCookieWrites, WD_BASE_URL };

export function hasAuthenticationCookie(cookieHeader: string): boolean {
  return (
    cookieHeader.includes(".AspNet.Cookies") ||
    cookieHeader.includes(".ASPXAUTH") ||
    cookieHeader.includes(".AspNet.ApplicationCookie")
  );
}

/** Wyświetla wszystkie cookies (CookieManager + jar w pamięci). */
export async function showCookies(context?: string): Promise<void> {
  const prefix = context ? `[${context}] ` : "";
  try {
    const nativeCookies = await CookieManager.get(WD_BASE_URL);
    const names = Object.keys(nativeCookies);

    console.log(`${prefix}Cookies (CookieManager, ${WD_BASE_URL}):`);
    if (names.length === 0) {
      console.log("  (brak)");
    } else {
      for (const name of names) {
        const c = nativeCookies[name];
        console.log(`  ${c.name}=${c.value}`);
      }
    }

    const jar = getCookieHeaderSync();
    console.log(`${prefix}Cookies (session jar):`);
    if (!jar) {
      console.log("  (brak)");
    } else {
      for (const part of jar.split("; ").filter(Boolean)) {
        console.log(`  ${part}`);
      }
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.log(`${prefix}Cookies: błąd odczytu — ${msg}`);
  }
}

export async function getCookiesFromManager(
  url: string = WD_BASE_URL
): Promise<string> {
  try {
    const cookies = await CookieManager.get(url);
    return Object.values(cookies)
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");
  } catch {
    return "";
  }
}

/** OkHttp może zapisać .AspNet.Cookies w CookieManager zanim pojawi się w jar. */
export async function mergeAuthCookiesFromNativeIfNeeded(): Promise<void> {
  await flushCookieWrites();

  const jar = getCookieHeaderSync();
  if (hasAuthenticationCookie(jar)) return;

  const native = await getCookiesFromManager();
  if (!native || !hasAuthenticationCookie(native)) return;

  await mergeCookieHeader(native);
}
