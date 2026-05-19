import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import ProfileDetailsView from '../components/ProfileDetailsView';
import RefreshableScrollView from '../components/RefreshableScrollView';
import { useStudentProfile } from '../context/StudentProfileContext';
import { useRegisterScreenRefresh } from '../hooks/useRegisterScreenRefresh';
import {
  ProfileService,
  type CompleteProfileData,
} from '../core/scraper/features/profile/profile.service';

type Props = {
  navigation: {
    goBack: () => void;
  };
};

export default function ProfileScreen({ navigation }: Props) {
  const profileService = useMemo(() => new ProfileService(), []);
  const {
    summary: cachedSummary,
    loading: summaryLoading,
    refetch: refetchSummary,
  } = useStudentProfile();
  const [profile, setProfile] = useState<CompleteProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState('');

  const fetchProfileDetails = useCallback(async () => {
    try {
      setLoadingProfile(true);
      setError('');
      const profileData = await profileService.getProfile();
      setProfile(profileData);
    } catch (err) {
      console.error('[PROFILE SCREEN]', err);
      setError('Nie udało się pobrać profilu');
    } finally {
      setLoadingProfile(false);
    }
  }, [profileService]);

  useEffect(() => {
    void fetchProfileDetails();
  }, [fetchProfileDetails]);

  const refreshProfile = useCallback(async () => {
    await Promise.all([refetchSummary(), fetchProfileDetails()]);
  }, [fetchProfileDetails, refetchSummary]);

  useRegisterScreenRefresh(refreshProfile);

  const loading = summaryLoading || (loadingProfile && !profile);
  const summary = cachedSummary;

  if (loading) {
    return (
      <RefreshableScrollView contentContainerStyle={screenStyles.centerStateScroll}>
        <ActivityIndicator color="#C9A227" />
        <Text style={screenStyles.stateText}>Wczytywanie profilu...</Text>
      </RefreshableScrollView>
    );
  }

  if (error) {
    return (
      <RefreshableScrollView contentContainerStyle={screenStyles.centerStateScroll}>
        <Text style={screenStyles.errorText}>{error}</Text>
        <TouchableOpacity
          onPress={fetchProfileDetails}
          style={screenStyles.retryButton}
        >
          <Text style={screenStyles.retryButtonText}>Spróbuj ponownie</Text>
        </TouchableOpacity>
      </RefreshableScrollView>
    );
  }

  if (!profile || !summary) {
    return (
      <RefreshableScrollView contentContainerStyle={screenStyles.centerStateScroll}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={screenStyles.backText}>← Powrót</Text>
        </TouchableOpacity>
        <Text style={screenStyles.stateText}>Brak danych profilu</Text>
      </RefreshableScrollView>
    );
  }

  return (
    <RefreshableScrollView contentContainerStyle={screenStyles.scrollContent}>
      <ProfileDetailsView summary={summary} profile={profile} />
    </RefreshableScrollView>
  );
}

const screenStyles = {
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 36,
    backgroundColor: '#ECEEF1',
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
  centerStateScroll: {
    flexGrow: 1,
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
