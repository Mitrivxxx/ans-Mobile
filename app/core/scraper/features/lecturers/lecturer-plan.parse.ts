import { parseHTML } from "linkedom";

import type { Lesson } from "../plan/plan.parse";

function cellText(td: Element): string {
  return (td.textContent ?? "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getRowCells(row: Element): Element[] {
  return Array.from(row.children).filter(
    (node): node is Element => node.tagName === "TD"
  );
}

function getDataCellTexts(row: Element): string[] {
  const tds = getRowCells(row);
  let start = 0;
  let end = tds.length;

  const firstClass = tds[0]?.getAttribute("class") ?? "";
  if (
    firstClass.includes("dxgvIndentCell") ||
    firstClass.includes("dxgvCommandColumn")
  ) {
    start = 1;
  } else if (!cellText(tds[0] ?? ({} as Element)) && tds.length >= 10) {
    start = 1;
  }

  const lastClass = tds[end - 1]?.getAttribute("class") ?? "";
  if (lastClass.includes("dxgvAIC")) {
    end -= 1;
  }

  return tds.slice(start, end).map(cellText);
}

function extractGroupDate(text: string): string | null {
  const m = text.match(/Data\s*Zaj[eę][ćc]:\s*(\d{4}\.\d{2}\.\d{2})/i);
  return m?.[1] ?? null;
}

function isDataRowId(id: string): boolean {
  return /gridViewPlanyProwadzacych_DXDataRow\d*$/i.test(id);
}

function isGroupRowId(id: string): boolean {
  return id.includes("DXGroupRow");
}

/**
 * Kolejność: Czas od, Czas do, Liczba godzin, Sala, Forma zaj., Zajęcia, Grupy, …
 */
export function parseLecturerPlan(html: string): Lesson[] {
  const { document } = parseHTML(html);
  const lessons: Lesson[] = [];
  let currentDate = "";

  const rows = document.querySelectorAll(
    '#gridViewPlanyProwadzacych_DXMainTable tr[id], tr[id*="gridViewPlanyProwadzacych"]'
  );

  rows.forEach((row) => {
    const rowId = row.getAttribute("id") ?? "";
    if (!rowId) return;

    if (isGroupRowId(rowId)) {
      const d = extractGroupDate(row.textContent ?? "");
      if (d) currentDate = d;
      return;
    }

    if (!isDataRowId(rowId)) return;

    const cells = getDataCellTexts(row);
    if (cells.length < 6) return;

    const from = cells[0] ?? "";
    const subject = cells[5] ?? "";
    if (!from && !subject) return;

    lessons.push({
      date: currentDate,
      from,
      to: cells[1] ?? "",
      duration: cells[2] ?? "",
      room: cells[3] ?? "",
      teacher: "",
      subject,
      type: cells[4] ?? "",
      groups: cells[6] ?? "",
      notes: cells[12] ?? cells[11] ?? "",
    });
  });

  return lessons;
}

export function lecturerGridHasDataRows(html: string): boolean {
  return /gridViewPlanyProwadzacych_DXDataRow/i.test(html);
}
