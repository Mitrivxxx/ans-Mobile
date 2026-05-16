import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Text, View } from 'react-native';

import type { ProfileSummary } from '../core/scraper/features/profile/profile.service';

const AVATAR_SIZE = 96;

type Props = {
  summary: ProfileSummary | null;
  loading?: boolean;
};

export default function ProfileSummaryView({ summary, loading }: Props) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [summary?.photo]);

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

  const showPhoto = Boolean(summary.photo) && !imageError;

  return (
    <View>
      {showPhoto ? (
        <Image
          source={{ uri: summary.photo }}
          style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
          onError={() => setImageError(true)}
        />
      ) : (
        <Text>
          {imageError ? 'Nie udało się wyświetlić zdjęcia' : 'Brak zdjęcia'}
        </Text>
      )}
      <Text>
        {summary.firstName} {summary.lastName}
      </Text>
      <Text>Album: {summary.albumNumber}</Text>
      <Text>Kierunek: {summary.major}</Text>
    </View>
  );
}
