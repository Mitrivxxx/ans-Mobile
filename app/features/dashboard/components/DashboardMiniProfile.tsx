import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import type { ProfileSummary } from '../../../core/scraper/features/profile/profile.service';
import { ansColors } from '../../../theme/ansTheme';
import {
  dashboardMiniProfileStyles as styles,
  META_ICON_SIZE,
} from './DashboardMiniProfile.styles';

type Props = {
  summary: ProfileSummary | null;
  loading: boolean;
};

function getInitials(firstName: string, lastName: string): string {
  const a = firstName.trim().charAt(0);
  const b = lastName.trim().charAt(0);
  return (a + b).toUpperCase() || '?';
}

export default function DashboardMiniProfile({ summary, loading }: Props) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [summary?.photo]);

  if (loading) {
    return (
      <View style={styles.card}>
        <View style={styles.loadingRow}>
          <ActivityIndicator color={ansColors.gold} />
          <Text style={styles.loadingText}>Wczytywanie profilu…</Text>
        </View>
      </View>
    );
  }

  if (!summary) {
    return (
      <View style={styles.card}>
        <Text style={styles.emptyText}>Nie udało się wczytać profilu</Text>
      </View>
    );
  }

  const showPhoto = Boolean(summary.photo) && !imageError;
  const initials = getInitials(summary.firstName, summary.lastName);

  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <View style={styles.avatarWrap}>
          {showPhoto ? (
            <Image
              source={{ uri: summary.photo }}
              style={styles.avatar}
              onError={() => setImageError(true)}
            />
          ) : (
            <Text style={styles.avatarPlaceholder}>{initials}</Text>
          )}
        </View>
        <Text style={styles.name} numberOfLines={2}>
          {summary.firstName} {summary.lastName}
        </Text>
        {!!summary.albumNumber && (
          <View style={styles.metaRow}>
            <MaterialCommunityIcons
              name="card-account-details-outline"
              size={META_ICON_SIZE}
              color={ansColors.gold}
            />
            <Text style={styles.metaText} numberOfLines={1}>
              Album: {summary.albumNumber}
            </Text>
          </View>
        )}
        {!!summary.major && (
          <View style={styles.metaRow}>
            <MaterialCommunityIcons
              name="school-outline"
              size={META_ICON_SIZE}
              color={ansColors.gold}
            />
            <Text style={styles.metaText} numberOfLines={2}>
              {summary.major}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
