import type {
  GradesSemesterMeta,
  SemesterGrades,
  SubjectGrade,
} from "./grades.types";

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

export function mergeSemesterGrades(
  meta: GradesSemesterMeta,
  subjects: SubjectGrade[]
): SemesterGrades {
  return {
    semester: meta.semester,
    semesterLabel: meta.semesterLabel,
    academicSemester: meta.academicSemester,
    semesterType: meta.semesterType,
    semesterStatus: meta.semesterStatus,
    subjects,
    semesterAverage: computeSemesterAverage(subjects),
  };
}
