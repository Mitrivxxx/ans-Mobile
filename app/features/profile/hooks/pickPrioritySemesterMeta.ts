import type { GradesSemesterMeta } from "../../../core/scraper/features/grades/grades.service";

const ACTIVE_STATUS_KEYWORD = "w trakcie nauki";

export function pickPrioritySemesterMeta(
  semesters: GradesSemesterMeta[]
): GradesSemesterMeta | null {
  if (semesters.length === 0) {
    return null;
  }

  const active = semesters.find((semester) =>
    semester.semesterStatus.toLowerCase().includes(ACTIVE_STATUS_KEYWORD)
  );

  if (active) {
    return active;
  }

  return semesters.reduce((highest, current) =>
    current.semester > highest.semester ? current : highest
  );
}
