import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  View,
} from 'react-native';

import { useStudentProfile } from '../context/StudentProfileContext';
import { navigateTo } from '../navigation/navigationRef';
import { ansColors } from '../theme/ansTheme';
import { appHeaderStyles as styles } from './AppHeader.styles';

function getInitials(firstName: string, lastName: string): string {
  const a = firstName.trim().charAt(0);
  const b = lastName.trim().charAt(0);
  return (a + b).toUpperCase() || '?';
}

export default function AppHeaderAvatar() {
  const { summary, loading } = useStudentProfile();
  const [imageError, setImageError] = useState(false);

  const goToProfile = useCallback(() => {
    navigateTo('Profile');
  }, []);

  useEffect(() => {
    setImageError(false);
  }, [summary?.photo]);

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
          <ActivityIndicator size="small" color={ansColors.gold} />
        </View>
      ) : showPhoto(summary, imageError) && summary ? (
        <Image
          source={{ uri: summary.photo }}
          style={styles.avatar}
          onError={() => setImageError(true)}
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

function showPhoto(
  summary: { photo?: string } | null,
  imageError: boolean
): boolean {
  return Boolean(summary?.photo) && !imageError;
}
