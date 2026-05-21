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
  | 'FindLecturer'
  | 'LecturerPlan'
  | 'Finanse'
  | 'Settings';

export type LecturerPlanParams = {
  scheduleId: string;
  lecturerName: string;
  organizationalUnits?: string;
  additionalInfo?: string;
};

export type RootParamList = {
  Login: undefined;
  Dashboard: undefined;
  Plan: undefined;
  Grades: undefined;
  Announcements: undefined;
  Profile: undefined;
  FindLecturer: undefined;
  LecturerPlan: LecturerPlanParams;
  Finanse: undefined;
  Settings: undefined;
};

export type SidebarRouteName = Exclude<AppRouteName, 'LecturerPlan' | 'Login'>;

export const navigationRef = createNavigationContainerRef<RootParamList>();

export function navigateTo(route: SidebarRouteName) {
  if (!navigationRef.isReady()) {
    return;
  }

  navigationRef.dispatch(
    CommonActions.navigate({
      name: route,
    })
  );
}

export function navigateToLecturerPlan(params: LecturerPlanParams) {
  if (!navigationRef.isReady()) {
    return;
  }

  navigationRef.dispatch(
    CommonActions.navigate({
      name: 'LecturerPlan',
      params,
    })
  );
}

export function replaceTo(route: Exclude<AppRouteName, 'LecturerPlan'>) {
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
