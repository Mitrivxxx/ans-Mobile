import { parseHTML } from "linkedom";

import { mapWithConcurrency } from "../../../utils/mapWithConcurrency";
import { assertAuthenticatedHtml } from "../../auth/sessionValidation";
import {
  fetchGradesPage,
  fetchSemesterSubjects,
} from "./grades.fetch";
import { pickPrioritySemesterNumber } from "./pickPrioritySemester";
import type {
  PartialGradeEntry,
  RawSubjectData,
  SemesterGrades,
  SubjectActivityDetails,
  SubjectGrade,
} from "./grades.types";

const SEMESTER_FETCH_CONCURRENCY = 4;

export type GradesProgressCallback = (semesters: SemesterGrades[]) => void;

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

/** Wartość z <b> w <span>, np. „Semestr akademicki: <b>2025/2026 letni</b>”. */
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

function mergeSemesterMetadata(
  target: SemesterGrades,
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

function computeSemesterAverage(subjects: SubjectGrade[]): string {
  if (subjects.length === 0) {
    return "0";
  }

  const average =
    subjects.reduce(
      (sum, subject) =>
        sum + (parseFloat(subject.finalGrade.replace(",", ".")) || 0),
      0
    ) / subjects.length;

  return average.toFixed(2);
}

function createSemesterEntry(
  semesterInfo: NonNullable<ReturnType<typeof extractSemesterInfo>>,
  semesterNumber: number
): SemesterGrades {
  return {
    semester: semesterNumber,
    semesterLabel: semesterInfo.label,
    academicSemester: semesterInfo.academicSemester,
    semesterType: semesterInfo.type,
    semesterStatus: semesterInfo.status,
    semesterAverage: "0",
    subjects: [],
  };
}

type SemesterFetchJob = {
  semesterNumber: number;
  path: string;
};

function snapshotSemesters(semesters: SemesterGrades[]): SemesterGrades[] {
  return semesters.map((semester) => ({
    ...semester,
    subjects: [...semester.subjects],
  }));
}

function applySemesterSubjects(
  semesters: SemesterGrades[],
  semesterNumber: number,
  subjects: SubjectGrade[]
): void {
  const entry = semesters.find((semester) => semester.semester === semesterNumber);
  if (!entry) {
    return;
  }

  entry.subjects = subjects;
  entry.semesterAverage = computeSemesterAverage(subjects);
}

async function fetchSemesterSubjectsJob(
  job: SemesterFetchJob
): Promise<{ semesterNumber: number; subjects: SubjectGrade[] }> {
  const { semesterNumber, path } = job;

  try {
    const subjectsHtml = await fetchSemesterSubjects(path);
    assertAuthenticatedHtml(
      subjectsHtml,
      `Sesja wygasła — nie można pobrać przedmiotów semestru ${semesterNumber}.`
    );
    return {
      semesterNumber,
      subjects: buildSubjectGrades(extractSubjectsFromTable(subjectsHtml)),
    };
  } catch (error) {
    console.error(
      `Błąd pobierania przedmiotów dla semestru ${semesterNumber}:`,
      error
    );
    return { semesterNumber, subjects: [] };
  }
}

function discoverGradesSemesters(gradesHtml: string): {
  semesters: SemesterGrades[];
  fetchJobs: Map<number, string>;
} {
  const doc = parseDocument(gradesHtml);
  const semesters: SemesterGrades[] = [];
  const fetchJobs = new Map<number, string>();
  const cards = doc.querySelectorAll("div.card");

  for (const card of Array.from(cards)) {
    const semesterInfo = extractSemesterInfo(card);
    if (!semesterInfo) continue;

    const semesterNumber = parseInt(semesterInfo.number, 10);
    let existing = semesters.find((entry) => entry.semester === semesterNumber);

    if (existing) {
      mergeSemesterMetadata(existing, semesterInfo);
      if (existing.subjects.length > 0) {
        continue;
      }
    } else {
      existing = createSemesterEntry(semesterInfo, semesterNumber);
      semesters.push(existing);
    }

    const semesterRequestPath = extractSemesterRequestPath(card);
    if (!semesterRequestPath) {
      console.warn(
        `Nie znaleziono URL semestru dla semestru ${semesterInfo.number}`
      );
      continue;
    }

    fetchJobs.set(semesterNumber, semesterRequestPath);
  }

  return { semesters, fetchJobs };
}

export async function parseGrades(
  onProgress?: GradesProgressCallback
): Promise<SemesterGrades[]> {
  const gradesHtml = await fetchGradesPage();
  assertAuthenticatedHtml(gradesHtml);

  const { semesters, fetchJobs } = discoverGradesSemesters(gradesHtml);

  const pendingFetches: SemesterFetchJob[] = Array.from(
    fetchJobs.entries(),
    ([semesterNumber, path]) => ({ semesterNumber, path })
  );

  if (pendingFetches.length === 0) {
    return semesters;
  }

  const priority = pickPrioritySemesterNumber(semesters);
  const priorityJob = pendingFetches.find(
    (job) => job.semesterNumber === priority
  );
  const remainingJobs = pendingFetches.filter(
    (job) => job.semesterNumber !== priority
  );

  if (priorityJob) {
    const priorityResult = await fetchSemesterSubjectsJob(priorityJob);
    applySemesterSubjects(
      semesters,
      priorityResult.semesterNumber,
      priorityResult.subjects
    );
    onProgress?.(snapshotSemesters(semesters));
  }

  if (remainingJobs.length > 0) {
    const fetchResults = await mapWithConcurrency(
      remainingJobs,
      SEMESTER_FETCH_CONCURRENCY,
      fetchSemesterSubjectsJob
    );

    for (const result of fetchResults) {
      applySemesterSubjects(semesters, result.semesterNumber, result.subjects);
    }

    onProgress?.(snapshotSemesters(semesters));
  }

  semesters.sort((a, b) => a.semester - b.semester);

  return semesters;
}
