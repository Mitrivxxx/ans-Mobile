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

export function extractSemesterInfo(cardHeader: Element): {
  number: string;
  label: string;
  type: string;
  status: string;
} | null {
  const headerText = cardHeader.textContent ?? "";

  const semesterMatch = headerText.match(/Semestr:\s*(\d+)/);
  const semesterNumber = semesterMatch?.[1] ?? "";

  const academicMatch = headerText.match(
    /Semestr akademicki:\s*(.+?)(?:\n|Stan|$)/
  );
  const academicLabel = academicMatch?.[1]?.trim() ?? "";

  const typeMatch = academicLabel.match(/(letni|zimowy)$/);
  const semesterType = typeMatch?.[1] ?? "";

  const statusMatch = headerText.match(/Stan semestru:\s*([^\n<]+)/);
  const semesterStatus = statusMatch?.[1]?.trim() ?? "";

  if (!semesterNumber) return null;

  return {
    number: semesterNumber,
    label: `Semestr ${semesterNumber} (${academicLabel})`,
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
  const seenSemesters = new Set<number>();

  const cards = doc.querySelectorAll("div.card");

  for (const card of Array.from(cards)) {
    const cardHeader = card.querySelector(".card-header");
    if (!cardHeader) continue;

    const semesterInfo = extractSemesterInfo(cardHeader);
    if (!semesterInfo) continue;

    const semesterNumber = parseInt(semesterInfo.number, 10);
    if (seenSemesters.has(semesterNumber)) continue;
    seenSemesters.add(semesterNumber);

    const semesterRequestPath = extractSemesterRequestPath(card);
    if (!semesterRequestPath) {
      console.warn(
        `Nie znaleziono URL semestru dla semestru ${semesterInfo.number}`
      );
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

    semesters.push({
      semester: semesterNumber,
      semesterLabel: semesterInfo.label,
      semesterType: semesterInfo.type,
      semesterAverage,
      subjects,
    });
  }

  semesters.sort((a, b) => a.semester - b.semester);

  return semesters;
}
