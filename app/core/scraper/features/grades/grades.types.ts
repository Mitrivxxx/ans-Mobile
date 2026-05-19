export interface PartialGradeEntry {
  label: string;
  value: string;
}

export interface SubjectActivityDetails {
  form: string;
  finalGrade: string;
  partialGrades: PartialGradeEntry[];
}

export interface SubjectGrade {
  subject: string;
  teacher: string;
  finalGrade: string;
  subjectWeight: number;
  weightedAverage: string;
  pplsId: number | null;
  partialGrades: SubjectActivityDetails[];
}

export interface SemesterGrades {
  semester: number;
  semesterLabel: string;
  /** Np. „2025/2026 zimowy” z pola Semestr akademicki. */
  academicSemester: string;
  semesterType: string;
  /** Np. „Zaliczony” ze Stan semestru. */
  semesterStatus: string;
  semesterAverage: string;
  subjects: SubjectGrade[];
}

export interface RawSubjectData {
  subject: string;
  teacher: string;
  finalGrade: string;
  pplsId: number | null;
}
