import { parseHTML } from "linkedom";

import { assertAuthenticatedHtml } from "../../auth/sessionValidation";
import { WD_BASE_URL } from "../../client/client";
import type {
  Announcement,
  AnnouncementDetails,
  AnnouncementListIcon,
} from "./announcements.types";

export type { Announcement, AnnouncementDetails } from "./announcements.types";

function parseDocument(html: string): Document {
  const { document } = parseHTML(html);
  return document;
}

function innerHtml(el: Element | null | undefined): string {
  if (!el) return "";
  return ((el as HTMLElement).innerHTML ?? "").trim();
}

function directChildDivs(parent: Element): Element[] {
  return Array.from(parent.children).filter(
    (child) => child.tagName.toUpperCase() === "DIV"
  );
}

const LIST_ICONS = new Set<AnnouncementListIcon>([
  "exclamation",
  "triangle-exclamation",
  "circle-info",
]);

/** WD / Font Awesome: data-icon albo klasy fa-* (HTML często bez svg przed i2svg). */
const ICON_CLASS_RULES: { pattern: RegExp; icon: AnnouncementListIcon }[] = [
  { pattern: /\bfa-(?:circle-info|info-circle)\b/, icon: "circle-info" },
  {
    pattern: /\bfa-(?:triangle-exclamation|exclamation-triangle)\b/,
    icon: "triangle-exclamation",
  },
  { pattern: /\bfa-(?:circle-exclamation)\b/, icon: "exclamation" },
  { pattern: /\bfa-exclamation\b/, icon: "exclamation" },
];

function mapDataIconAttribute(
  raw: string | null | undefined
): AnnouncementListIcon | null {
  const value = raw?.trim();
  if (!value) {
    return null;
  }
  if (value === "circle-exclamation") {
    return "exclamation";
  }
  if (LIST_ICONS.has(value as AnnouncementListIcon)) {
    return value as AnnouncementListIcon;
  }
  return null;
}

function mapIconFromClassName(className: string): AnnouncementListIcon | null {
  const normalized = className.toLowerCase();
  for (const { pattern, icon } of ICON_CLASS_RULES) {
    if (pattern.test(normalized)) {
      return icon;
    }
  }
  return null;
}

function extractListIconFromElement(el: Element): AnnouncementListIcon | null {
  const fromData = mapDataIconAttribute(el.getAttribute("data-icon"));
  if (fromData) {
    return fromData;
  }
  return mapIconFromClassName(el.getAttribute("class") ?? "");
}

function extractListIconFromSubtree(root: Element): AnnouncementListIcon | null {
  for (const el of root.querySelectorAll("[data-icon]")) {
    const icon = extractListIconFromElement(el);
    if (icon) {
      return icon;
    }
  }

  for (const el of root.querySelectorAll("i, svg, span")) {
    const icon = extractListIconFromElement(el);
    if (icon) {
      return icon;
    }
  }

  return null;
}

function listItemIconColumn(item: Element): Element | null {
  return (
    item.querySelector("div.d-flex.justify-content-start.align-items-center") ??
    item.querySelector("div.d-flex.justify-content-start") ??
    item.querySelector("div.ps-1.pe-3") ??
    item.querySelector("div.ps-1")
  );
}

function listItemAttachmentSlot(item: Element): Element | null {
  return item.querySelector("div.d-flex.flex-row.flex-xl-column-reverse");
}

function findAnnouncementLink(item: Element): Element | null {
  if (item.tagName.toUpperCase() === "A") {
    const href = item.getAttribute("href") ?? "";
    if (href.includes("Ogloszenie")) {
      return item;
    }
  }

  return (
    item.querySelector('a[href*="Ogloszenie/"]') ??
    item.querySelector('a[href*="gloszenia/Ogloszenie/"]')
  );
}

/** Ikona priorytetu z kolumny po lewej (nie ze slotu załącznika). */
export function listItemListIcon(item: Element): AnnouncementListIcon | null {
  const iconColumn = listItemIconColumn(item);
  if (iconColumn) {
    const fromColumn = extractListIconFromSubtree(iconColumn);
    if (fromColumn) {
      return fromColumn;
    }
  }

  const attachmentSlot = listItemAttachmentSlot(item);
  for (const el of item.querySelectorAll("[data-icon], i, svg")) {
    if (attachmentSlot?.contains(el)) {
      continue;
    }
    const icon = extractListIconFromElement(el);
    if (icon) {
      return icon;
    }
  }

  return null;
}

/** Uzupełnia pola z cache sprzed listIcon / hasAttachment. */
export function normalizeAnnouncement(
  item: Announcement | (Omit<Announcement, "hasAttachment" | "listIcon"> & Partial<Pick<Announcement, "hasAttachment" | "listIcon">>)
): Announcement {
  return {
    title: item.title,
    url: item.url,
    id: item.id,
    authorName: item.authorName,
    date: item.date,
    hasAttachment: item.hasAttachment ?? false,
    listIcon: item.listIcon ?? null,
  };
}

/** Portal WD: slot załącznika to pusty div lub div z ikoną (zagnieżdżony div). */
export function listItemHasAttachment(item: Element): boolean {
  const roots = directChildDivs(item);
  const container = roots.length === 1 ? roots[0]! : item;
  const outerParts = directChildDivs(container);

  if (outerParts.length >= 2) {
    const contentColumn = outerParts[1]!;
    const rowParts = directChildDivs(contentColumn);

    if (rowParts.length >= 2) {
      return directChildDivs(rowParts[1]!).length > 0;
    }
  }

  const flexSlots = item.querySelectorAll(
    "div.d-flex.flex-row.flex-xl-column-reverse"
  );
  for (const slot of flexSlots) {
    if (directChildDivs(slot).length > 0) {
      return true;
    }
  }

  return false;
}

function extractLabeledField(container: Element, label: string): string {
  const rows = container.querySelectorAll(".col-12.d-flex, .d-flex");
  let found = "";

  rows.forEach((row) => {
    if (found) {
      return;
    }

    const labelDiv = row.querySelector("div:first-child");
    const valueDiv = row.querySelector(".fw-bold");

    if (!labelDiv || !valueDiv) {
      return;
    }

    const labelText = labelDiv.textContent?.trim() ?? "";
    if (labelText.includes(`${label}:`)) {
      found = valueDiv.textContent?.trim() ?? "";
    }
  });

  if (found) {
    return found;
  }

  const text = container.textContent ?? "";
  const match = text.match(new RegExp(`${label}:\\s*([^\\n\\r]+)`, "i"));
  return match?.[1]?.trim() ?? "";
}

export function parseAnnouncementDetails(html: string): AnnouncementDetails {
  assertAuthenticatedHtml(html, "Sesja wygasła — nie można pobrać szczegółów ogłoszenia.");
  const doc = parseDocument(html);

  let content = "";
  let authorName = "Wirtualny Dziekanat";
  let date = "";
  let attachmentUrl: string | null = null;
  let attachmentName: string | null = null;

  const noticeDiv = doc.querySelector(".apr-notice");
  if (noticeDiv) {
    const contentDiv = noticeDiv.querySelector(".text-start.text-wrap");
    if (contentDiv) {
      content = innerHtml(contentDiv);
    }

    const infoRows = noticeDiv.querySelectorAll(".col-12.d-flex");
    infoRows.forEach((row) => {
      const labelDiv = row.querySelector("div:first-child");
      const valueDiv = row.querySelector(".fw-bold");

      if (labelDiv && valueDiv) {
        const labelText = labelDiv.textContent?.trim() ?? "";
        const valueText = valueDiv.textContent?.trim() ?? "";

        if (labelText.includes("Nadawca:")) {
          authorName = valueText;
        } else if (labelText.includes("Opublikowane:")) {
          date = valueText;
        }
      }
    });
  }

  if (!content) {
    const fallbackContent = doc.querySelector('span[data-bind="html: TrescHtml"]');
    if (fallbackContent) {
      content = innerHtml(fallbackContent);
    }
  }

  const attachmentLink = doc.querySelector(
    '.row.no-gutters a[href*="/Shared/PobierzPlik/"]'
  );
  const rawAttachmentHref = attachmentLink?.getAttribute("href")?.trim() ?? "";
  if (rawAttachmentHref) {
    attachmentUrl = rawAttachmentHref.startsWith("http")
      ? rawAttachmentHref
      : `${WD_BASE_URL}${rawAttachmentHref.startsWith("/") ? "" : "/"}${rawAttachmentHref}`;
    attachmentName = attachmentLink?.textContent?.trim() || null;
  }

  return { content, authorName, date, attachmentUrl, attachmentName };
}

export function parseAnnouncements(html: string): Announcement[] {
  assertAuthenticatedHtml(html, "Sesja wygasła — nie można pobrać ogłoszeń.");
  const doc = parseDocument(html);
  const announcements: Announcement[] = [];

  const items = doc.querySelectorAll(
    ".list-group-item, .list-group > li, a.list-group-item"
  );

  items.forEach((item) => {
    const linkElement = findAnnouncementLink(item);
    const titleElement = item.querySelector("h6");

    if (linkElement && titleElement) {
      const url = linkElement.getAttribute("href") ?? "";
      let title = titleElement.textContent?.trim() ?? "";

      title = title.replace(/^"|"$/g, "").trim();

      const urlParts = url.split("/");
      const id = urlParts[urlParts.length - 1] ?? "";

      const authorName =
        extractLabeledField(item, "Nadawca") || "Wirtualny Dziekanat";
      const date = extractLabeledField(item, "Opublikowane");

      announcements.push({
        title,
        url,
        id,
        authorName,
        date,
        hasAttachment: listItemHasAttachment(item),
        listIcon: listItemListIcon(item),
      });
    }
  });

  return announcements.map(normalizeAnnouncement);
}
