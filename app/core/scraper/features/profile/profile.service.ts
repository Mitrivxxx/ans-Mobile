import {
  parseAccountDetails,
  parseCompleteProfile,
  parseProfileBundle,
  parseProfileSummary,
  parseStudiesData,
} from "./profile.parse";
import type {
  AccountData,
  CompleteProfileData,
  ProfileSummary,
  StudiesData,
} from "./profile.types";

export class ProfileService {
  async getProfileSummary(): Promise<ProfileSummary> {
    return parseProfileSummary();
  }

  async getProfileBundle(): Promise<{
    summary: ProfileSummary;
    profile: CompleteProfileData;
  }> {
    return parseProfileBundle();
  }

  async getProfile(): Promise<CompleteProfileData> {
    return parseCompleteProfile();
  }

  async getAccount(): Promise<AccountData> {
    return parseAccountDetails();
  }

  async getStudies(): Promise<StudiesData> {
    return parseStudiesData();
  }
}

export type {
  AccountData,
  CompleteProfileData,
  ProfileSummary,
  StudiesData,
} from "./profile.types";
