import React from 'react';
import { Image, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import type { CompleteProfileData, ProfileSummary } from '../core/scraper/features/profile/profile.service';
import { ansColors } from '../theme/ansTheme';

type Props = {
  summary: ProfileSummary | null;
  profile: CompleteProfileData | null;
};

type FieldProps = {
  label: string;
  value: string;
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
};

const AVATAR_SIZE = 108;

function fieldValue(value: string): string {
  return value && value.trim() ? value : '—';
}

function SectionField({ label, value, icon }: FieldProps) {
  return (
    <View style={styles.fieldRow}>
      <View style={styles.fieldIconWrap}>
        <MaterialCommunityIcons
          name={icon ?? 'checkbox-blank-circle-outline'}
          size={16}
          color={ansColors.gold}
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
}: {
  title: string;
  children: React.ReactNode;
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
  if (!summary || !profile) {
    return null;
  }

  const hasPhoto = Boolean(summary.photo);
  const initials = getInitials(summary.firstName, summary.lastName);

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

      <ProfileCard title="Konto">
        <SectionField label="Imię" value={profile.firstName} icon="account" />
        <SectionField label="Nazwisko" value={profile.lastName} icon="account" />
        <SectionField label="Numer albumu" value={profile.albumNumber} icon="card-account-details-outline" />
        <SectionField label="Kierunek" value={profile.major} icon="school-outline" />
        <SectionField label="Login" value={profile.login} icon="identifier" />
        <SectionField label="Email prywatny" value={profile.privateEmail} icon="email-outline" />
        <SectionField label="Email uczelniany" value={profile.universityEmail} icon="email-newsletter" />
      </ProfileCard>

      <ProfileCard title="Studia">
        <SectionField label="Tok studiów" value={profile.studyTrack} icon="timeline-text-outline" />
        <SectionField label="Numer legitymacji" value={profile.legitimationNumber} icon="badge-account-outline" />
        <SectionField label="Status studenta" value={profile.studentStatus} icon="account-check-outline" />
        <SectionField label="Rok" value={profile.year} icon="calendar-range-outline" />
        <SectionField label="Semestr" value={profile.semester} icon="numeric-9-box-multiple-outline" />
        <SectionField label="Tryb studiów" value={profile.studyMode} icon="swap-horizontal" />
        <SectionField label="Wydział" value={profile.faculty} icon="office-building-outline" />
        <SectionField label="Specjalność" value={profile.specialization} icon="shape-outline" />
        <SectionField label="Uzyskiwany tytuł" value={profile.title} icon="school-outline" />
        <SectionField label="Semestr akademicki naboru" value={profile.enrollmentSemester} icon="calendar-star" />
        <SectionField label="Data rozpoczęcia studiów" value={profile.studiesStartDate} icon="calendar-start" />
        <SectionField label="Przewidywana data zakończenia studiów" value={profile.studiesEndDate} icon="calendar-end" />
        <SectionField label="Tok indywidualny" value={profile.individualTrack} icon="account-cog-outline" />
        <SectionField label="Numer i data umowy" value={profile.contractNumber} icon="file-document-outline" />
      </ProfileCard>
    </View>
  );
}

const styles = {
  root: {
    gap: 16,
  },
  headerCard: {
    backgroundColor: ansColors.surface,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: ansColors.grayBorder,
    shadowColor: ansColors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  headerTopRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  avatarWrap: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 2,
    borderColor: ansColors.gold,
    overflow: 'hidden',
    backgroundColor: ansColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },
  avatarPlaceholder: {
    color: ansColors.gold,
    fontSize: 28,
    fontWeight: '800',
  },
  headerCopy: {
    flex: 1,
  },
  headerName: {
    color: ansColors.charcoal,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
  },
  headerMeta: {
    color: ansColors.gray,
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  chipRow: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  chip: {
    minWidth: 96,
    flexGrow: 1,
    backgroundColor: ansColors.background,
    borderWidth: 1,
    borderColor: ansColors.grayBorder,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  chipLabel: {
    color: ansColors.gray,
    fontSize: 12,
    marginBottom: 4,
  },
  chipValue: {
    color: ansColors.charcoal,
    fontSize: 14,
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: ansColors.surface,
    borderRadius: 24,
    padding: 18,
    shadowColor: ansColors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
    borderWidth: 1,
    borderColor: ansColors.grayBorder,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: ansColors.charcoal,
    marginBottom: 14,
  },
  sectionBody: {
    gap: 10,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: ansColors.background,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ECE9E1',
  },
  fieldIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(201,162,39,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  fieldTextWrap: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: ansColors.gray,
    marginBottom: 4,
    fontWeight: '700',
  },
  fieldValue: {
    fontSize: 15,
    lineHeight: 21,
    color: ansColors.charcoal,
    fontWeight: '600',
  },
} as const;