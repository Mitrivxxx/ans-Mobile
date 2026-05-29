import { parseHTML } from "linkedom";

import { WD_BASE_URL } from "../client/client";

export type LoginContextOption = {
  href: string;
  personType: number;
  id?: string;
  title: string;
  subtitle?: string;
};

/** Zapis w AsyncStorage — dopasowanie po id, href lub samym personType. */
export type StoredLoginContextRef = {
  personType: number;
  id?: string;
  href: string;
};

export function toStoredLoginContextRef(
  option: LoginContextOption
): StoredLoginContextRef {
  return {
    personType: option.personType,
    id: option.id,
    href: option.href,
  };
}

export function findLoginContextOption(
  options: LoginContextOption[],
  stored: StoredLoginContextRef
): LoginContextOption | null {
  if (stored.id) {
    const byId = options.find(
      (o) => o.personType === stored.personType && o.id === stored.id
    );
    if (byId) {
      return byId;
    }
  }

  const byHref = options.find((o) => o.href === stored.href);
  if (byHref) {
    return byHref;
  }

  const sameType = options.filter((o) => o.personType === stored.personType);
  if (sameType.length === 1) {
    return sameType[0];
  }

  return null;
}

export function isContextSelectionPageHtml(html: string): boolean {
  if (!html || html.length < 120) {
    return false;
  }

  return (
    /Wyb[oó]r kontekstu logowania/i.test(html) ||
    /Wybierz kontekst logowania/i.test(html) ||
    (/WyborKontekstu/i.test(html) &&
      /WybierzKontekst/i.test(html) &&
      /list-group-item/i.test(html))
  );
}

export function urlIndicatesContextSelection(url: string): boolean {
  return /\/WyborKontekstu/i.test(url);
}

function parseContextHref(
  href: string
): Pick<LoginContextOption, "href" | "personType" | "id"> | null {
  const trimmed = href.trim();
  if (!trimmed || !trimmed.includes("WybierzKontekst")) {
    return null;
  }

  let url: URL;
  try {
    url = new URL(trimmed, WD_BASE_URL);
  } catch {
    return null;
  }

  const personTypeRaw = url.searchParams.get("personType");
  const personType = personTypeRaw
    ? Number.parseInt(personTypeRaw, 10)
    : Number.NaN;
  if (!Number.isFinite(personType)) {
    return null;
  }

  const id = url.searchParams.get("id") ?? undefined;
  const path = `${url.pathname}${url.search}`;

  return {
    href: path,
    personType,
    id,
  };
}

export function parseContextSelectionOptions(html: string): LoginContextOption[] {
  const { document } = parseHTML(html);
  const options: LoginContextOption[] = [];

  document
    .querySelectorAll('a.list-group-item[href*="WybierzKontekst"]')
    .forEach((anchor) => {
      const hrefAttr = anchor.getAttribute("href");
      if (!hrefAttr) {
        return;
      }

      const parsed = parseContextHref(hrefAttr);
      if (!parsed) {
        return;
      }

      const title =
        anchor.querySelector("h5")?.textContent?.replace(/\s+/g, " ").trim() ??
        "";
      const subtitleEl = anchor.querySelector(".text-start div");
      const subtitle = subtitleEl?.textContent?.replace(/\s+/g, " ").trim();

      options.push({
        ...parsed,
        title,
        subtitle: subtitle || undefined,
      });
    });

  return options;
}

/** Kontekst studenta (personType=1) — jak przycisk „Student” na portalu. */
export function pickStudentLoginContext(
  options: LoginContextOption[]
): LoginContextOption | null {
  const students = options.filter((o) => o.personType === 1);
  if (students.length === 0) {
    return null;
  }

  const withId = students.filter((o) => o.id);
  if (withId.length >= 1) {
    return withId[0];
  }

  return students[0];
}
