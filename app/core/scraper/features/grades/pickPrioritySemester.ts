import type { SemesterGrades } from "./grades.types";

const ACTIVE_STATUS_KEYWORD = "w trakcie nauki";

/** Numer semestru do pierwszego pobrania (aktywny lub najwyższy). */
export function pickPrioritySemesterNumber(
  semesters: SemesterGrades[]
): number | null {
  if (semesters.length === 0) {
    return null;
  }

  const active = semesters.find((semester) =>
    semester.semesterStatus.toLowerCase().includes(ACTIVE_STATUS_KEYWORD)
  );

  if (active) {
    return active.semester;
  }

  return semesters.reduce((highest, current) =>
    current.semester > highest.semester ? current : highest
  ).semester;
}

export function pickActiveSemester(
  semesters: SemesterGrades[]
): SemesterGrades | null {
  const priority = pickPrioritySemesterNumber(semesters);
  if (priority === null) {
    return null;
  }

  return semesters.find((semester) => semester.semester === priority) ?? null;
}
