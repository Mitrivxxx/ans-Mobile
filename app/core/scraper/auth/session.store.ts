import CookieManager from "@react-native-cookies/cookies";
import { Platform } from "react-native";

import { WD_BASE_URL, clearCookies } from "../client/client";
import { hasAuthenticationCookie } from "../client/cookies";

export async function clearSession(): Promise<void> {
  await CookieManager.clearAll();
  await clearCookies();
  if (Platform.OS === "android") {
    try {
      await CookieManager.flush();
    } catch {
      /* ignore */
    }
  }
}

export async function getNativeCookieHeader(): Promise<string | null> {
  try {
    const cookies = await CookieManager.get(WD_BASE_URL);
    return Object.values(cookies)
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");
  } catch {
    return null;
  }
}

export async function isSessionAuthenticated(): Promise<boolean> {
  const header = await getNativeCookieHeader();
  if (!header) return false;
  return hasAuthenticationCookie(header);
}
