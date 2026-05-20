/** Awatar w pamięci na czas sesji — czyszczony przy wylogowaniu. */
let sessionPhoto: string | null = null;

export function getCachedProfilePhoto(): string | null {
  return sessionPhoto;
}

export function setCachedProfilePhoto(photo: string): void {
  const normalized = photo.trim();
  if (!normalized) {
    return;
  }
  sessionPhoto = normalized;
}

export function clearProfilePhotoSessionCache(): void {
  sessionPhoto = null;
}
