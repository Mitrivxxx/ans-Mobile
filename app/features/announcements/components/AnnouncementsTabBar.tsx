import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { useThemedStyles } from '../../../theme/useThemedStyles';
import { createAnnouncementsTabBarStyles } from './AnnouncementsTabBar.styles';

export type AnnouncementsTab = 'announcements' | 'archive';

type Props = {
  activeTab: AnnouncementsTab;
  onTabChange: (tab: AnnouncementsTab) => void;
};

const TABS: { id: AnnouncementsTab; label: string }[] = [
  { id: 'announcements', label: 'Ogłoszenia' },
  { id: 'archive', label: 'Archiwum' },
];

export default function AnnouncementsTabBar({ activeTab, onTabChange }: Props) {
  const styles = useThemedStyles(createAnnouncementsTabBarStyles);

  return (
    <View style={styles.wrap}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onTabChange(tab.id)}
            style={({ pressed }) => [
              styles.tab,
              isActive && styles.tabActive,
              pressed && styles.tabPressed,
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab.label}
          >
            <Text
              style={[styles.tabLabel, isActive && styles.tabLabelActive]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
