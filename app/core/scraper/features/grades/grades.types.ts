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

export interface GradesSemesterMeta {
  semester: number;
  semesterLabel: string;
  academicSemester: string;
  semesterType: string;
  semesterStatus: string;
  requestPath: string;
}

export interface GradesIndex {
  semesters: GradesSemesterMeta[];
  initialSemesterNumber: number;
}

export interface SemesterGrades {
  semester: number;
  semesterLabel: string;
  academicSemester: string;
  semesterType: string;
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
