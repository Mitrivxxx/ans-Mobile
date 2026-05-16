import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  AnnouncementsService,
  type Announcement,
  type AnnouncementDetails,
} from '../core/scraper/features/announcements/announcements.service';

type Props = {
  navigation: {
    goBack: () => void;
  };
};

export default function AnnouncementsScreen({ navigation }: Props) {
  const announcementsService = useMemo(() => new AnnouncementsService(), []);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selected, setSelected] = useState<AnnouncementDetails | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setSelected(null);
      setSelectedId(null);
      const data = await announcementsService.getAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      console.error('[ANNOUNCEMENTS SCREEN]', err);
      setError('Nie udało się pobrać ogłoszeń');
    } finally {
      setLoading(false);
    }
  }, [announcementsService]);

  const fetchDetails = useCallback(
    async (item: Announcement) => {
      try {
        setDetailsLoading(true);
        setError('');
        setSelectedId(item.id);
        const data = await announcementsService.getAnnouncementDetails(
          item.url || item.id
        );
        setSelected(data);
      } catch (err) {
        console.error('[ANNOUNCEMENTS SCREEN] details', err);
        setError('Nie udało się pobrać szczegółów ogłoszenia');
        setSelected(null);
        setSelectedId(null);
      } finally {
        setDetailsLoading(false);
      }
    },
    [announcementsService]
  );

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  if (loading) {
    return (
      <View>
        <ActivityIndicator />
        <Text>Wczytywanie ogłoszeń...</Text>
      </View>
    );
  }

  if (error && announcements.length === 0 && !selected) {
    return (
      <View>
        <Text>{error}</Text>
        <TouchableOpacity onPress={fetchAnnouncements}>
          <Text>Spróbuj ponownie</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (selected) {
    return (
      <ScrollView>
        <TouchableOpacity
          onPress={() => {
            setSelected(null);
            setSelectedId(null);
          }}
        >
          <Text>← Lista ogłoszeń</Text>
        </TouchableOpacity>
        <Text>Szczegóły ogłoszenia</Text>
        <Text>Nadawca: {selected.authorName}</Text>
        <Text>Data: {selected.date}</Text>
        <Text>Treść (HTML):</Text>
        <Text>{selected.content}</Text>
      </ScrollView>
    );
  }

  return (
    <View>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text>← Powrót</Text>
      </TouchableOpacity>
      <Text>Ogłoszenia</Text>

      {error ? <Text>{error}</Text> : null}
      {detailsLoading ? <Text>Wczytywanie szczegółów...</Text> : null}

      {announcements.length === 0 ? (
        <Text>Brak ogłoszeń</Text>
      ) : (
        <FlatList
          data={announcements}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => fetchDetails(item)}
              disabled={detailsLoading && selectedId === item.id}
            >
              <Text>{item.title}</Text>
              <Text>ID: {item.id}</Text>
              <Text>URL: {item.url}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
