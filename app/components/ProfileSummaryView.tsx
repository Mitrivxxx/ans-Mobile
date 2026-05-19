import React from 'react';
import { ActivityIndicator, Image, Text, View } from 'react-native';

import type { ProfileSummary } from '../core/scraper/features/profile/profile.service';
import { useProfilePhoto } from '../hooks/useProfilePhoto';

const AVATAR_SIZE = 96;

type Props = {
  summary: ProfileSummary | null;
  loading?: boolean;
};

export default function ProfileSummaryView({ summary, loading }: Props) {
  const { displayUri, showPhoto, onImageError, imageKey } = useProfilePhoto(
    summary?.photo
  );

  if (loading) {
    return (
      <View>
        <ActivityIndicator />
        <Text>Wczytywanie profilu...</Text>
      </View>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <View>
      {showPhoto ? (
        <Image
          key={imageKey}
          source={{ uri: displayUri }}
          style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
          onError={onImageError}
        />
      ) : (
        <Text>Brak zdjęcia</Text>
      )}
      <Text>
        {summary.firstName} {summary.lastName}
      </Text>
      <Text>Album: {summary.albumNumber}</Text>
      <Text>Kierunek: {summary.major}</Text>
    </View>
  );
}
