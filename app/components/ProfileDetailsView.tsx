import React from 'react';
import { Image, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import type {
  CompleteProfileData,
  ProfileSummary,
} from '../core/scraper/features/profile/profile.service';
import { useAppTheme } from '../context/AppThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import {
  createProfileDetailsStyles,
  type ProfileDetailsStyles,
} from './ProfileDetailsView.styles';

type Props = {
  summary: ProfileSummary | null;
  profile: CompleteProfileData | null;
};

type FieldProps = {
  label: string;
  value: string;
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  styles: ProfileDetailsStyles;
  gold: string;
};

function fieldValue(value: string): string {
  return value && value.trim() ? value : '—';
}

function SectionField({ label, value, icon, styles, gold }: FieldProps) {
  return (
    <View style={styles.fieldRow}>
      <View style={styles.fieldIconWrap}>
        <MaterialCommunityIcons
          name={icon ?? 'checkbox-blank-circle-outline'}
          size={16}
          color={gold}
        />
      </View>
      <View style={styles.fieldTextWrap}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.fieldValue}>{fieldValue(value)}</Text>
      </View>
    </View>
  );
}

function ProfileCard({
  title,
  children,
  styles,
}: {
  title: string;
  children: React.ReactNode;
  styles: ProfileDetailsStyles;
}) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.trim().charAt(0)}${lastName.trim().charAt(0)}`.toUpperCase() || '?';
}

export default function ProfileDetailsView({ summary, profile }: Props) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createProfileDetailsStyles);

  if (!summary || !profile) {
    return null;
  }

  const hasPhoto = Boolean(summary.photo);
  const initials = getInitials(summary.firstName, summary.lastName);

  const fieldProps = { styles, gold: colors.gold };

  return (
    <View style={styles.root}>
      <View style={styles.headerCard}>
        <View style={styles.headerTopRow}>
          <View style={styles.avatarWrap}>
            {hasPhoto ? (
              <Image
                source={{ uri: summary.photo }}
                style={styles.avatar}
                accessibilityIgnoresInvertColors
              />
            ) : (
              <Text style={styles.avatarPlaceholder}>{initials}</Text>
            )}
          </View>

          <View style={styles.headerCopy}>
            <Text style={styles.headerName} numberOfLines={2}>
              {summary.firstName} {summary.lastName}
            </Text>
            <Text style={styles.headerMeta} numberOfLines={2}>
              {summary.major}
            </Text>
          </View>
        </View>

        <View style={styles.chipRow}>
          <View style={styles.chip}>
            <Text style={styles.chipLabel}>Album</Text>
            <Text style={styles.chipValue}>{fieldValue(summary.albumNumber)}</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipLabel}>Login</Text>
            <Text style={styles.chipValue}>{fieldValue(profile.login)}</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipLabel}>Status</Text>
            <Text style={styles.chipValue}>{fieldValue(profile.studentStatus)}</Text>
          </View>
        </View>
      </View>

      <ProfileCard title="Konto" styles={styles}>
        <SectionField label="Imię" value={profile.firstName} icon="account" {...fieldProps} />
        <SectionField label="Nazwisko" value={profile.lastName} icon="account" {...fieldProps} />
        <SectionField label="Numer albumu" value={profile.albumNumber} icon="card-account-details-outline" {...fieldProps} />
        <SectionField label="Kierunek" value={profile.major} icon="school-outline" {...fieldProps} />
        <SectionField label="Login" value={profile.login} icon="identifier" {...fieldProps} />
        <SectionField label="Email prywatny" value={profile.privateEmail} icon="email-outline" {...fieldProps} />
        <SectionField label="Email uczelniany" value={profile.universityEmail} icon="email-newsletter" {...fieldProps} />
      </ProfileCard>

      <ProfileCard title="Studia" styles={styles}>
        <SectionField label="Tok studiów" value={profile.studyTrack} icon="timeline-text-outline" {...fieldProps} />
        <SectionField label="Numer legitymacji" value={profile.legitimationNumber} icon="badge-account-outline" {...fieldProps} />
        <SectionField label="Status studenta" value={profile.studentStatus} icon="account-check-outline" {...fieldProps} />
        <SectionField label="Rok" value={profile.year} icon="calendar-range-outline" {...fieldProps} />
        <SectionField label="Semestr" value={profile.semester} icon="numeric-9-box-multiple-outline" {...fieldProps} />
        <SectionField label="Tryb studiów" value={profile.studyMode} icon="swap-horizontal" {...fieldProps} />
        <SectionField label="Wydział" value={profile.faculty} icon="office-building-outline" {...fieldProps} />
        <SectionField label="Specjalność" value={profile.specialization} icon="shape-outline" {...fieldProps} />
        <SectionField label="Uzyskiwany tytuł" value={profile.title} icon="school-outline" {...fieldProps} />
        <SectionField label="Semestr akademicki naboru" value={profile.enrollmentSemester} icon="calendar-star" {...fieldProps} />
        <SectionField label="Data rozpoczęcia studiów" value={profile.studiesStartDate} icon="calendar-start" {...fieldProps} />
        <SectionField label="Przewidywana data zakończenia studiów" value={profile.studiesEndDate} icon="calendar-end" {...fieldProps} />
        <SectionField label="Tok indywidualny" value={profile.individualTrack} icon="account-cog-outline" {...fieldProps} />
        <SectionField label="Numer i data umowy" value={profile.contractNumber} icon="file-document-outline" {...fieldProps} />
      </ProfileCard>
    </View>
  );
}
