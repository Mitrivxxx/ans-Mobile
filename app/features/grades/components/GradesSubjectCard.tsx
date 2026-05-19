import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SessionExpiredError } from '../../../core/scraper/auth/sessionValidation';
import type {
  SubjectActivityDetails,
  SubjectGrade,
} from '../../../core/scraper/features/grades/grades.service';
import { usePartialGradesQuery } from '../hooks/usePartialGradesQuery';
import { getGradeBadgeStyle } from '../gradeBadgeStyle';
import type { GradesColors } from '../gradesTheme';
import { useGradesColors } from '../useGradesColors';
import { useGradesThemedStyles } from '../useGradesThemedStyles';
import {
  createGradesSubjectCardStyles,
} from './GradesSubjectCard.styles';

type SubjectCardStyles = ReturnType<typeof createGradesSubjectCardStyles>;

type Props = {
  subject: SubjectGrade;
  expandable?: boolean;
};

function PartialGradeRow({
  label,
  value,
  styles,
  palette,
}: {
  label: string;
  value: string;
  styles: SubjectCardStyles;
  palette: GradesColors;
}) {
  const badgeStyle = getGradeBadgeStyle(value, palette);

  return (
    <View style={styles.partialRow}>
      {label ? (
        <Text style={styles.partialLabel} numberOfLines={2}>
          {label}
        </Text>
      ) : null}
      <View
        style={[
          styles.partialGradeBadge,
          { backgroundColor: badgeStyle.backgroundColor },
        ]}
      >
        <Text style={[styles.partialGradeText, { color: badgeStyle.color }]}>
          {value || '—'}
        </Text>
      </View>
    </View>
  );
}

function ActivitySection({
  activity,
  styles,
  palette,
}: {
  activity: SubjectActivityDetails;
  styles: SubjectCardStyles;
  palette: GradesColors;
}) {
  const badgeStyle = getGradeBadgeStyle(activity.finalGrade, palette);

  return (
    <View style={styles.activityBlock}>
      <View style={styles.activityHeader}>
        <Text style={styles.activityForm}>{activity.form}</Text>
        <View
          style={[
            styles.activityFinalBadge,
            { backgroundColor: badgeStyle.backgroundColor },
          ]}
        >
          <Text style={[styles.activityFinalText, { color: badgeStyle.color }]}>
            {activity.finalGrade || '—'}
          </Text>
        </View>
      </View>

      {activity.partialGrades.length > 0 ? (
        <View style={styles.partialList}>
          {activity.partialGrades.map((entry, index) => (
            <PartialGradeRow
              key={`${activity.form}-${index}-${entry.label}-${entry.value}`}
              label={entry.label}
              value={entry.value}
              styles={styles}
              palette={palette}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function partialGradesErrorMessage(error: unknown): string {
  if (error instanceof SessionExpiredError) {
    return 'Sesja wygasła — zaloguj się ponownie.';
  }
  return 'Nie udało się pobrać szczegółów';
}

export default function GradesSubjectCard({
  subject,
  expandable = false,
}: Props) {
  const gradesColors = useGradesColors();
  const styles = useGradesThemedStyles(createGradesSubjectCardStyles);
  const [expanded, setExpanded] = useState(false);
  const canExpand = expandable && subject.pplsId != null;
  const shouldFetchPartial =
    expanded && canExpand && subject.partialGrades.length === 0;

  const partialQuery = usePartialGradesQuery(
    subject.pplsId,
    shouldFetchPartial
  );

  const activities: SubjectActivityDetails[] =
    subject.partialGrades.length > 0
      ? subject.partialGrades
      : (partialQuery.data ?? []);

  const loadingDetails = shouldFetchPartial && partialQuery.isFetching;
  const detailsError =
    partialQuery.isError && !partialQuery.data
      ? partialGradesErrorMessage(partialQuery.error)
      : '';

  useEffect(() => {
    setExpanded(false);
  }, [subject.pplsId, subject.subject]);

  const grade = subject.finalGrade || '—';
  const badgeStyle = getGradeBadgeStyle(subject.finalGrade, gradesColors);

  const handleToggle = useCallback(() => {
    if (!canExpand) return;
    setExpanded((current) => !current);
  }, [canExpand]);

  const retryPartial = useCallback(() => {
    void partialQuery.refetch();
  }, [partialQuery]);

  const cardContent = (
    <>
      <View style={styles.info}>
        <Text style={styles.subjectName} numberOfLines={2}>
          {subject.subject}
        </Text>
        {subject.teacher ? (
          <Text style={styles.teacher} numberOfLines={1}>
            {subject.teacher}
          </Text>
        ) : null}
      </View>

      <View style={styles.trailing}>
        <View
          style={[
            styles.gradeBadge,
            { backgroundColor: badgeStyle.backgroundColor },
          ]}
        >
          <Text style={[styles.gradeText, { color: badgeStyle.color }]}>
            {grade}
          </Text>
        </View>
        {canExpand ? (
          <MaterialCommunityIcons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={22}
            color={gradesColors.textMuted}
            style={styles.chevron}
          />
        ) : null}
      </View>
    </>
  );

  return (
    <View style={styles.wrap}>
      {canExpand ? (
        <TouchableOpacity
          style={[styles.card, expanded && styles.cardExpanded]}
          onPress={handleToggle}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityState={{ expanded }}
        >
          {cardContent}
        </TouchableOpacity>
      ) : (
        <View style={styles.card}>{cardContent}</View>
      )}

      {expanded ? (
        <View style={styles.details}>
          {loadingDetails ? (
            <View style={styles.detailsState}>
              <ActivityIndicator color={gradesColors.primary} size="small" />
              <Text style={styles.detailsStateText}>Wczytywanie ocen…</Text>
            </View>
          ) : null}

          {!loadingDetails && detailsError ? (
            <View style={styles.detailsState}>
              <Text style={styles.detailsErrorText}>{detailsError}</Text>
              <TouchableOpacity onPress={retryPartial} activeOpacity={0.8}>
                <Text style={styles.retryText}>Spróbuj ponownie</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {!loadingDetails && !detailsError && activities.length === 0 ? (
            <Text style={styles.noPartialText}>Brak szczegółów ocen</Text>
          ) : null}

          {!loadingDetails && !detailsError
            ? activities.map((activity) => (
                <ActivitySection
                  key={activity.form}
                  activity={activity}
                  styles={styles}
                  palette={gradesColors}
                />
              ))
            : null}
        </View>
      ) : null}
    </View>
  );
}
