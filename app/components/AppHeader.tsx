// Główny pasek nagłówka aplikacji.
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getCurrentRouteName, navigationRef } from '../navigation/navigationRef';
import { useThemedStyles } from '../theme/useThemedStyles';
import {
  APP_HEADER_LOGO_SIZE,
  createAppHeaderStyles,
} from './AppHeader.styles';
import AppEnvBadge from './AppEnvBadge';
import AppHeaderAvatar from './AppHeaderAvatar';
import { logoHeaderForTheme } from '../assets/brandLogos';
import { useAppTheme } from '../context/AppThemeContext';
import AppLogo from './AppLogo';
import SidebarMenuButton from './sidebar/SidebarMenuButton';

export default function AppHeader() {
  const { isDarkMode } = useAppTheme();
  const styles = useThemedStyles(createAppHeaderStyles);
  const insets = useSafeAreaInsets();
  const [routeName, setRouteName] = useState(getCurrentRouteName);

  useEffect(() => {
    const syncRoute = () => setRouteName(getCurrentRouteName());

    if (navigationRef.isReady()) {
      syncRoute();
    }

    const unsubscribe = navigationRef.addListener('state', syncRoute);
    return unsubscribe;
  }, []);

  if (routeName === 'Login') {
    return null;
  }

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top }]}>
      <View style={styles.row}>
        <View style={styles.side}>
          <SidebarMenuButton size={28} buttonSize={48} />
        </View>

        <View style={styles.center}>
          <AppLogo
            size={APP_HEADER_LOGO_SIZE}
            source={logoHeaderForTheme(isDarkMode)}
            variant="wide"
            resizeMode="contain"
          />
          <AppEnvBadge />
        </View>

        <View style={styles.sideRight}>
          <AppHeaderAvatar />
        </View>
      </View>
    </View>
  );
}
