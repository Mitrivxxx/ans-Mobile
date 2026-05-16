import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import LoginScreen from './app/features/LoginScreen';
import DashboardScreen from './app/dashboard/DashboardScreen';
import PlanScreen from './app/features/PlanScreen';
import GradesScreen from './app/features/GradesScreen';
import AnnouncementsScreen from './app/features/AnnouncementsScreen';
import ProfileScreen from './app/features/ProfileScreen';
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
      <StatusBar style="auto" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
          />
          <Stack.Screen 
            name="Dashboard" 
            component={DashboardScreen}
          />
          <Stack.Screen 
            name="Plan" 
            component={PlanScreen}
          />
          <Stack.Screen 
            name="Grades" 
            component={GradesScreen}
          />
          <Stack.Screen 
            name="Announcements" 
            component={AnnouncementsScreen}
          />
          <Stack.Screen 
            name="Profile" 
            component={ProfileScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
