import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import ProfileSummaryView from '../components/ProfileSummaryView';
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

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text>{label}</Text>
      <Text>{value || '—'}</Text>
    </View>
  );
}

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
      <View>
        <ActivityIndicator />
        <Text>Wczytywanie profilu...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View>
        <Text>{error}</Text>
        <TouchableOpacity onPress={fetchProfile}>
          <Text>Spróbuj ponownie</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!profile) {
    return (
      <View>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text>← Powrót</Text>
        </TouchableOpacity>
        <Text>Brak danych profilu</Text>
      </View>
    );
  }

  return (
    <ScrollView>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text>← Powrót</Text>
      </TouchableOpacity>
      <Text>Profil</Text>

      <ProfileSummaryView summary={summary} />

      <Text>Konto</Text>
      <ProfileField label="Imię" value={profile.firstName} />
      <ProfileField label="Nazwisko" value={profile.lastName} />
      <ProfileField label="Numer albumu" value={profile.albumNumber} />
      <ProfileField label="Kierunek" value={profile.major} />
      <ProfileField label="Login" value={profile.login} />
      <ProfileField label="Email prywatny" value={profile.privateEmail} />
      <ProfileField label="Email uczelniany" value={profile.universityEmail} />
      <ProfileField
        label="Data ostatniego logowania"
        value={profile.lastLoginDate}
      />
      <ProfileField
        label="Data ostatniej zmiany hasła"
        value={profile.lastPasswordChangeDate}
      />

      <Text>Studia</Text>
      <ProfileField label="Tok studiów" value={profile.studyTrack} />
      <ProfileField
        label="Numer legitymacji"
        value={profile.legitimationNumber}
      />
      <ProfileField label="Status studenta" value={profile.studentStatus} />
      <ProfileField label="Rok" value={profile.year} />
      <ProfileField label="Semestr" value={profile.semester} />
      <ProfileField label="Tryb studiów" value={profile.studyMode} />
      <ProfileField label="Wydział" value={profile.faculty} />
      <ProfileField label="Specjalność" value={profile.specialization} />
      <ProfileField label="Uzyskiwany tytuł" value={profile.title} />
      <ProfileField
        label="Semestr akademicki naboru"
        value={profile.enrollmentSemester}
      />
      <ProfileField
        label="Data rozpoczęcia studiów"
        value={profile.studiesStartDate}
      />
      <ProfileField
        label="Przewidywana data zakończenia studiów"
        value={profile.studiesEndDate}
      />
      <ProfileField label="Tok indywidualny" value={profile.individualTrack} />
      <ProfileField label="Numer i data umowy" value={profile.contractNumber} />
    </ScrollView>
  );
}
