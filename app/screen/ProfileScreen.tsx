import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import ProfileDetailsView from '../components/ProfileDetailsView';
import {
  ProfileService,
  type CompleteProfileData,
  type ProfileSummary,
} from '../core/scraper/features/profile/profile.service';

type Props = {
  navigation: {
    goBack: () => void;
  };
};

export default function ProfileScreen({ navigation }: Props) {
  const profileService = useMemo(() => new ProfileService(), []);
  const [summary, setSummary] = useState<ProfileSummary | null>(null);
  const [profile, setProfile] = useState<CompleteProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const { summary: summaryData, profile: profileData } =
        await profileService.getProfileBundle();
      setSummary(summaryData);
      setProfile(profileData);
    } catch (err) {
      console.error('[PROFILE SCREEN]', err);
      setError('Nie udało się pobrać profilu');
    } finally {
      setLoading(false);
    }
  }, [profileService]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) {
    return (
      <View style={screenStyles.centerState}>
        <ActivityIndicator color="#C9A227" />
        <Text style={screenStyles.stateText}>Wczytywanie profilu...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={screenStyles.centerState}>
        <Text style={screenStyles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchProfile} style={screenStyles.retryButton}>
          <Text style={screenStyles.retryButtonText}>Spróbuj ponownie</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={screenStyles.centerState}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={screenStyles.backText}>← Powrót</Text>
        </TouchableOpacity>
        <Text style={screenStyles.stateText}>Brak danych profilu</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={screenStyles.scrollContent}>
      <ProfileDetailsView summary={summary} profile={profile} />
    </ScrollView>
  );
}

const screenStyles = {
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 36,
    backgroundColor: '#ECEEF1',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
    backgroundColor: '#ECEEF1',
  },
  stateText: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 15,
    color: '#B71C1C',
    textAlign: 'center',
    fontWeight: '700',
  },
  retryButton: {
    marginTop: 4,
    backgroundColor: '#0D0D0D',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },
  retryButtonText: {
    color: '#C9A227',
    fontWeight: '800',
    fontSize: 15,
  },
} as const;
