import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  Text,
  View,
} from 'react-native';

import { useAppTheme } from '../../../context/AppThemeContext';
import type { PublicEvent } from '../../../core/scraper/events/events.service';
import { useEventsQuery } from '../../events/hooks/useEventsQuery';
import { createDashboardEventsSectionStyles } from './DashboardEventsSection.styles';

function EventItem({
  event,
  showDivider,
  styles,
  onOpen,
}: {
  event: PublicEvent;
  showDivider: boolean;
  styles: ReturnType<typeof createDashboardEventsSectionStyles>;
  onOpen: (url: string) => void;
}) {
  return (
    <Pressable
      onPress={() => onOpen(event.url)}
      style={[styles.item, showDivider && styles.itemDivider]}
      accessibilityRole="link"
      accessibilityLabel={`${event.day} ${event.monthLabel}, ${event.title}`}
    >
      <Text style={styles.day}>{event.day}</Text>
      <Text style={styles.month}>{event.monthLabel}</Text>
      <Text style={styles.eventTitle} numberOfLines={4}>
        {event.title}
      </Text>
    </Pressable>
  );
}

export default function DashboardEventsSection() {
  const { colors, isDarkMode } = useAppTheme();
  const {
    events,
    isInitialLoading,
    hasCachedEvents,
    departments,
    selectedDepartment,
    setDepartment,
  } = useEventsQuery();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const styles = useMemo(
    () =>
      createDashboardEventsSectionStyles(
        colors,
        isDarkMode,
        selectedDepartment.panelColor
      ),
    [colors, isDarkMode, selectedDepartment.panelColor]
  );

  const openEventUrl = useCallback(async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert('Nie można otworzyć linku', url);
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert('Nie można otworzyć linku', url);
    }
  }, []);

  const toggleDropdown = useCallback(() => {
    setIsDropdownOpen((value) => !value);
  }, []);

  const onSelectDepartment = useCallback(
    (departmentId: typeof selectedDepartment.id) => {
      setIsDropdownOpen(false);
      void setDepartment(departmentId);
    },
    [setDepartment]
  );

  if (isInitialLoading && !hasCachedEvents) {
    return (
      <View style={styles.wrap}>
        <View style={styles.card}>
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={isDarkMode ? '#FFFFFF' : '#1A4D3E'} />
            <Text style={styles.loadingText}>Wczytywanie wydarzeń…</Text>
          </View>
        </View>
      </View>
    );
  }

  if (events.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.card} accessibilityRole="summary">
        <View style={styles.headerRow}>
          <Text style={styles.title}>Wydarzenia</Text>
          <View style={styles.titleUnderline} />
          <View style={styles.dropdownWrap}>
            <Pressable
              onPress={toggleDropdown}
              style={styles.dropdownButton}
              accessibilityRole="button"
              accessibilityState={{ expanded: isDropdownOpen }}
              accessibilityLabel="Wybierz wydział wydarzeń"
            >
              <Text style={styles.dropdownButtonText} numberOfLines={1}>
                {selectedDepartment.label}
              </Text>
              <Text style={styles.dropdownChevron}>{isDropdownOpen ? '▲' : '▼'}</Text>
            </Pressable>

            {isDropdownOpen ? (
              <View style={styles.dropdownMenu}>
                {departments.map((department) => (
                  <Pressable
                    key={department.id}
                    onPress={() => onSelectDepartment(department.id)}
                    style={({ pressed }) => [
                      styles.dropdownItem,
                      pressed && styles.dropdownItemPressed,
                    ]}
                    accessibilityRole="button"
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        department.id === selectedDepartment.id &&
                          styles.dropdownItemTextActive,
                      ]}
                      numberOfLines={2}
                    >
                      {department.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.row}>
          {events.map((event, index) => (
            <EventItem
              key={event.id}
              event={event}
              showDivider={index < events.length - 1}
              styles={styles}
              onOpen={openEventUrl}
            />
          ))}
        </View>
      </View>
    </View>
  );
}
