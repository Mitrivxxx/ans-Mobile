import { parseHTML } from "linkedom";

import { assertAuthenticatedHtml } from "../../auth/sessionValidation";
import {
  fetchGradesPage,
  fetchSemesterSubjects,
} from "./grades.fetch";
import { mergeSemesterGrades } from "./mergeSemesterGrades";
import type {
  GradesIndex,
  GradesSemesterMeta,
  PartialGradeEntry,
  RawSubjectData,
  SemesterGrades,
  SubjectActivityDetails,
  SubjectGrade,
} from "./grades.types";

export type {
  PartialGradeEntry,
  RawSubjectData,
  SemesterGrades,
  SubjectActivityDetails,
  SubjectGrade,
} from "./grades.types";

function parseDocument(html: string): Document {
  const { document } = parseHTML(html);
  return document;
}

function innerHtml(el: Element | null | undefined): string {
  if (!el) return "";
  return ((el as HTMLElement).innerHTML ?? "").trim();
}

function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function extractBoldLabeledValue(root: Element, label: string): string {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const labelRegex = new RegExp(`${escaped}\\s*:`, "i");

  for (const el of Array.from(root.querySelectorAll("span"))) {
    const text = normalizeText(el.textContent ?? "");
    if (!labelRegex.test(text)) continue;

    const bold = el.querySelector("b, strong");
    if (bold) {
      const value = normalizeText(bold.textContent ?? "");
      if (value) return value;
    }

    const inline = text.match(new RegExp(`${escaped}\\s*:\\s*(.+)$`, "i"));
    if (inline?.[1]) {
      return normalizeText(inline[1]);
    }
  }

  return "";
}

function extractSemesterNumber(card: Element): string {
  for (const span of Array.from(card.querySelectorAll("span"))) {
    const text = normalizeText(span.textContent ?? "");
    if (text.includes("akademicki") || text.includes("Stan semestru")) {
      continue;
    }
    if (!/^Semestr:\s*\d/i.test(text)) {
      continue;
    }

    const bold = span.querySelector("b, strong");
    if (bold) {
      const value = normalizeText(bold.textContent ?? "");
      if (/^\d+$/.test(value)) {
        return value;
      }
    }
  }

  const text = normalizeText(card.textContent ?? "");
  const match = text.match(/(?:^|\s)Semestr:\s*(\d+)/i);
  return match?.[1] ?? "";
}

function extractFromCardText(card: Element): {
  academicSemester: string;
  status: string;
} {
  const text = normalizeText(card.textContent ?? "");

  const academicMatch = text.match(
    /Semestr akademicki:\s*(.+?)\s*Stan semestru:/i
  );
  const statusMatch = text.match(/Stan semestru:\s*(.+?)(?:\s{2,}|$)/i);

  return {
    academicSemester: academicMatch?.[1]?.trim() ?? "",
    status: statusMatch?.[1]?.trim() ?? "",
  };
}

export function extractSemesterInfo(card: Element): {
  number: string;
  label: string;
  academicSemester: string;
  type: string;
  status: string;
} | null {
  const semesterNumber = extractSemesterNumber(card);
  if (!semesterNumber) return null;

  let academicSemester = extractBoldLabeledValue(card, "Semestr akademicki");
  let semesterStatus = extractBoldLabeledValue(card, "Stan semestru");

  if (!academicSemester || !semesterStatus) {
    const fromText = extractFromCardText(card);
    academicSemester = academicSemester || fromText.academicSemester;
    semesterStatus = semesterStatus || fromText.status;
  }

  const typeMatch = academicSemester.match(/\b(letni|zimowy)\b/i);
  const semesterType = typeMatch?.[1]?.toLowerCase() ?? "";

  return {
    number: semesterNumber,
    academicSemester,
    label: academicSemester
      ? `Semestr ${semesterNumber} (${academicSemester})`
      : `Semestr ${semesterNumber}`,
    type: semesterType,
    status: semesterStatus,
  };
}


export function extractSemesterRequestPath(
  cardElement: Element
): string | null {
  const buttons = cardElement.querySelectorAll(
    'button[onclick*="rozwinZwin"]'
  );

  for (const button of Array.from(buttons)) {
    const onclick = button.getAttribute("onclick") ?? "";
    const pathMatch = onclick.match(
      /rozwinZwin\('\d+','[^']*','([^']+)'\)/
    );
    if (pathMatch?.[1]) {
      return pathMatch[1].replace(/&amp;/g, "&");
    }
  }

  return null;
}

function extractPplsIdFromRow(row: Element): number | null {
  const onclick =
    row
      .querySelector('button[onclick*="onPokazOcenyClick"]')
      ?.getAttribute("onclick") ??
    row.querySelector('[onclick*="onPokazOcenyClick"]')?.getAttribute("onclick") ??
    "";

  const match = onclick.match(/onPokazOcenyClick\([^,]+,\s*(\d+)/);
  if (!match?.[1]) return null;

  const pplsId = parseInt(match[1], 10);
  return Number.isNaN(pplsId) ? null : pplsId;
}

function parseWocTable(wocTable: Element | null): PartialGradeEntry[] {
  if (!wocTable) return [];

  const entries: PartialGradeEntry[] = [];

  for (const row of Array.from(wocTable.querySelectorAll("tr"))) {
    if (row.querySelector("th")) continue;

    const cells = Array.from(row.querySelectorAll("td")).map((cell) =>
      normalizeText(cell.textContent ?? "")
    );

    if (cells.length === 0 || cells.every((cell) => !cell)) continue;

    if (cells.length === 1) {
      entries.push({ label: "", value: cells[0] });
      continue;
    }

    if (cells.length === 2) {
      entries.push({ label: cells[0], value: cells[1] });
      continue;
    }

    const gradeIdx = cells.findIndex((cell) =>
      /^[\d]+([.,][\d]+)?$/.test(cell)
    );
    const value =
      gradeIdx >= 0 ? cells[gradeIdx] : cells[cells.length - 1] ?? "";
    const labelParts = cells.filter(
      (cell, index) => index !== gradeIdx && cell !== value
    );

    entries.push({
      label: labelParts.filter(Boolean).join(" · "),
      value,
    });
  }

  return entries;
}

export function parsePartialGradesHtml(
  html: string
): SubjectActivityDetails[] {
  assertAuthenticatedHtml(
    html,
    "Sesja wygasła — nie można pobrać szczegółów ocen."
  );
  const doc = parseDocument(html);
  const table = doc.querySelector("table");
  if (!table) return [];

  const activities: SubjectActivityDetails[] = [];

  for (const row of Array.from(table.querySelectorAll("tbody tr"))) {
    const cells = row.querySelectorAll("td");
    if (cells.length < 4) continue;

    const form = normalizeText(cells[2].textContent ?? "");
    if (!form) continue;

    const finalGrade = normalizeText(cells[3].textContent ?? "");
    const woc =
      cells[4]?.querySelector("table.woc") ??
      cells[cells.length - 1]?.querySelector("table.woc") ??
      null;

    activities.push({
      form,
      finalGrade,
      partialGrades: parseWocTable(woc),
    });
  }

  return activities;
}

export function extractSubjectsFromTable(
  tableHtml: string
): RawSubjectData[] {
  const subjects: RawSubjectData[] = [];
  const doc = parseDocument(tableHtml);
  const table = doc.querySelector("table");

  if (!table) return subjects;

  const rows = table.querySelectorAll("tbody tr");

  rows.forEach((row) => {
    if (row.getAttribute("style")?.includes("display:none")) return;

    const cells = row.querySelectorAll("td");
    if (cells.length < 7) return;

    const subjectCell = innerHtml(cells[1]);
    const subjectMatch = subjectCell.match(/<a[^>]*>([^<]+)<\/a>/);
    const subject = subjectMatch?.[1]?.trim() ?? "";

    const teacherMatch = subjectCell.match(/<br[^>]*>\s*([^<]+)/);
    const teacher = teacherMatch?.[1]?.trim() ?? "";

    const finalGrade = (cells[6].textContent ?? "").trim();
    const pplsId = extractPplsIdFromRow(row);

    if (subject && teacher) {
      subjects.push({ subject, teacher, finalGrade, pplsId });
    }
  });

  return subjects;
}

function buildSubjectGrades(rawSubjects: RawSubjectData[]): SubjectGrade[] {
  return rawSubjects.map((subject) => ({
    subject: subject.subject,
    teacher: subject.teacher,
    finalGrade: subject.finalGrade,
    subjectWeight: 1,
    weightedAverage: subject.finalGrade,
    pplsId: subject.pplsId,
    partialGrades: [],
  }));
}

function createSemesterMeta(
  semesterInfo: NonNullable<ReturnType<typeof extractSemesterInfo>>,
  semesterNumber: number,
  requestPath: string
): GradesSemesterMeta {
  return {
    semester: semesterNumber,
    semesterLabel: semesterInfo.label,
    academicSemester: semesterInfo.academicSemester,
    semesterType: semesterInfo.type,
    semesterStatus: semesterInfo.status,
    requestPath,
  };
}

function mergeSemesterMetaFields(
  target: GradesSemesterMeta,
  source: ReturnType<typeof extractSemesterInfo>
): void {
  if (!source) return;

  if (source.academicSemester && !target.academicSemester) {
    target.academicSemester = source.academicSemester;
    target.semesterLabel = source.label;
    target.semesterType = source.type;
  }

  if (source.status && !target.semesterStatus) {
    target.semesterStatus = source.status;
  }
}

export function discoverGradesIndex(gradesHtml: string): GradesIndex {
  const doc = parseDocument(gradesHtml);
  const semesters: GradesSemesterMeta[] = [];
  let initialSemesterNumber: number | null = null;
  const cards = doc.querySelectorAll("div.card");

  for (const card of Array.from(cards)) {
    const semesterInfo = extractSemesterInfo(card);
    if (!semesterInfo) continue;

    const semesterNumber = parseInt(semesterInfo.number, 10);
    const semesterRequestPath = extractSemesterRequestPath(card);
    if (!semesterRequestPath) {
      console.warn(
        `Nie znaleziono URL semestru dla semestru ${semesterInfo.number}`
      );
      continue;
    }

    if (initialSemesterNumber === null) {
      initialSemesterNumber = semesterNumber;
    }

    let existing = semesters.find((entry) => entry.semester === semesterNumber);

    if (existing) {
      mergeSemesterMetaFields(existing, semesterInfo);
      continue;
    }

    semesters.push(
      createSemesterMeta(semesterInfo, semesterNumber, semesterRequestPath)
    );
  }

  semesters.sort((a, b) => a.semester - b.semester);

  return {
    semesters,
    initialSemesterNumber:
      initialSemesterNumber ?? semesters[0]?.semester ?? 0,
  };
}

export async function parseGradesIndex(): Promise<GradesIndex> {
  const gradesHtml = await fetchGradesPage();
  assertAuthenticatedHtml(gradesHtml);
  return discoverGradesIndex(gradesHtml);
}

export async function parseSemesterGrades(
  meta: GradesSemesterMeta
): Promise<SemesterGrades> {
  const subjectsHtml = await fetchSemesterSubjects(meta.requestPath);
  assertAuthenticatedHtml(
    subjectsHtml,
    `Sesja wygasła — nie można pobrać przedmiotów semestru ${meta.semester}.`
  );
  const subjects = buildSubjectGrades(extractSubjectsFromTable(subjectsHtml));
  return mergeSemesterGrades(meta, subjects);
}
