import { parseHTML } from "linkedom";

import {
  fetchGradesPage,
  fetchSemesterSubjects,
} from "./grades.fetch";
import type { RawSubjectData, SemesterGrades, SubjectGrade } from "./grades.types";

export type {
  RawSubjectData,
  SemesterGrades,
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

    if (subject && teacher) {
      subjects.push({ subject, teacher, finalGrade });
    }
  });

  return subjects;
}

export async function parseGrades(): Promise<SemesterGrades[]> {
  const gradesHtml = await fetchGradesPage();
  const doc = parseDocument(gradesHtml);

  const semesters: SemesterGrades[] = [];
  const cards = doc.querySelectorAll("div.card");

  for (const card of Array.from(cards)) {
    const semesterInfo = extractSemesterInfo(card);
    if (!semesterInfo) continue;

    const semesterNumber = parseInt(semesterInfo.number, 10);
    const existing = semesters.find((s) => s.semester === semesterNumber);

    if (existing) {
      mergeSemesterMetadata(existing, semesterInfo);
      if (existing.subjects.length > 0) {
        continue;
      }
    }

    const semesterRequestPath = extractSemesterRequestPath(card);
    if (!semesterRequestPath) {
      if (!existing) {
        console.warn(
          `Nie znaleziono URL semestru dla semestru ${semesterInfo.number}`
        );
      }
      continue;
    }

    let subjects: SubjectGrade[] = [];

    try {
      const subjectsHtml = await fetchSemesterSubjects(semesterRequestPath);
      const rawSubjects = extractSubjectsFromTable(subjectsHtml);

      for (const subject of rawSubjects) {
        subjects.push({
          subject: subject.subject,
          teacher: subject.teacher,
          finalGrade: subject.finalGrade,
          subjectWeight: 1,
          weightedAverage: subject.finalGrade,
          partialGrades: [],
        });
      }
    } catch (error) {
      console.error(
        `Błąd pobierania przedmiotów dla semestru ${semesterInfo.number}:`,
        error
      );
    }

    const semesterAverage =
      subjects.length > 0
        ? (
            subjects.reduce(
              (sum, s) =>
                sum + (parseFloat(s.finalGrade.replace(",", ".")) || 0),
              0
            ) / subjects.length
          ).toFixed(2)
        : "0";

    const entry: SemesterGrades = {
      semester: semesterNumber,
      semesterLabel: semesterInfo.label,
      academicSemester: semesterInfo.academicSemester,
      semesterType: semesterInfo.type,
      semesterStatus: semesterInfo.status,
      semesterAverage,
      subjects,
    };

    if (existing) {
      Object.assign(existing, {
        ...entry,
        academicSemester:
          entry.academicSemester || existing.academicSemester,
        semesterStatus: entry.semesterStatus || existing.semesterStatus,
        semesterType: entry.semesterType || existing.semesterType,
        semesterLabel: entry.semesterLabel || existing.semesterLabel,
      });
    } else {
      semesters.push(entry);
    }
  }

  semesters.sort((a, b) => a.semester - b.semester);

  return semesters;
}
