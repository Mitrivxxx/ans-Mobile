import { fetchPartialGrades } from "./grades.fetch";
import {
  parseGradesIndex,
  parsePartialGradesHtml,
  parseSemesterGrades,
} from "./grades.parse";
import type {
  GradesIndex,
  GradesSemesterMeta,
  SemesterGrades,
  SubjectActivityDetails,
} from "./grades.types";

export class GradesService {
  async getGradesIndex(): Promise<GradesIndex> {
    return parseGradesIndex();
  }

  async getSemesterGrades(meta: GradesSemesterMeta): Promise<SemesterGrades> {
    return parseSemesterGrades(meta);
  }

  async getPartialGrades(pplsId: number): Promise<SubjectActivityDetails[]> {
    const html = await fetchPartialGrades(pplsId);
    return parsePartialGradesHtml(html);
  }
}

export type {
  GradesIndex,
  GradesSemesterMeta,
  PartialGradeEntry,
  SemesterGrades,
  SubjectActivityDetails,
  SubjectGrade,
} from "./grades.types";
