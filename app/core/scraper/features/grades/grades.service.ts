import {
  parseGrades,
  parsePartialGradesHtml,
} from "./grades.parse";
import { fetchPartialGrades } from "./grades.fetch";
import type { SemesterGrades, SubjectActivityDetails } from "./grades.types";

export class GradesService {
  async getGrades(): Promise<SemesterGrades[]> {
    return parseGrades();
  }

  async getPartialGrades(pplsId: number): Promise<SubjectActivityDetails[]> {
    const html = await fetchPartialGrades(pplsId);
    return parsePartialGradesHtml(html);
  }
}

export type {
  PartialGradeEntry,
  SemesterGrades,
  SubjectActivityDetails,
  SubjectGrade,
} from "./grades.types";
