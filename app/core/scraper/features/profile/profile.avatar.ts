import { parseHTML } from "linkedom";

import { fetchHtmlPage } from "./profile.fetch";

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

/** Wyciąga awatar z HTML (sidebar / #zdjecie_glowne) — regex + DOM. */
export function extractAvatarFromHtml(html: string): string {
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
    const img =
      document.querySelector("#zdjecie_glowne") ??
      document.querySelector("aside img.wd-avatar-md") ??
      document.querySelector(".apr-sidebar-body .mt-2 img") ??
      document.querySelector("img.wd-avatar-md");

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

/**
 * Pobiera awatar ze stron z pełnym layoutem (sidebar w <aside>).
 * Próbuje kilka URL-i; przy samym „Loading…” ponawia GET /.
 */
export async function fetchAvatarPhoto(): Promise<string> {
  const triedPaths = new Set<string>();

  const tryHtml = (html: string): string => extractAvatarFromHtml(html);

  for (const path of AVATAR_PAGE_PATHS) {
    triedPaths.add(path);
    const html = await fetchHtmlPage(path);
    const photo = tryHtml(html);
    if (photo) {
      return photo;
    }
  }

  let homeHtml = await fetchHtmlPage("/");
  let photo = tryHtml(homeHtml);

  if (!photo && /\bLoading\b/i.test(homeHtml)) {
    await delay(800);
    homeHtml = await fetchHtmlPage("/");
    photo = tryHtml(homeHtml);
  }

  if (!photo) {
    const extraPaths = discoverLayoutUrls(homeHtml).filter((p) => !triedPaths.has(p));
    for (const path of extraPaths.slice(0, 8)) {
      triedPaths.add(path);
      const html = await fetchHtmlPage(path);
      photo = tryHtml(html);
      if (photo) {
        return photo;
      }
    }
  }

  if (!photo) {
    console.warn(
      "[PROFILE] Avatar not in HTML",
      "aside:",
      /<aside\b/i.test(homeHtml),
      "zdjecie_glowne:",
      /zdjecie_glowne/i.test(homeHtml)
    );
  }

  return photo;
}

/** @deprecated Użyj extractAvatarFromHtml */
export function parseAvatarFromHomeHtml(html: string): string {
  return extractAvatarFromHtml(html);
}
