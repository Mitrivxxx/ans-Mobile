/** Awatar w pamięci na czas sesji — powiązany z userKey, czyszczony przy wylogowaniu. */
let sessionPhoto: string | null = null;
let sessionPhotoUserKey: string | null = null;

export function getCachedProfilePhoto(userKey?: string): string | null {
  if (!sessionPhoto) {
    return null;
  }
  if (userKey && sessionPhotoUserKey && sessionPhotoUserKey !== userKey) {
    return null;
  }
  return sessionPhoto;
}

export function setCachedProfilePhoto(photo: string, userKey?: string): void {
  const normalized = photo.trim();
  if (!normalized) {
    return;
  }
  sessionPhoto = normalized;
  if (userKey?.trim()) {
    sessionPhotoUserKey = userKey.trim();
  }
}

export function clearProfilePhotoSessionCache(): void {
  sessionPhoto = null;
  sessionPhotoUserKey = null;
}

/** Gdy userKey się zmienia (np. inne konto), odrzuć awatar poprzedniego użytkownika. */
export function clearProfilePhotoSessionCacheIfUserMismatch(
  userKey: string
): void {
  const normalized = userKey.trim();
  if (!normalized || normalized === 'session') {
    return;
  }
  if (sessionPhotoUserKey && sessionPhotoUserKey !== normalized) {
    clearProfilePhotoSessionCache();
  }
}
