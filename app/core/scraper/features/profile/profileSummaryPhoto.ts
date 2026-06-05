import {
  clearPersistedProfilePhoto,
  loadPersistedProfilePhoto,
  savePersistedProfilePhoto,
} from "../../../auth/profilePhotoPersist.storage";
import type { ProfileSummary } from "./profile.types";
import {
  clearProfilePhotoSessionCacheIfUserMismatch,
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
    setCachedProfilePhoto(summary.photo, userKey);
    if (userKey) {
      void savePersistedProfilePhoto(userKey, summary.photo);
    }
  }
  return { ...summary, photo: PROFILE_SUMMARY_QUERY_PHOTO };
}

/** Migracja: stary cache persystowany z photo w summary → sesja + puste photo w RQ. */
export function sanitizePersistedProfileSummary(
  summary: ProfileSummary | undefined,
  userKey?: string
): ProfileSummary | undefined {
  if (!summary?.photo) {
    return summary;
  }
  return profileSummaryForQueryCache(summary, userKey);
}

export function profilePhotoChangedSince(
  previous: string | null,
  userKey?: string
): boolean {
  const next = getCachedProfilePhoto(userKey);
  return next !== previous;
}

/** Po cold start: sesja ← osobny klucz AsyncStorage (gdy brak w RAM). */
export async function hydrateProfilePhotoSessionFromDisk(
  userKey: string
): Promise<void> {
  clearProfilePhotoSessionCacheIfUserMismatch(userKey);
  if (getCachedProfilePhoto(userKey)) {
    return;
  }
  const photo = await loadPersistedProfilePhoto(userKey);
  if (photo) {
    setCachedProfilePhoto(photo, userKey);
  }
}

export async function clearProfilePhotoForUser(userKey: string): Promise<void> {
  await clearPersistedProfilePhoto(userKey);
}
