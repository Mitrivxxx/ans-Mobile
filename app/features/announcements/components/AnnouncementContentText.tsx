import React, { useCallback, useMemo } from 'react';
import {
  Alert,
  Linking,
  StyleSheet,
  Text,
  type TextStyle,
} from 'react-native';

import { useAppTheme } from '../../../context/AppThemeContext';
import { parseAnnouncementContentSegments } from '../utils/parseAnnouncementContentSegments';

type Props = {
  html: string;
  baseStyle: TextStyle;
};

export default function AnnouncementContentText({ html, baseStyle }: Props) {
  const { colors } = useAppTheme();
  const linkStyle = useMemo(
    () =>
      StyleSheet.create({
        link: {
          color: colors.dashboardBlue,
          textDecorationLine: 'underline',
        },
      }).link,
    [colors.dashboardBlue]
  );

  const segments = useMemo(
    () => parseAnnouncementContentSegments(html),
    [html]
  );

  const openLink = useCallback(async (url: string) => {
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

  if (segments.length === 0) {
    return (
      <Text style={baseStyle} selectable>
        -
      </Text>
    );
  }

  return (
    <Text style={baseStyle} selectable>
      {segments.map((segment, index) =>
        segment.type === 'link' ? (
          <Text
            key={`link-${index}`}
            style={linkStyle}
            onPress={() => void openLink(segment.url)}
            accessibilityRole="link"
          >
            {segment.value}
          </Text>
        ) : (
          <Text key={`text-${index}`}>{segment.value}</Text>
        )
      )}
    </Text>
  );
}
