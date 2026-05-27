import AsyncStorage from '@react-native-async-storage/async-storage';

import type { EventsDepartmentId } from '../scraper/events/events.constants';

const EVENTS_DEPARTMENT_KEY = '@wdmobile/eventsDepartment';

export async function getStoredEventsDepartmentId(): Promise<EventsDepartmentId | null> {
  const value = await AsyncStorage.getItem(EVENTS_DEPARTMENT_KEY);
  return value as EventsDepartmentId | null;
}

export async function setStoredEventsDepartmentId(id: EventsDepartmentId): Promise<void> {
  await AsyncStorage.setItem(EVENTS_DEPARTMENT_KEY, id);
}
