import CookieManager from "@react-native-cookies/cookies";
import { Platform } from "react-native";

import {
  WD_BASE_URL,
  getCookies as getAxiosCookieHeader,
  mergeCookieHeaderIntoJar,
} from "./client";

export function hasAuthenticationCookie(cookieHeader: string): boolean {
  return (
    cookieHeader.includes(".AspNet.Cookies") ||
    cookieHeader.includes(".ASPXAUTH") ||
    cookieHeader.includes(".AspNet.ApplicationCookie")
  );
}

/** Zapisuje bieżący cookieJar axios do CookieManager (isAuthenticated / fetch poza axios). */
export async function syncAxiosCookiesToNative(): Promise<void> {
  const header = getAxiosCookieHeader();
  if (!header) return;

  for (const part of header.split("; ").filter(Boolean)) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const name = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    try {
      await CookieManager.set(WD_BASE_URL, {
        name,
        value,
        path: "/",
        secure: true,
      });
    } catch {
      /* pojedyncze ciasteczko */
    }
  }

  if (Platform.OS === "android") {
    try {
      await CookieManager.flush();
    } catch {
      /* */
    }
  }
}

/** Wyświetla wszystkie cookies (CookieManager + jar axios). */
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

    const axiosJar = getAxiosCookieHeader();
    console.log(`${prefix}Cookies (axios jar):`);
    if (!axiosJar) {
      console.log("  (brak)");
    } else {
      for (const part of axiosJar.split("; ").filter(Boolean)) {
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

/** OkHttp może zapisać .AspNet.Cookies w CookieManager zanim pojawi się w jar axios. */
export async function mergeAuthCookiesFromNativeIfNeeded(): Promise<void> {
  const jar = getAxiosCookieHeader();
  if (hasAuthenticationCookie(jar)) return;
  const native = await getCookiesFromManager();
  if (!native || !hasAuthenticationCookie(native)) return;
  mergeCookieHeaderIntoJar(native);
}
