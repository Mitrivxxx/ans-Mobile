import AsyncStorage from '@react-native-async-storage/async-storage';

const DARK_MODE_ENABLED_KEY = '@wdmobile/darkModeEnabled';

export async function isDarkModeEnabled(): Promise<boolean> {
  const value = await AsyncStorage.getItem(DARK_MODE_ENABLED_KEY);
  return value === 'true';
}

export async function setDarkModeEnabled(enabled: boolean): Promise<void> {
  if (enabled) {
    await AsyncStorage.setItem(DARK_MODE_ENABLED_KEY, 'true');
    return;
  }

  await AsyncStorage.removeItem(DARK_MODE_ENABLED_KEY);
}
