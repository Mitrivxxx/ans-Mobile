import { parseGrades } from "./grades.parse";
import type { SemesterGrades } from "./grades.types";

export class GradesService {
  async getGrades(): Promise<SemesterGrades[]> {
    return parseGrades();
  }
}

export type { SemesterGrades, SubjectGrade } from "./grades.types";
