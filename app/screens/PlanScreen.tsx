import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { PlanService } from '../core/scraper/api/plan/plan-service';
import type { Lesson } from '../core/scraper/api/parser/plan-parser';

type Props = {
  navigation: any;
};

export default function PlanScreen({
  navigation,
}: Props) {
  const planService = useMemo(
    () => new PlanService(),
    []
  );

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLessons = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      console.log('[PLAN SCREEN] Fetching lessons');

      const data = await planService.getLessons();

      setLessons(data);

      console.log('[PLAN SCREEN] Lessons loaded:', data.length);
    } catch (err: any) {
      console.error('[PLAN SCREEN] Error:', err);
      setError('Nie udało się pobrać planu zajęć');
    } finally {
      setLoading(false);
    }
  }, [planService]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  const renderLesson = ({ item }: { item: Lesson }) => (
    <View>
      <View>
        <Text>{item.date}</Text>
        <Text>
          {item.from} - {item.to}
        </Text>
      </View>

      <Text>
        {item.subject}
      </Text>

      <View>
        <Text>
          📍 {item.room}
        </Text>
        <Text>
          👨‍🏫 {item.teacher}
        </Text>
      </View>

      {item.type && (
        <Text>
          Typ: {item.type}
        </Text>
      )}

      {item.groups && (
        <Text>
          Grupy: {item.groups}
        </Text>
      )}

      {item.notes && (
        <Text>
          Notatki: {item.notes}
        </Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>
          Wczytywanie planu zajęć...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View>
        <Text>{error}</Text>
        <TouchableOpacity
          onPress={fetchLessons}
        >
          <Text>
            Spróbuj ponownie
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View>
      <View>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
        >
          <Text>
            ← Powrót
          </Text>
        </TouchableOpacity>
        <Text>Plan zajęć</Text>
      </View>

      {lessons.length === 0 ? (
        <View>
          <Text>
            Brak zajęć
          </Text>
        </View>
      ) : (
        <FlatList
          data={lessons}
          renderItem={renderLesson}
          keyExtractor={(item, index) =>
            `${item.date}-${item.from}-${index}`
          }
        />
      )}
    </View>
  );
}
