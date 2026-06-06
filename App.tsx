import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import AppErrorBoundary from './app/components/AppErrorBoundary';
import ScreenErrorBoundary from './app/components/ScreenErrorBoundary';
import AppInitGate from './app/components/AppInitGate';
import AuthSyncBanner from './app/components/AuthSyncBanner';
import AppHeader from './app/components/AppHeader';
import AppSidebar from './app/components/sidebar/AppSidebar';
import SidebarBackHandler from './app/components/sidebar/SidebarBackHandler';
import { SidebarProvider } from './app/components/sidebar/SidebarContext';
import {
  AppThemeProvider,
  useAppTheme,
} from './app/context/AppThemeContext';
import {
  AuthSessionProvider,
  useAuthSession,
} from './app/context/AuthSessionContext';
import { ScreenRefreshProvider } from './app/context/ScreenRefreshContext';
import { DataRefreshIntervalProvider } from './app/context/DataRefreshIntervalContext';
import { StudentProfileProvider } from './app/context/StudentProfileContext';
import { navigationRef } from './app/navigation/navigationRef';
import LoginScreen from './app/screen/LoginScreen';
import DashboardScreen from './app/screen/DashboardScreen';
import PlanScreen from './app/screen/PlanScreen';
import GradesScreen from './app/screen/GradesScreen';
import AnnouncementsScreen from './app/screen/AnnouncementsScreen';
import ProfileScreen from './app/screen/ProfileScreen';
import FindLecturerScreen from './app/screen/FindLecturerScreen';
import LecturerPlanScreen from './app/screen/LecturerPlanScreen';
import FinanseScreen from './app/screen/FinanseScreen';
import SettingsScreen from './app/screen/SettingsScreen';
import { queryClient } from './app/core/queryClient/queryClient';
import { queryPersister } from './app/core/queryClient/queryPersister';
import { usePrefetchUserScraperData } from './app/hooks/usePrefetchUserScraperData';
import {
  PERSIST_MAX_AGE_MS,
  PERSIST_QUERY_BUSTER,
} from './app/core/queryClient/persistentQueryConfig';
import { shouldDehydratePersistedQuery } from './app/core/queryClient/shouldPersistQuery';
import type { RootParamList } from './app/navigation/navigationRef';
import { startupMark, startupMeasure } from './app/core/startup/startupMetrics';

type AppScreenName = Exclude<keyof RootParamList, 'Login'>;

function withScreenErrorBoundary<P extends object>(
  ScreenComponent: React.ComponentType<P>,
  screen: AppScreenName
) {
  const WrappedScreen = (props: P) => (
    <ScreenErrorBoundary screen={screen}>
      <ScreenComponent {...props} />
    </ScreenErrorBoundary>
  );

  WrappedScreen.displayName = `ScreenErrorBoundary(${ScreenComponent.displayName ?? ScreenComponent.name ?? screen})`;
  return WrappedScreen;
}

const DashboardScreenWithBoundary = withScreenErrorBoundary(DashboardScreen, 'Dashboard');
const PlanScreenWithBoundary = withScreenErrorBoundary(PlanScreen, 'Plan');
const GradesScreenWithBoundary = withScreenErrorBoundary(GradesScreen, 'Grades');
const AnnouncementsScreenWithBoundary = withScreenErrorBoundary(
  AnnouncementsScreen,
  'Announcements'
);
const ProfileScreenWithBoundary = withScreenErrorBoundary(ProfileScreen, 'Profile');
const FindLecturerScreenWithBoundary = withScreenErrorBoundary(
  FindLecturerScreen,
  'FindLecturer'
);
const LecturerPlanScreenWithBoundary = withScreenErrorBoundary(
  LecturerPlanScreen,
  'LecturerPlan'
);
const FinanseScreenWithBoundary = withScreenErrorBoundary(FinanseScreen, 'Finanse');
const SettingsScreenWithBoundary = withScreenErrorBoundary(SettingsScreen, 'Settings');

const AuthStack = createStackNavigator<Pick<RootParamList, 'Login'>>();
const AppStack = createStackNavigator<
  Omit<RootParamList, 'Login'>
>();

function AuthNavigator() {
  const loggedRef = useRef(false);
  useEffect(() => {
    if (loggedRef.current) {
      return;
    }
    loggedRef.current = true;
    startupMark('first-auth-render');
    startupMeasure(
      'App start -> AuthNavigator first render',
      'app-init-start',
      'first-auth-render'
    );
  }, []);

  return (
    <AuthStack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
    </AuthStack.Navigator>
  );
}

function MainNavigator() {
  const loggedRef = useRef(false);
  useEffect(() => {
    if (loggedRef.current) {
      return;
    }
    loggedRef.current = true;
    startupMark('first-main-render');
    startupMeasure(
      'App start -> MainNavigator first render',
      'app-init-start',
      'first-main-render'
    );
  }, []);

  return (
    <AppStack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{ headerShown: false }}
    >
      <AppStack.Screen name="Dashboard" component={DashboardScreenWithBoundary} />
      <AppStack.Screen name="Plan" component={PlanScreenWithBoundary} />
      <AppStack.Screen name="Grades" component={GradesScreenWithBoundary} />
      <AppStack.Screen name="Announcements" component={AnnouncementsScreenWithBoundary} />
      <AppStack.Screen name="Profile" component={ProfileScreenWithBoundary} />
      <AppStack.Screen name="FindLecturer" component={FindLecturerScreenWithBoundary} />
      <AppStack.Screen name="LecturerPlan" component={LecturerPlanScreenWithBoundary} />
      <AppStack.Screen name="Finanse" component={FinanseScreenWithBoundary} />
      <AppStack.Screen name="Settings" component={SettingsScreenWithBoundary} />
    </AppStack.Navigator>
  );
}

function AuthenticatedShell() {
  const { isDarkMode, colors } = useAppTheme();

  return (
    <>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <NavigationContainer ref={navigationRef}>
        <ScreenRefreshProvider>
          <DataRefreshIntervalProvider>
            <StudentProfileProvider>
              <SidebarProvider>
                <SidebarBackHandler />
                <View style={{ flex: 1, backgroundColor: colors.background }}>
                  <AppHeader />
                  <AuthSyncBanner />
                  <View style={{ flex: 1 }}>
                    <MainNavigator />
                  </View>
                  <AppSidebar />
                </View>
              </SidebarProvider>
            </StudentProfileProvider>
          </DataRefreshIntervalProvider>
        </ScreenRefreshProvider>
      </NavigationContainer>
    </>
  );
}

function AppShell() {
  const { authStatus } = useAuthSession();
  usePrefetchUserScraperData();

  if (authStatus === 'unauthenticated') {
    return (
      <>
        <StatusBar style="dark" />
        <NavigationContainer ref={navigationRef}>
          <AuthNavigator />
        </NavigationContainer>
      </>
    );
  }

  if (authStatus === 'authenticated' || authStatus === 'restoring') {
    return <AuthenticatedShell />;
  }

  return null;
}

type AppProps = {
  initialDarkMode?: boolean;
  initialRememberMeRestore?: boolean;
};

export default function App({
  initialDarkMode,
  initialRememberMeRestore = false,
}: AppProps = {}) {
  const [persistReady, setPersistReady] = useState(false);
  const onPersistSuccess = useCallback(() => {
    startupMark('persist-ready');
    startupMeasure('App start -> persist restore', 'app-init-start', 'persist-ready');
    setPersistReady(true);
  }, []);

  return (
    <AppThemeProvider initialDarkMode={initialDarkMode}>
      <AppErrorBoundary>
        <AppInitGate>
          <PersistQueryClientProvider
            client={queryClient}
            onSuccess={onPersistSuccess}
            persistOptions={{
              persister: queryPersister,
              maxAge: PERSIST_MAX_AGE_MS,
              buster: PERSIST_QUERY_BUSTER,
              dehydrateOptions: {
                shouldDehydrateQuery: shouldDehydratePersistedQuery,
              },
            }}
          >
            <SafeAreaProvider>
              <AuthSessionProvider
                persistReady={persistReady}
                initialRememberMeRestore={initialRememberMeRestore}
              >
                <AppShell />
              </AuthSessionProvider>
            </SafeAreaProvider>
          </PersistQueryClientProvider>
        </AppInitGate>
      </AppErrorBoundary>
    </AppThemeProvider>
  );
}
