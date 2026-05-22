import AsyncStorage from '@react-native-async-storage/async-storage';

const storageKey = (userKey: string) =>
  `@wdmobile/profilePhoto:${userKey.trim()}`;

/** Awatar base64/URI — poza blobem React Query (przetrwa cold start). */
export async function savePersistedProfilePhoto(
  userKey: string,
  photo: string
): Promise<void> {
  const trimmed = photo.trim();
  const key = storageKey(userKey);
  if (!trimmed) {
    await AsyncStorage.removeItem(key);
    return;
  }
  await AsyncStorage.setItem(key, trimmed);
}

export async function loadPersistedProfilePhoto(
  userKey: string
): Promise<string | null> {
  const value = await AsyncStorage.getItem(storageKey(userKey));
  return value?.trim() || null;
}

export async function clearPersistedProfilePhoto(
  userKey: string
): Promise<void> {
  await AsyncStorage.removeItem(storageKey(userKey));
}
