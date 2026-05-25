import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTO_UPDATES_ENABLED_KEY = '@wdmobile/autoUpdatesEnabled';

/** Domyślnie wyłączone — użytkownik włącza w Ustawieniach lub sprawdza ręcznie. */
export async function isAutoUpdatesEnabled(): Promise<boolean> {
  const value = await AsyncStorage.getItem(AUTO_UPDATES_ENABLED_KEY);
  if (value === null) {
    return false;
  }
  return value === 'true';
}

export async function setAutoUpdatesEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(
    AUTO_UPDATES_ENABLED_KEY,
    enabled ? 'true' : 'false'
  );
}
