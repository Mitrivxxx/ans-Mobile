import React, { useEffect } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AppHeader from './app/components/AppHeader';
import AppSidebar from './app/components/sidebar/AppSidebar';
import { SidebarProvider } from './app/components/sidebar/SidebarContext';
import { StudentProfileProvider } from './app/context/StudentProfileContext';
import { navigationRef } from './app/navigation/navigationRef';
import LoginScreen from './app/screen/LoginScreen';
import DashboardScreen from './app/screen/DashboardScreen';
import PlanScreen from './app/screen/PlanScreen';
import GradesScreen from './app/screen/GradesScreen';
import AnnouncementsScreen from './app/screen/AnnouncementsScreen';
import ProfileScreen from './app/screen/ProfileScreen';
import FindLecturerScreen from './app/screen/FindLecturerScreen';
import { initClient } from './app/core/scraper/client/client';

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    async function bootstrap() {
      console.log('[APP] Initializing...');
      
      try {
        await initClient();
        console.log('[APP] Cookie store initialized');
      } catch (error) {
        console.error('[APP] Init error:', error);
      }
    }

    bootstrap();
  }, []);
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer ref={navigationRef}>
        <StudentProfileProvider>
          <SidebarProvider>
            <View style={{ flex: 1 }}>
              <AppHeader />
              <View style={{ flex: 1 }}>
                <Stack.Navigator
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
                </Stack.Navigator>
              </View>
              <AppSidebar />
            </View>
          </SidebarProvider>
        </StudentProfileProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
