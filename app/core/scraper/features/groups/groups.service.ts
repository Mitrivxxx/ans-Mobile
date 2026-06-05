import { parseStudentGroups } from "./groups.parse";
import type { StudentGroupsData } from "./groups.types";

export class GroupsService {
  async getStudentGroups(
    academicSemester?: string | null
  ): Promise<StudentGroupsData> {
    return parseStudentGroups(academicSemester);
  }
}

export type {
  GroupsSemesterOption,
  StudentGroupEntry,
  StudentGroupsData,
} from "./groups.types";
