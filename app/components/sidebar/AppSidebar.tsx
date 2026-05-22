import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { useThemedStyles } from '../../theme/useThemedStyles';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DashboardIcon from '../../features/dashboard/icons/DashboardIcon';
import {
  getCurrentRouteName,
  type SidebarRouteName,
} from '../../navigation/navigationRef';
import { useAppTheme } from '../../context/AppThemeContext';
import {
  createAppSidebarStyles,
  SIDEBAR_WIDTH,
} from './AppSidebar.styles';
import { SIDEBAR_MENU_ITEMS } from './sidebar.menu';
import SidebarProfileHeader from './SidebarProfileHeader';
import { useSidebar } from './SidebarContext';
import { useSidebarActions } from './useSidebarActions';

export default function AppSidebar() {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createAppSidebarStyles);
  const { isOpen, close } = useSidebar();
  const { onNavigate, onLogout, logoutLoading } = useSidebarActions();
  const [currentRoute, setCurrentRoute] = useState<string | undefined>();
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setCurrentRoute(getCurrentRouteName());
  }, [isOpen]);

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: isOpen ? 0 : -SIDEBAR_WIDTH,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: isOpen ? 1 : 0,
        duration: 260,
        useNativeDriver: true,
      }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [fadeAnim, isOpen, slideAnim]);

  const routeName = getCurrentRouteName();
  if (routeName === 'Login') {
    return null;
  }

  return (
    <View
      style={[styles.root, !isOpen && styles.rootHidden]}
      pointerEvents={isOpen ? 'auto' : 'box-none'}
    >
      <Animated.View
        style={[styles.backdrop, { opacity: fadeAnim }]}
        pointerEvents={isOpen ? 'auto' : 'none'}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel="Zamknij menu"
        />
      </Animated.View>

      <Animated.View
        style={[styles.panel, { transform: [{ translateX: slideAnim }] }]}
      >
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left']}>
          <SidebarProfileHeader />

          <ScrollView
            style={styles.menuScroll}
            contentContainerStyle={styles.menuContent}
            showsVerticalScrollIndicator={false}
          >
            {SIDEBAR_MENU_ITEMS.map((feature) => {
              const isActive = currentRoute === feature.route;
              return (
                <Pressable
                  key={feature.route}
                  onPress={() => onNavigate(feature.route as SidebarRouteName)}
                  style={({ pressed }) => [
                    styles.menuItem,
                    isActive && styles.menuItemActive,
                    pressed && styles.menuItemPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={feature.title}
                >
                  <View
                    style={[
                      styles.iconWrap,
                      { backgroundColor: feature.accentColor },
                    ]}
                  >
                    <DashboardIcon
                      name={feature.icon}
                      size={22}
                      color={colors.surface}
                    />
                  </View>
                  <View style={styles.menuTextBlock}>
                    <Text
                      style={[
                        styles.menuTitle,
                        isActive && styles.menuTitleActive,
                      ]}
                      numberOfLines={1}
                    >
                      {feature.title}
                    </Text>
                    <Text style={styles.menuDescription} numberOfLines={2}>
                      {feature.description}
                    </Text>
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color={colors.grayLight}
                  />
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              onPress={onLogout}
              disabled={logoutLoading}
              style={({ pressed }) => [
                styles.logoutButton,
                logoutLoading && styles.logoutButtonDisabled,
                pressed && styles.menuItemPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Wyloguj"
            >
              {logoutLoading ? (
                <ActivityIndicator color={colors.error} />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="logout"
                    size={20}
                    color={colors.error}
                  />
                  <Text style={styles.logoutLabel}>Wyloguj</Text>
                </>
              )}
            </Pressable>
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}
