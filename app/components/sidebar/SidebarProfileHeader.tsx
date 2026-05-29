import React from 'react';
import { useThemedStyles } from '../../theme/useThemedStyles';
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useStudentProfile } from '../../context/StudentProfileContext';
import { useAppTheme } from '../../context/AppThemeContext';
import { useProfilePhoto } from '../../hooks/useProfilePhoto';
import SidebarMenuIcon from './SidebarMenuIcon';
import { createSidebarProfileHeaderStyles } from './SidebarProfileHeader.styles';

function getInitials(firstName: string, lastName: string): string {
  const a = firstName.trim().charAt(0);
  const b = lastName.trim().charAt(0);
  return (a + b).toUpperCase() || '?';
}

type Props = {
  onClose: () => void;
};

export default function SidebarProfileHeader({ onClose }: Props) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createSidebarProfileHeaderStyles);
  const { summary, loading, refetch } = useStudentProfile();
  const { displayUri, showPhoto, onImageError, imageKey } = useProfilePhoto();

  return (
    <View style={styles.header}>
      <Pressable
        onPress={onClose}
        style={({ pressed }) => [
          styles.closeButton,
          pressed && styles.closeButtonPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Zamknij menu"
        hitSlop={8}
      >
        <SidebarMenuIcon name="chevronLeft" size={26} color={colors.charcoal} />
      </Pressable>

      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.gold} />
          <Text style={styles.loadingText}>Wczytywanie profilu…</Text>
        </View>
      ) : !summary ? (
        <View style={styles.loadingRow}>
          <Text style={styles.emptyText}>Nie udało się wczytać profilu</Text>
          <TouchableOpacity onPress={() => void refetch()} activeOpacity={0.8}>
            <Text style={styles.retryText}>Odśwież</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.avatarWrap}>
            {showPhoto ? (
              <Image
                key={imageKey}
                source={{ uri: displayUri }}
                style={styles.avatar}
                onError={onImageError}
              />
            ) : (
              <Text style={styles.avatarPlaceholder}>
                {getInitials(summary.firstName, summary.lastName)}
              </Text>
            )}
          </View>
          <Text style={styles.name} numberOfLines={2}>
            {summary.firstName} {summary.lastName}
          </Text>
          {!!summary.major && (
            <Text style={styles.major} numberOfLines={2}>
              {summary.major}
            </Text>
          )}
          {!!summary.albumNumber && (
            <Text style={styles.album} numberOfLines={1}>
              Nr albumu: {summary.albumNumber}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
