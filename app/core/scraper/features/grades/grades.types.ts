export interface SubjectGrade {
  subject: string;
  teacher: string;
  finalGrade: string;
  subjectWeight: number;
  weightedAverage: string;
  partialGrades: unknown[];
}

export interface SemesterGrades {
  semester: number;
  semesterLabel: string;
  semesterType: string;
  semesterAverage: string;
  subjects: SubjectGrade[];
}

export interface RawSubjectData {
  subject: string;
  teacher: string;
  finalGrade: string;
}
