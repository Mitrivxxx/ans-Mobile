/** Skrócony profil (np. nagłówek ekranu) — imię, nazwisko, album, kierunek, awatar ze strony głównej. */
export interface ProfileSummary {
  firstName: string;
  lastName: string;
  albumNumber: string;
  major: string;
  /** data:image/...;base64,... lub URL — ze strony głównej (#zdjecie_glowne) */
  photo: string;
}

export interface AccountData {
  firstName: string;
  lastName: string;
  albumNumber: string;
  major: string;
  login: string;
  privateEmail: string;
  universityEmail: string;
  lastLoginDate: string;
  lastPasswordChangeDate: string;
}

export interface StudiesData {
  studyTrack: string;
  albumNumber: string;
  legitimationNumber: string;
  studentStatus: string;
  year: string;
  semester: string;
  studyMode: string;
  faculty: string;
  major: string;
  specialization: string;
  title: string;
  enrollmentSemester: string;
  studiesStartDate: string;
  studiesEndDate: string;
  individualTrack: string;
  contractNumber: string;
}

export interface CompleteProfileData extends AccountData, StudiesData {}
