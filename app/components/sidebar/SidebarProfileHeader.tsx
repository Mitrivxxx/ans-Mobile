import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Text, View } from 'react-native';

import { useStudentProfile } from '../../context/StudentProfileContext';
import { ansColors } from '../../theme/ansTheme';
import { sidebarProfileHeaderStyles as styles } from './SidebarProfileHeader.styles';

function getInitials(firstName: string, lastName: string): string {
  const a = firstName.trim().charAt(0);
  const b = lastName.trim().charAt(0);
  return (a + b).toUpperCase() || '?';
}

export default function SidebarProfileHeader() {
  const { summary, loading } = useStudentProfile();
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [summary?.photo]);

  return (
    <View style={styles.header}>
      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={ansColors.gold} />
          <Text style={styles.loadingText}>Wczytywanie profilu…</Text>
        </View>
      ) : !summary ? (
        <Text style={styles.emptyText}>Nie udało się wczytać profilu</Text>
      ) : (
        <View style={styles.content}>
          <View style={styles.avatarWrap}>
            {summary.photo && !imageError ? (
              <Image
                source={{ uri: summary.photo }}
                style={styles.avatar}
                onError={() => setImageError(true)}
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
