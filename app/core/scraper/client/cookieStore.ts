import AsyncStorage from "@react-native-async-storage/async-storage";
import CookieManager from "@react-native-cookies/cookies";
import { Platform } from "react-native";

export const WD_BASE_URL = "https://wd.ans-ns.edu.pl";

const LEGACY_STORAGE_KEY = "cookieJar";

let cookieHeader = "";
let writeChain: Promise<void> = Promise.resolve();
let pendingCookieWrites = 0;

function enqueueWrite(task: () => Promise<void>): Promise<void> {
  pendingCookieWrites += 1;
  const next = writeChain
    .then(task, task)
    .finally(() => {
      pendingCookieWrites -= 1;
    });
  writeChain = next.catch(() => {});
  return next;
}

export function mergeCookies(oldC: string, newC: string): string {
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

async function readNativeCookieHeader(): Promise<string> {
  try {
    const cookies = await CookieManager.get(WD_BASE_URL);
    return Object.values(cookies)
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");
  } catch {
    return "";
  }
}

async function persistHeaderToNative(header: string): Promise<void> {
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

/** Czeka na zakończenie zapisów do CookieManager tylko gdy są w toku. */
export async function flushCookieWrites(): Promise<void> {
  if (pendingCookieWrites === 0) {
    return;
  }
  await writeChain;
}

export function getCookieHeaderSync(): string {
  return cookieHeader;
}

export async function initCookieStore(): Promise<void> {
  await enqueueWrite(async () => {
    let header = await readNativeCookieHeader();

    if (!header) {
      const legacy = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacy?.trim()) {
        header = legacy.trim();
        await persistHeaderToNative(header);
        await AsyncStorage.removeItem(LEGACY_STORAGE_KEY);
      }
    }

    cookieHeader = header;
  });
  await flushCookieWrites();
}

/** Synchroniczna aktualizacja pamięci + kolejkowany zapis do CookieManager. */
export function applySetCookiePairs(pairs: string): void {
  if (!pairs) return;
  cookieHeader = mergeCookies(cookieHeader, pairs);
  void enqueueWrite(() => persistHeaderToNative(cookieHeader));
}

export async function mergeCookieHeader(header: string): Promise<void> {
  if (!header?.trim()) return;
  cookieHeader = mergeCookies(cookieHeader, header.trim());
  await enqueueWrite(() => persistHeaderToNative(cookieHeader));
}

export async function setCookieHeader(
  headerValue: string | null | undefined
): Promise<void> {
  if (!headerValue?.trim()) return;
  cookieHeader = headerValue.trim();
  await enqueueWrite(() => persistHeaderToNative(cookieHeader));
}

export async function clearCookieStore(): Promise<void> {
  cookieHeader = "";
  await enqueueWrite(async () => {
    await CookieManager.clearAll();
    if (Platform.OS === "android") {
      try {
        await CookieManager.flush();
      } catch {
        /* */
      }
    }
  });
}
