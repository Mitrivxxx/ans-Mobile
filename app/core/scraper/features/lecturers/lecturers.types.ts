export interface LecturerSearchQuery {
  firstName?: string;
  lastName?: string;
}

export interface LecturerSearchResult {
  name: string;
  additionalInfo: string;
  email: string;
  organizationalUnits: string;
  schedulePath: string;
  scheduleId: string;
}
