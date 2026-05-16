import { parseHTML } from "linkedom";

import type { LecturerSearchResult } from "./lecturers.types";

export type { LecturerSearchQuery, LecturerSearchResult } from "./lecturers.types";

function parseDocument(html: string): Document {
  const { document } = parseHTML(html);
  return document;
}

function normalizeCellText(htmlFragment: string): string {
  return htmlFragment
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n")
    .trim();
}

function hiddenInputValue(doc: Document, name: string): string {
  const input = doc.querySelector(`input[name="${name}"]`);
  return input?.getAttribute("value")?.trim() ?? "";
}

function regexHiddenValue(html: string, name: string): string {
  const pattern = new RegExp(
    `name=["']${name}["'][^>]*value=["']([^"']*)["']`,
    "i"
  );
  const match = html.match(pattern);
  return match?.[1]?.trim() ?? "";
}

function regexScriptAssignment(html: string, name: string): string {
  const pattern = new RegExp(`${name}\\s*=\\s*['"]([^'"]+)['"]`, "i");
  const match = html.match(pattern);
  return match?.[1]?.trim() ?? "";
}

function extractEmail(cell: Element | null): string {
  if (!cell) return "";
  const mailto = cell.querySelector('a[href^="mailto:"]');
  const href = mailto?.getAttribute("href") ?? "";
  if (href.startsWith("mailto:")) {
    return href.replace(/^mailto:/i, "").trim();
  }
  const sensitive = cell.querySelector(".sensitive");
  return sensitive?.textContent?.trim() ?? "";
}

function scheduleFromCell(cell: Element | null): {
  schedulePath: string;
  scheduleId: string;
} {
  const href =
    cell?.querySelector('a[href*="/Plany/PlanyProwadzacych/"]')?.getAttribute(
      "href"
    ) ?? "";
  const schedulePath = href.trim();
  const idMatch = schedulePath.match(/PlanyProwadzacych\/(\d+)/i);
  return {
    schedulePath,
    scheduleId: idMatch?.[1] ?? "",
  };
}

export function parseLecturerSearchResults(html: string): LecturerSearchResult[] {
  const doc = parseDocument(html);
  const rows = doc.querySelectorAll(
    ".table-responsive table.table tbody tr"
  );

  const results: LecturerSearchResult[] = [];

  rows.forEach((row) => {
    const cells = row.querySelectorAll("td");
    if (cells.length < 4) return;

    const name = cells[0]?.textContent?.trim() ?? "";
    if (!name) return;

    const additionalCell = cells[1];
    const additionalInfo = normalizeCellText(
      (additionalCell as HTMLElement | undefined)?.innerHTML ?? ""
    );
    const email = extractEmail(additionalCell ?? null);
    const organizationalUnits = normalizeCellText(
      (cells[2] as HTMLElement | undefined)?.innerHTML ?? ""
    );
    const { schedulePath, scheduleId } = scheduleFromCell(cells[3] ?? null);

    results.push({
      name,
      additionalInfo,
      email,
      organizationalUnits,
      schedulePath,
      scheduleId,
    });
  });

  return results;
}

/** Błąd serwera MVC — nie mylić z tekstem alertu w sprawdzFormularz() na każdej stronie. */
export function hasLecturerSearchValidationError(html: string): boolean {
  const doc = parseDocument(html);
  const summary = doc.querySelector(".validation-summary-errors");
  if (!summary) {
    return false;
  }

  const items = Array.from(summary.querySelectorAll("li"));
  for (const li of items) {
    const style = (li.getAttribute("style") ?? "").replace(/\s/g, "");
    if (style.includes("display:none")) {
      continue;
    }
    const text = li.textContent?.trim() ?? "";
    if (text.length > 0) {
      return true;
    }
  }

  return false;
}

export function extractHiddenFormFields(html: string): Record<string, string> {
  const doc = parseDocument(html);
  const form = doc.querySelector(
    'form#aspnetForm, form[name="aspnetForm"]'
  );
  const fields: Record<string, string> = {};

  form?.querySelectorAll('input[type="hidden"]').forEach((input) => {
    const name = input.getAttribute("name");
    if (!name || name === "DXScript" || name === "DXCss") {
      return;
    }
    fields[name] = input.getAttribute("value") ?? "";
  });

  return fields;
}

function extractDxScriptFromDxResources(html: string): string {
  const keys = new Set<string>();
  const re = /DXR\.axd\?r=([\d_,\-]+)/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    const chunk = match[1].replace(/-/g, ",");
    chunk.split(",").forEach((part) => {
      const key = part.trim();
      if (key) keys.add(key);
    });
  }
  return Array.from(keys).join(",");
}

function extractDxCssFromLinks(html: string): string {
  const doc = parseDocument(html);
  const hrefs: string[] = [];
  doc.querySelectorAll('link[rel="stylesheet"][href]').forEach((link) => {
    const href = link.getAttribute("href")?.trim();
    if (href) hrefs.push(href);
  });
  return hrefs.join(",");
}

export function extractDxFormTokens(html: string): {
  dxScript: string;
  dxCss: string;
} {
  const doc = parseDocument(html);

  const dxScript =
    hiddenInputValue(doc, "DXScript") ||
    regexHiddenValue(html, "DXScript") ||
    regexScriptAssignment(html, "DXScript") ||
    extractDxScriptFromDxResources(html);

  const dxCss =
    hiddenInputValue(doc, "DXCss") ||
    regexHiddenValue(html, "DXCss") ||
    regexScriptAssignment(html, "DXCss") ||
    extractDxCssFromLinks(html);

  return { dxScript, dxCss };
}
