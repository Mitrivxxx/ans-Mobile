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
