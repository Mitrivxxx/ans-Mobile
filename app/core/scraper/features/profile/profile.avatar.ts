import { parseHTML } from "linkedom";

import {
  isContextSelectionPageHtml,
  urlIndicatesContextSelection,
} from "../../auth/contextSelection.parser";
import { SessionExpiredError } from "../../auth/sessionValidation";
import { fetchHtmlPageResult } from "./profile.fetch";
import {
  getCachedProfilePhoto,
  setCachedProfilePhoto,
} from "./profilePhotoSessionCache";

const AVATAR_PAGE_PATHS = [
  "/",
  "/konto/accountdetails",
  "/TokStudiow/StudentTokStudiow/DaneOToku",
  "/Plany/PlanyStudentow",
];

function extractSrcFromImgTag(tag: string): string {
  const match = tag.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
  return match?.[1]?.trim() ?? "";
}

function normalizePhotoUri(src: string): string {
  return src.replace(/\s+/g, "");
}

type ExtractAvatarOptions = {
  /**
   * Tylko #zdjecie_glowne i img.wd-avatar-md.
   * Na stronie wyboru kontekstu pomija pierwszy img sidebara (logo).
   */
  strict?: boolean;
};

/** Wyciąga awatar z HTML (sidebar / #zdjecie_glowne) — regex + DOM. */
export function extractAvatarFromHtml(
  html: string,
  options?: ExtractAvatarOptions
): string {
  if (!html) {
    return "";
  }

  const imgTags = html.match(/<img\b[^>]*>/gis) ?? [];
  for (const tag of imgTags) {
    if (/id\s*=\s*["']zdjecie_glowne["']/i.test(tag)) {
      const src = extractSrcFromImgTag(tag);
      if (src) {
        return normalizePhotoUri(src);
      }
    }
  }

  if (!options?.strict) {
    const sidebarIdx = html.search(/apr-sidebar-body/i);
    if (sidebarIdx >= 0) {
      const chunk = html.slice(sidebarIdx, sidebarIdx + 80_000);
      const sidebarImg = chunk.match(/<img\b[^>]*>/i);
      if (sidebarImg) {
        const src = extractSrcFromImgTag(sidebarImg[0]);
        if (src) {
          return normalizePhotoUri(src);
        }
      }
    }
  }

  const avatarByClass =
    html.match(
      /<img\b[^>]*\bwd-avatar-md\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/is
    ) ??
    html.match(
      /\bsrc\s*=\s*["'](data:image\/[^"']+)["'][^>]*\bwd-avatar-md\b/is
    );
  if (avatarByClass?.[1]) {
    return normalizePhotoUri(avatarByClass[1]);
  }

  try {
    const { document } = parseHTML(html);
    const img = options?.strict
      ? (document.querySelector("#zdjecie_glowne") ??
        document.querySelector("img.wd-avatar-md"))
      : (document.querySelector("#zdjecie_glowne") ??
        document.querySelector("aside img.wd-avatar-md") ??
        document.querySelector(".apr-sidebar-body .mt-2 img") ??
        document.querySelector("img.wd-avatar-md"));

    const src = img?.getAttribute("src")?.trim() ?? "";
    if (src) {
      return normalizePhotoUri(src);
    }
  } catch {
    // fallback już wykonany regexem
  }

  return "";
}

function discoverLayoutUrls(html: string): string[] {
  const found = new Set<string>();
  const pattern =
    /["'](\/[A-Za-z0-9_./-]*(?:[Ss]idebar|[Ll]ayout|[Mm]enu|Partial|Nav|Komponent)[A-Za-z0-9_./-]*)["']/g;

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html)) !== null) {
    const path = match[1];
    if (path.length > 1 && path.length < 160) {
      found.add(path);
    }
  }

  return [...found];
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function pageNeedsContextSelection(html: string, finalUrl: string): boolean {
  return (
    isContextSelectionPageHtml(html) || urlIndicatesContextSelection(finalUrl)
  );
}

/** Awatar z HTML. Strona wyboru kontekstu nie bierze logo z sidebara. */
export function readAvatarFromHtml(html: string, finalUrl = ""): string {
  return extractAvatarFromHtml(html, {
    strict: pageNeedsContextSelection(html, finalUrl),
  });
}

type AvatarPageRead = {
  html: string;
  needsContext: boolean;
  photo: string;
};

/**
 * Pobiera awatar ze stron z pełnym layoutem (sidebar w <aside>).
 * Próbuje kilka URL-i; przy samym „Loading…” ponawia GET /.
 * Strona wyboru kontekstu nie zrzuca sesji i nie zapisuje pustego sukcesu.
 */
export async function fetchAvatarPhoto(userKey?: string): Promise<string> {
  const cached = getCachedProfilePhoto(userKey);
  if (cached) {
    return cached;
  }

  const triedPaths = new Set<string>();
  let fetchedPages = 0;
  let contextSelectionPages = 0;

  const loadPage = async (
    path: string,
    options?: { force?: boolean }
  ): Promise<AvatarPageRead> => {
    if (!options?.force && triedPaths.has(path)) {
      return { html: "", needsContext: false, photo: "" };
    }
    triedPaths.add(path);
    const page = await fetchHtmlPageResult(path, {
      skipSessionExpiryCheck: true,
    });
    fetchedPages += 1;
    const needsContext = pageNeedsContextSelection(page.html, page.finalUrl);
    if (needsContext) {
      contextSelectionPages += 1;
    }
    return {
      html: page.html,
      needsContext,
      photo: readAvatarFromHtml(page.html, page.finalUrl),
    };
  };

  const remember = (photo: string): string => {
    setCachedProfilePhoto(photo, userKey);
    return photo;
  };

  let homeHtml = "";
  let homeIsContext = false;

  for (const path of AVATAR_PAGE_PATHS) {
    const page = await loadPage(path);
    if (path === "/") {
      homeHtml = page.html;
      homeIsContext = page.needsContext;
    }
    if (page.photo) {
      return remember(page.photo);
    }
  }

  if (homeHtml && !homeIsContext && /\bLoading\b/i.test(homeHtml)) {
    await delay(800);
    const retry = await loadPage("/", { force: true });
    homeHtml = retry.html;
    homeIsContext = retry.needsContext;
    if (retry.photo) {
      return remember(retry.photo);
    }
  }

  if (homeHtml && !homeIsContext) {
    const extraPaths = discoverLayoutUrls(homeHtml).filter(
      (path) => !triedPaths.has(path)
    );
    for (const path of extraPaths.slice(0, 8)) {
      const page = await loadPage(path);
      if (page.photo) {
        return remember(page.photo);
      }
    }
  }

  if (fetchedPages > 0 && contextSelectionPages === fetchedPages) {
    throw new SessionExpiredError(
      "Wymagany wybór kontekstu logowania — zaloguj się ponownie i wybierz kierunek."
    );
  }

  return "";
}

/** @deprecated Użyj extractAvatarFromHtml */
export function parseAvatarFromHomeHtml(html: string): string {
  return extractAvatarFromHtml(html);
}
