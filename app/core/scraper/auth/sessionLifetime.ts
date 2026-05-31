import AsyncStorage from "@react-native-async-storage/async-storage";

/** Czas życia sesji WD na serwerze (min). */
export const WD_SESSION_TTL_MS = 60 * 60 * 1000;

/** Odśwież sesję przed wygaśnięciem (min). */
export const WD_SESSION_REFRESH_MARGIN_MS = 5 * 60 * 1000;

const SESSION_ESTABLISHED_KEY = "@wdmobile/sessionEstablishedAt";

export async function markSessionEstablished(): Promise<void> {
  await AsyncStorage.setItem(SESSION_ESTABLISHED_KEY, String(Date.now()));
}

export async function clearSessionEstablished(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_ESTABLISHED_KEY);
}

/** Brak znacznika lub przekroczony TTL → wymagana walidacja / ponowne logowanie. */
export async function isSessionPastTtl(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(SESSION_ESTABLISHED_KEY);
  if (!raw) {
    return true;
  }

  const established = Number(raw);
  if (!Number.isFinite(established)) {
    return true;
  }

  return (
    Date.now() - established >= WD_SESSION_TTL_MS - WD_SESSION_REFRESH_MARGIN_MS
  );
}

/** Sesja uznana za świeżą lokalnie — można pominąć probe HTTP. */
export async function isSessionFresh(): Promise<boolean> {
  return !(await isSessionPastTtl());
}
