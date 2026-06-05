// Awatar profilu w nagłówku.
import React, { useCallback } from 'react';
import { useThemedStyles } from '../theme/useThemedStyles';
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  View,
} from 'react-native';

import { useStudentProfile } from '../context/StudentProfileContext';
import { useProfilePhoto } from '../hooks/useProfilePhoto';
import { navigateTo } from '../navigation/navigationRef';
import { useAppTheme } from '../context/AppThemeContext';
import { createAppHeaderStyles } from './AppHeader.styles';

function getInitials(firstName: string, lastName: string): string {
  const a = firstName.trim().charAt(0);
  const b = lastName.trim().charAt(0);
  return (a + b).toUpperCase() || '?';
}

export default function AppHeaderAvatar() {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createAppHeaderStyles);
  const { summary, loading } = useStudentProfile();
  const { displayUri, showPhoto, onImageError, imageKey } = useProfilePhoto();

  const goToProfile = useCallback(() => {
    navigateTo('Profile');
  }, []);

  return (
    <Pressable
      onPress={goToProfile}
      style={({ pressed }) => [
        styles.avatarButton,
        pressed && { opacity: 0.85 },
      ]}
      accessibilityRole="button"
      accessibilityLabel="Przejdź do profilu"
      hitSlop={8}
    >
      {loading ? (
        <View style={styles.avatarLoading}>
          <ActivityIndicator size="small" color={colors.gold} />
        </View>
      ) : showPhoto && summary ? (
        <Image
          key={imageKey}
          source={{ uri: displayUri }}
          style={styles.avatar}
          onError={onImageError}
        />
      ) : (
        <Text style={styles.avatarPlaceholder}>
          {summary
            ? getInitials(summary.firstName, summary.lastName)
            : '?'}
        </Text>
      )}
    </Pressable>
  );
}
