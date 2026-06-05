export interface GroupsSemesterOption {
  id: string;
  label: string;
}

export interface StudentGroupEntry {
  activityForm: string;
  groupCode: string;
}

export interface StudentGroupsData {
  academicSemester: string;
  groups: StudentGroupEntry[];
}
