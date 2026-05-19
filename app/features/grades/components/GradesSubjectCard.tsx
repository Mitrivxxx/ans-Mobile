import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  GradesService,
  type SubjectActivityDetails,
  type SubjectGrade,
} from '../../../core/scraper/features/grades/grades.service';
import { getGradeBadgeStyle } from '../gradeBadgeStyle';
import { gradesColors } from '../gradesTheme';
import { gradesSubjectCardStyles as styles } from './GradesSubjectCard.styles';

type Props = {
  subject: SubjectGrade;
  expandable?: boolean;
};

function PartialGradeRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const badgeStyle = getGradeBadgeStyle(value);

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

function ActivitySection({ activity }: { activity: SubjectActivityDetails }) {
  const badgeStyle = getGradeBadgeStyle(activity.finalGrade);

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
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

export default function GradesSubjectCard({
  subject,
  expandable = false,
}: Props) {
  const gradesService = useMemo(() => new GradesService(), []);
  const [expanded, setExpanded] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState('');
  const [activities, setActivities] = useState<SubjectActivityDetails[]>(
    subject.partialGrades
  );

  useEffect(() => {
    setExpanded(false);
    setDetailsError('');
    setLoadingDetails(false);
    setActivities(subject.partialGrades);
  }, [subject.pplsId, subject.subject, subject.partialGrades]);

  const grade = subject.finalGrade || '—';
  const badgeStyle = getGradeBadgeStyle(subject.finalGrade);
  const canExpand = expandable && subject.pplsId != null;

  const loadDetails = useCallback(async () => {
    if (subject.pplsId == null) return;
    if (activities.length > 0) return;

    try {
      setLoadingDetails(true);
      setDetailsError('');
      const data = await gradesService.getPartialGrades(subject.pplsId);
      setActivities(data);
    } catch (err) {
      console.error('[GRADES PARTIAL]', err);
      setDetailsError('Nie udało się pobrać szczegółów');
    } finally {
      setLoadingDetails(false);
    }
  }, [activities.length, gradesService, subject.pplsId]);

  const handleToggle = useCallback(() => {
    if (!canExpand) return;

    setExpanded((current) => {
      const next = !current;
      if (next) {
        void loadDetails();
      }
      return next;
    });
  }, [canExpand, loadDetails]);

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
              <TouchableOpacity onPress={loadDetails} activeOpacity={0.8}>
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
                />
              ))
            : null}
        </View>
      ) : null}
    </View>
  );
}
