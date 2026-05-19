import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import AuthSyncBanner from './app/components/AuthSyncBanner';
import AppHeader from './app/components/AppHeader';
import AppSidebar from './app/components/sidebar/AppSidebar';
import { SidebarProvider } from './app/components/sidebar/SidebarContext';
import {
  AppThemeProvider,
  useAppTheme,
} from './app/context/AppThemeContext';
import {
  RememberMeAuthProvider,
  useRememberMeAuth,
} from './app/context/RememberMeAuthContext';
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
import SettingsScreen from './app/screen/SettingsScreen';
import { setupScraperAuthGuard } from './app/core/scraper/auth/ensureAuthenticated';
import { initClient } from './app/core/scraper/client/client';
import { queryClient } from './app/core/queryClient/queryClient';
import { queryPersister } from './app/core/queryClient/queryPersister';
import { shouldPersistQuery } from './app/core/queryClient/shouldPersistQuery';
import { ansColors } from './app/theme/ansTheme';
import type { RootParamList } from './app/navigation/navigationRef';

const Stack = createStackNavigator<RootParamList>();

function AppShell() {
  const { isDarkMode, colors } = useAppTheme();
  const { bootstrapped, rememberMeEnabled } = useRememberMeAuth();

  if (!bootstrapped) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.appBackground,
        }}
      >
        <ActivityIndicator size="large" color={ansColors.gold} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <NavigationContainer ref={navigationRef}>
        <ScreenRefreshProvider>
        <StudentProfileProvider>
          <SidebarProvider>
            <View style={{ flex: 1, backgroundColor: colors.appBackground }}>
              <AppHeader />
              <AuthSyncBanner />
              <View style={{ flex: 1 }}>
                <Stack.Navigator
                  initialRouteName={
                    rememberMeEnabled ? 'Dashboard' : 'Login'
                  }
                  screenOptions={{
                    headerShown: false,
                  }}
                >
                  <Stack.Screen name="Login" component={LoginScreen} />
                  <Stack.Screen name="Dashboard" component={DashboardScreen} />
                  <Stack.Screen name="Plan" component={PlanScreen} />
                  <Stack.Screen name="Grades" component={GradesScreen} />
                  <Stack.Screen
                    name="Announcements"
                    component={AnnouncementsScreen}
                  />
                  <Stack.Screen name="Profile" component={ProfileScreen} />
                  <Stack.Screen
                    name="FindLecturer"
                    component={FindLecturerScreen}
                  />
                  <Stack.Screen
                    name="LecturerPlan"
                    component={LecturerPlanScreen}
                  />
                  <Stack.Screen name="Settings" component={SettingsScreen} />
                </Stack.Navigator>
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
  useEffect(() => {
    async function bootstrap() {
      console.log('[APP] Initializing...');

      try {
        setupScraperAuthGuard();
        await initClient();
        console.log('[APP] Cookie store initialized');
      } catch (error) {
        console.error('[APP] Init error:', error);
      }
    }

    bootstrap();
  }, []);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: queryPersister,
        maxAge: Number.POSITIVE_INFINITY,
        dehydrateOptions: {
          shouldDehydrateQuery: shouldPersistQuery,
        },
      }}
    >
      <SafeAreaProvider>
        <AppThemeProvider>
          <RememberMeAuthProvider>
            <AppShell />
          </RememberMeAuthProvider>
        </AppThemeProvider>
      </SafeAreaProvider>
    </PersistQueryClientProvider>
  );
}
