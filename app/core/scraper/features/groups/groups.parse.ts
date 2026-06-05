import { parseHTML } from "linkedom";

import { assertAuthenticatedHtml } from "../../auth/sessionValidation";
import {
  fetchGroupsPage,
  fetchGroupsPageForSemester,
} from "./groups.fetch";
import type {
  GroupsSemesterOption,
  StudentGroupEntry,
  StudentGroupsData,
} from "./groups.types";

function parseDocument(html: string): Document {
  const { document } = parseHTML(html);
  return document;
}

function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function normalizeSemesterLabel(label: string): string {
  return normalizeText(label).toLowerCase();
}

function addSemesterOption(
  options: GroupsSemesterOption[],
  seen: Set<string>,
  id: string,
  label: string
): void {
  const normalizedId = id.trim();
  const normalizedLabel = normalizeText(label);
  if (!normalizedId || !normalizedLabel || seen.has(normalizedId)) {
    return;
  }
  seen.add(normalizedId);
  options.push({ id: normalizedId, label: normalizedLabel });
}

export function parseGroupsSemesterOptions(
  html: string
): GroupsSemesterOption[] {
  const options: GroupsSemesterOption[] = [];
  const seen = new Set<string>();

  const itemsInfoStart = html.indexOf("'itemsInfo':");
  if (itemsInfoStart >= 0) {
    const block = html.slice(itemsInfoStart, itemsInfoStart + 80_000);
    const itemPattern = /'value':\s*'([^']*)',\s*'text':\s*'([^']*)'/g;
    for (const match of block.matchAll(itemPattern)) {
      addSemesterOption(options, seen, match[1], match[2]);
    }
  }

  const doc = parseDocument(html);

  for (const option of Array.from(doc.querySelectorAll("option"))) {
    const value = option.getAttribute("value") ?? "";
    const label = normalizeText(option.textContent ?? "");
    if (value && label) {
      addSemesterOption(options, seen, value, label);
    }
  }

  return options;
}

export function parseSelectedGroupsSemester(
  html: string,
  options: GroupsSemesterOption[] = parseGroupsSemesterOptions(html)
): GroupsSemesterOption | null {
  const doc = parseDocument(html);
  const id =
    doc.querySelector('input[name="s_VI"]')?.getAttribute("value")?.trim() ??
    "";
  const label =
    doc.querySelector('input[name="s"]')?.getAttribute("value")?.trim() ?? "";

  if (id && label) {
    return { id, label: normalizeText(label) };
  }

  const lastSuccessMatch = html.match(/'lastSuccessValue':\s*'(\d+)'/);
  const lastSuccessId = lastSuccessMatch?.[1] ?? "";
  if (lastSuccessId) {
    return options.find((option) => option.id === lastSuccessId) ?? null;
  }

  return null;
}

export function resolveSemesterOption(
  options: GroupsSemesterOption[],
  academicSemester: string
): GroupsSemesterOption | null {
  if (options.length === 0) {
    return null;
  }

  const target = normalizeSemesterLabel(academicSemester);
  const exact = options.find(
    (option) => normalizeSemesterLabel(option.label) === target
  );
  if (exact) {
    return exact;
  }

  const partial = options.find((option) =>
    normalizeSemesterLabel(option.label).includes(target)
  );
  return partial ?? null;
}

export function parseStudentGroupsTable(html: string): StudentGroupEntry[] {
  const doc = parseDocument(html);
  const tables = Array.from(doc.querySelectorAll("table"));

  for (const table of tables) {
    const headers = Array.from(table.querySelectorAll("thead th")).map((th) =>
      normalizeText(th.textContent ?? "")
    );

    const formIndex = headers.findIndex((header) =>
      header.toLowerCase().includes("forma zaj")
    );
    const codeIndex = headers.findIndex((header) =>
      header.toLowerCase().includes("kod grupy")
    );

    if (formIndex < 0 || codeIndex < 0) {
      continue;
    }

    const groups: StudentGroupEntry[] = [];

    for (const row of Array.from(table.querySelectorAll("tbody tr"))) {
      const cells = Array.from(row.querySelectorAll("td")).map((cell) =>
        normalizeText(cell.textContent ?? "")
      );

      const activityForm = cells[formIndex] ?? "";
      const groupCode = cells[codeIndex] ?? "";

      if (!activityForm || !groupCode) {
        continue;
      }

      groups.push({ activityForm, groupCode });
    }

    if (groups.length > 0) {
      return groups;
    }
  }

  return [];
}

function resolveTargetSemester(
  options: GroupsSemesterOption[],
  current: GroupsSemesterOption | null,
  academicSemester: string | null | undefined
): GroupsSemesterOption | null {
  if (academicSemester) {
    const fromGrades = resolveSemesterOption(options, academicSemester);
    if (fromGrades) {
      return fromGrades;
    }
  }

  return current ?? options[0] ?? null;
}

export async function parseStudentGroups(
  academicSemester?: string | null
): Promise<StudentGroupsData> {
  const baseHtml = await fetchGroupsPage();
  assertAuthenticatedHtml(
    baseHtml,
    "Sesja wygasła — nie można pobrać grup studenta."
  );

  const semesterOptions = parseGroupsSemesterOptions(baseHtml);
  const currentSemester = parseSelectedGroupsSemester(
    baseHtml,
    semesterOptions
  );
  const targetSemester = resolveTargetSemester(
    semesterOptions,
    currentSemester,
    academicSemester
  );

  const baseGroups = parseStudentGroupsTable(baseHtml);
  const canUseBasePage =
    targetSemester != null &&
    currentSemester != null &&
    targetSemester.id === currentSemester.id &&
    baseGroups.length > 0;

  if (canUseBasePage || (targetSemester == null && baseGroups.length > 0)) {
    return {
      academicSemester:
        targetSemester?.label ??
        currentSemester?.label ??
        academicSemester ??
        "",
      groups: baseGroups,
    };
  }

  if (!targetSemester) {
    return {
      academicSemester: academicSemester ?? currentSemester?.label ?? "",
      groups: baseGroups,
    };
  }

  const html = await fetchGroupsPageForSemester(
    targetSemester.id,
    targetSemester.label
  );
  assertAuthenticatedHtml(
    html,
    "Sesja wygasła — nie można pobrać grup studenta."
  );

  return {
    academicSemester: targetSemester.label,
    groups: parseStudentGroupsTable(html),
  };
}
