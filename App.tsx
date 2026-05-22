import React, { useCallback, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import AppErrorBoundary from './app/components/AppErrorBoundary';
import AppInitGate from './app/components/AppInitGate';
import AuthSyncBanner from './app/components/AuthSyncBanner';
import AppHeader from './app/components/AppHeader';
import AppSidebar from './app/components/sidebar/AppSidebar';
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

const AuthStack = createStackNavigator<Pick<RootParamList, 'Login'>>();
const AppStack = createStackNavigator<
  Omit<RootParamList, 'Login'>
>();

function AuthNavigator() {
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
  return (
    <AppStack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{ headerShown: false }}
    >
      <AppStack.Screen name="Dashboard" component={DashboardScreen} />
      <AppStack.Screen name="Plan" component={PlanScreen} />
      <AppStack.Screen name="Grades" component={GradesScreen} />
      <AppStack.Screen
        name="Announcements"
        component={AnnouncementsScreen}
      />
      <AppStack.Screen name="Profile" component={ProfileScreen} />
      <AppStack.Screen name="FindLecturer" component={FindLecturerScreen} />
      <AppStack.Screen name="LecturerPlan" component={LecturerPlanScreen} />
      <AppStack.Screen name="Finanse" component={FinanseScreen} />
      <AppStack.Screen name="Settings" component={SettingsScreen} />
    </AppStack.Navigator>
  );
}

function AppShell() {
  const { isDarkMode, colors } = useAppTheme();
  const { authStatus } = useAuthSession();
  usePrefetchUserScraperData();

  if (authStatus === 'unknown') {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }

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

  return (
    <>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <NavigationContainer ref={navigationRef}>
        <ScreenRefreshProvider>
          <StudentProfileProvider>
            <SidebarProvider>
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
        </ScreenRefreshProvider>
      </NavigationContainer>
    </>
  );
}

export default function App() {
  const [persistReady, setPersistReady] = useState(false);
  const onPersistSuccess = useCallback(() => {
    setPersistReady(true);
  }, []);

  return (
    <AppThemeProvider>
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
              <AuthSessionProvider persistReady={persistReady}>
                <AppShell />
              </AuthSessionProvider>
            </SafeAreaProvider>
          </PersistQueryClientProvider>
        </AppInitGate>
      </AppErrorBoundary>
    </AppThemeProvider>
  );
}
