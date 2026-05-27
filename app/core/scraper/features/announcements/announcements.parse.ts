import { parseHTML } from "linkedom";

import { assertAuthenticatedHtml } from "../../auth/sessionValidation";
import { WD_BASE_URL } from "../../client/client";
import type { Announcement, AnnouncementDetails } from "./announcements.types";

export type { Announcement, AnnouncementDetails } from "./announcements.types";

function parseDocument(html: string): Document {
  const { document } = parseHTML(html);
  return document;
}

function innerHtml(el: Element | null | undefined): string {
  if (!el) return "";
  return ((el as HTMLElement).innerHTML ?? "").trim();
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

  const items = doc.querySelectorAll(".list-group-item");

  items.forEach((item) => {
    const linkElement = item.querySelector('a[href*="gloszenia/Ogloszenie/"]');
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

      announcements.push({ title, url, id, authorName, date });
    }
  });

  return announcements;
}
