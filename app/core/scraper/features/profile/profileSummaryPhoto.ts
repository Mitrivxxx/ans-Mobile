import {
  clearPersistedProfilePhoto,
  loadPersistedProfilePhoto,
  savePersistedProfilePhoto,
} from "../../../auth/profilePhotoPersist.storage";
import type { ProfileSummary } from "./profile.types";
import {
  getCachedProfilePhoto,
  setCachedProfilePhoto,
} from "./profilePhotoSessionCache";

/** W React Query / AsyncStorage — bez base64 (awatar poza blobem RQ). */
export const PROFILE_SUMMARY_QUERY_PHOTO = "";

/**
 * Zapisuje awatar w cache sesji (+ opcjonalnie na dysk); zwraca summary bez blobu do RQ.
 */
export function profileSummaryForQueryCache(
  summary: ProfileSummary,
  userKey?: string
): ProfileSummary {
  if (summary.photo) {
    setCachedProfilePhoto(summary.photo);
    if (userKey) {
      void savePersistedProfilePhoto(userKey, summary.photo);
    }
  }
  return { ...summary, photo: PROFILE_SUMMARY_QUERY_PHOTO };
}

/** Migracja: stary cache persystowany z photo w summary → sesja + puste photo w RQ. */
export function sanitizePersistedProfileSummary(
  summary: ProfileSummary | undefined
): ProfileSummary | undefined {
  if (!summary?.photo) {
    return summary;
  }
  return profileSummaryForQueryCache(summary);
}

export function profilePhotoChangedSince(
  previous: string | null
): boolean {
  const next = getCachedProfilePhoto();
  return next !== previous;
}

/** Po cold start: sesja ← osobny klucz AsyncStorage (gdy brak w RAM). */
export async function hydrateProfilePhotoSessionFromDisk(
  userKey: string
): Promise<void> {
  if (getCachedProfilePhoto()) {
    return;
  }
  const photo = await loadPersistedProfilePhoto(userKey);
  if (photo) {
    setCachedProfilePhoto(photo);
  }
}

export async function clearProfilePhotoForUser(userKey: string): Promise<void> {
  await clearPersistedProfilePhoto(userKey);
}
