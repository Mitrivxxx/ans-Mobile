import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import ProfileDetailsView from '../components/ProfileDetailsView';
import RefreshableScrollView from '../components/RefreshableScrollView';
import { useStudentProfile } from '../context/StudentProfileContext';
import { useGradesIndexQuery } from '../features/grades/hooks/useGradesIndexQuery';
import { pickPrioritySemesterMeta } from '../features/profile/hooks/pickPrioritySemesterMeta';
import { useProfileDetailsQuery } from '../features/profile/hooks/useProfileDetailsQuery';
import { useStudentGroupsQuery } from '../features/profile/hooks/useStudentGroupsQuery';
import { useRegisterScreenRefresh } from '../hooks/useRegisterScreenRefresh';
import { useAppTheme } from '../context/AppThemeContext';

type Props = {
  navigation: {
    goBack: () => void;
  };
};

export default function ProfileScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const {
    summary,
    loading: summaryLoading,
    refetch: refetchSummary,
  } = useStudentProfile();
  const {
    profile,
    isInitialLoading: detailsLoading,
    forceRefresh: forceRefreshDetails,
    isFatalError: detailsFatalError,
  } = useProfileDetailsQuery();
  const { index: gradesIndex } = useGradesIndexQuery();

  const academicSemester = useMemo(() => {
    const semesters = gradesIndex?.semesters ?? [];
    return pickPrioritySemesterMeta(semesters)?.academicSemester ?? null;
  }, [gradesIndex]);

  const {
    data: groupsData,
    isInitialLoading: groupsLoading,
    hasCachedGroups,
    forceRefresh: forceRefreshGroups,
  } = useStudentGroupsQuery(academicSemester);

  const refreshProfile = useCallback(async () => {
    await Promise.all([
      refetchSummary(),
      forceRefreshDetails(),
      forceRefreshGroups(),
    ]);
  }, [forceRefreshDetails, forceRefreshGroups, refetchSummary]);

  useRegisterScreenRefresh(refreshProfile);

  const loading =
    (summaryLoading && !summary) || (detailsLoading && !profile);
  const summaryReady = summary;
  const profileReady = profile;

  const dynamicStyles = useMemo(
    () => ({
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
        backgroundColor: colors.retryButtonBg,
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 14,
      },
      retryButtonText: {
        color: colors.retryButtonText,
        fontWeight: '800' as const,
        fontSize: 15,
      },
    }),
    [colors]
  );

  if (loading) {
    return (
      <RefreshableScrollView contentContainerStyle={dynamicStyles.centerStateScroll}>
        <ActivityIndicator color={colors.gold} />
        <Text style={dynamicStyles.stateText}>Wczytywanie profilu...</Text>
      </RefreshableScrollView>
    );
  }

  if (detailsFatalError && !profileReady) {
    return (
      <RefreshableScrollView contentContainerStyle={dynamicStyles.centerStateScroll}>
        <Text style={dynamicStyles.errorText}>Nie udało się pobrać profilu</Text>
        <TouchableOpacity
          onPress={() => void refreshProfile()}
          style={dynamicStyles.retryButton}
        >
          <Text style={dynamicStyles.retryButtonText}>Spróbuj ponownie</Text>
        </TouchableOpacity>
      </RefreshableScrollView>
    );
  }

  if (!profileReady || !summaryReady) {
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
      <ProfileDetailsView
        summary={summaryReady}
        profile={profileReady}
        groups={groupsData?.groups ?? []}
        groupsSemesterLabel={groupsData?.academicSemester ?? academicSemester}
        groupsLoading={groupsLoading && !hasCachedGroups}
      />
    </RefreshableScrollView>
  );
}
