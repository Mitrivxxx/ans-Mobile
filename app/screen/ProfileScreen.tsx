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
import { useAppTheme } from '../context/AppThemeContext';
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
  const { colors } = useAppTheme();
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

  const createDynamicStyles = () => ({
    scrollContent: {
      paddingHorizontal: 24,
      paddingTop: 18,
      paddingBottom: 36,
      backgroundColor: colors.dashboardBg,
    },
    backText: {
      fontSize: 16,
      fontWeight: '700' as const,
      color: colors.charcoal,
    },
    centerStateScroll: {
      flexGrow: 1,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      padding: 24,
      gap: 12,
      backgroundColor: colors.dashboardBg,
    },
    stateText: {
      fontSize: 15,
      color: colors.gray,
      textAlign: 'center' as const,
    },
    errorText: {
      fontSize: 15,
      color: colors.error,
      textAlign: 'center' as const,
      fontWeight: '700' as const,
    },
    retryButton: {
      marginTop: 4,
      backgroundColor: colors.black,
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderRadius: 14,
    },
    retryButtonText: {
      color: colors.gold,
      fontWeight: '800' as const,
      fontSize: 15,
    },
  });

  const dynamicStyles = createDynamicStyles();

  if (loading) {
    return (
      <RefreshableScrollView contentContainerStyle={dynamicStyles.centerStateScroll}>
        <ActivityIndicator color={colors.gold} />
        <Text style={dynamicStyles.stateText}>Wczytywanie profilu...</Text>
      </RefreshableScrollView>
    );
  }

  if (error) {
    return (
      <RefreshableScrollView contentContainerStyle={dynamicStyles.centerStateScroll}>
        <Text style={dynamicStyles.errorText}>{error}</Text>
        <TouchableOpacity
          onPress={fetchProfileDetails}
          style={dynamicStyles.retryButton}
        >
          <Text style={dynamicStyles.retryButtonText}>Spróbuj ponownie</Text>
        </TouchableOpacity>
      </RefreshableScrollView>
    );
  }

  if (!profile || !summary) {
    return (
      <RefreshableScrollView contentContainerStyle={dynamicStyles.centerStateScroll}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={dynamicStyles.backText}>← Powrót</Text>
        </TouchableOpacity>
        <Text style={dynamicStyles.stateText}>Brak danych profilu</Text>
      </RefreshableScrollView>
    );
  }

  return (
    <RefreshableScrollView contentContainerStyle={dynamicStyles.scrollContent}>
      <ProfileDetailsView summary={summary} profile={profile} />
    </RefreshableScrollView>
  );
}
