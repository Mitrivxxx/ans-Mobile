import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { PlanService, type Lesson } from '../core/scraper/features/plan/paln.service';

type Props = {
  navigation: {
    goBack: () => void;
  };
};

export default function PlanScreen({ navigation }: Props) {
  const planService = useMemo(() => new PlanService(), []);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLessons = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await planService.getLessons();
      setLessons(data);
    } catch (err) {
      console.error('[PLAN SCREEN]', err);
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
      <Text>{item.date}</Text>
      <Text>
        {item.from} - {item.to}
      </Text>
      <Text>{item.subject}</Text>
      <Text>Sala: {item.room}</Text>
      <Text>Prowadzący: {item.teacher}</Text>
      {item.type ? <Text>Typ: {item.type}</Text> : null}
      {item.groups ? <Text>Grupy: {item.groups}</Text> : null}
      {item.notes ? <Text>Notatki: {item.notes}</Text> : null}
    </View>
  );

  if (loading) {
    return (
      <View>
        <ActivityIndicator />
        <Text>Wczytywanie planu zajęć...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View>
        <Text>{error}</Text>
        <TouchableOpacity onPress={fetchLessons}>
          <Text>Spróbuj ponownie</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text>← Powrót</Text>
      </TouchableOpacity>
      <Text>Plan zajęć</Text>

      {lessons.length === 0 ? (
        <Text>Brak zajęć</Text>
      ) : (
        <FlatList
          data={lessons}
          renderItem={renderLesson}
          keyExtractor={(item, index) => `${item.date}-${item.from}-${index}`}
        />
      )}
    </View>
  );
}
