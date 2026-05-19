import {
  parseGrades,
  parsePartialGradesHtml,
  type GradesProgressCallback,
} from "./grades.parse";
import { fetchPartialGrades } from "./grades.fetch";
import type { SemesterGrades, SubjectActivityDetails } from "./grades.types";

export class GradesService {
  async getGrades(onProgress?: GradesProgressCallback): Promise<SemesterGrades[]> {
    return parseGrades(onProgress);
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
