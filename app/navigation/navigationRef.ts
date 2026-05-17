import {
  CommonActions,
  createNavigationContainerRef,
} from '@react-navigation/native';

export type AppRouteName =
  | 'Login'
  | 'Dashboard'
  | 'Plan'
  | 'Grades'
  | 'Announcements'
  | 'Profile'
  | 'FindLecturer';

export type RootParamList = Record<AppRouteName, undefined>;

export const navigationRef = createNavigationContainerRef<RootParamList>();

export function navigateTo(route: AppRouteName) {
  if (!navigationRef.isReady()) {
    return;
  }

  navigationRef.dispatch(
    CommonActions.navigate({
      name: route,
    })
  );
}

export function replaceTo(route: AppRouteName) {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name: route }],
    });
  }
}

export function getCurrentRouteName(): AppRouteName | undefined {
  const name = navigationRef.getCurrentRoute()?.name;
  return name as AppRouteName | undefined;
}
