import AsyncStorage from "@react-native-async-storage/async-storage";
import CookieManager from "@react-native-cookies/cookies";
import { Platform } from "react-native";

export const WD_BASE_URL = "https://wd.ans-ns.edu.pl";

const LEGACY_STORAGE_KEY = "cookieJar";

let cookieHeader = "";
let writeChain: Promise<void> = Promise.resolve();
let pendingCookieWrites = 0;
const COOKIE_SPLIT_PATTERN = /,\s*(?=[\w.-]+=)/g;

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

function splitJoinedSetCookieString(raw: string): string[] {
  return raw
    .split(COOKIE_SPLIT_PATTERN)
    .map((part) => part.trim())
    .filter(Boolean);
}

type ParsedSetCookie = {
  pair: string;
  cookie: {
    name: string;
    value: string;
    path?: string;
    domain?: string;
    expires?: string;
    secure?: boolean;
    httpOnly?: boolean;
  };
};

function parseSetCookieLine(line: string): ParsedSetCookie | null {
  const segments = line
    .split(";")
    .map((segment) => segment.trim())
    .filter(Boolean);

  const pair = segments[0] ?? "";
  const pairIdx = pair.indexOf("=");
  if (pairIdx <= 0) {
    return null;
  }

  const name = pair.slice(0, pairIdx).trim();
  const value = pair.slice(pairIdx + 1).trim();
  if (!name) {
    return null;
  }

  const parsed: ParsedSetCookie = {
    pair: `${name}=${value}`,
    cookie: {
      name,
      value,
      path: "/",
      secure: true,
    },
  };

  for (const attrRaw of segments.slice(1)) {
    const [attrNameRaw, ...rest] = attrRaw.split("=");
    const attrName = attrNameRaw?.trim().toLowerCase();
    const attrValue = rest.join("=").trim();
    if (!attrName) continue;

    if (attrName === "path" && attrValue) {
      parsed.cookie.path = attrValue;
      continue;
    }

    if (attrName === "domain" && attrValue) {
      parsed.cookie.domain = attrValue;
      continue;
    }

    if (attrName === "expires" && attrValue) {
      parsed.cookie.expires = attrValue;
      continue;
    }

    if (attrName === "max-age" && attrValue) {
      const maxAgeSeconds = Number(attrValue);
      if (Number.isFinite(maxAgeSeconds)) {
        const expiresAt = new Date(Date.now() + maxAgeSeconds * 1000);
        parsed.cookie.expires = expiresAt.toUTCString();
      }
      continue;
    }

    if (attrName === "secure") {
      parsed.cookie.secure = true;
      continue;
    }

    if (attrName === "httponly") {
      parsed.cookie.httpOnly = true;
    }
  }

  return parsed;
}

function parseSetCookieHeader(setCookie: string | string[]): ParsedSetCookie[] {
  const chunks = Array.isArray(setCookie) ? setCookie : [setCookie];
  const parsed: ParsedSetCookie[] = [];

  for (const chunk of chunks) {
    if (!chunk) continue;
    for (const line of splitJoinedSetCookieString(chunk)) {
      const cookie = parseSetCookieLine(line);
      if (cookie) {
        parsed.push(cookie);
      }
    }
  }

  return parsed;
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

export async function applySetCookieHeader(
  setCookie: string | string[]
): Promise<void> {
  const parsed = parseSetCookieHeader(setCookie);
  if (parsed.length === 0) {
    return;
  }

  const mergedPairs = parsed.map((entry) => entry.pair).join("; ");
  cookieHeader = mergeCookies(cookieHeader, mergedPairs);

  await enqueueWrite(async () => {
    for (const entry of parsed) {
      try {
        await CookieManager.set(WD_BASE_URL, entry.cookie);
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
  });
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
