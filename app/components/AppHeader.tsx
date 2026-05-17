import React, { useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getCurrentRouteName, navigationRef } from '../navigation/navigationRef';
import { appHeaderStyles as styles } from './AppHeader.styles';
import AppHeaderAvatar from './AppHeaderAvatar';
import SidebarMenuButton from './sidebar/SidebarMenuButton';

const ansLogo = require('../../assets/icons/logov2.png');

export default function AppHeader() {
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
          <Image
            source={ansLogo}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Logo Akademii Nauk Stosowanych"
          />
        </View>

        <View style={styles.sideRight}>
          <AppHeaderAvatar />
        </View>
      </View>
    </View>
  );
}
