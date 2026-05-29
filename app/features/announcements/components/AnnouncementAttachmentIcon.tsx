import React from 'react';
import Svg, { Path } from 'react-native-svg';

type Props = {
  size?: number;
  color: string;
};

/** Ikona załącznika (spinacz) przy tytule na liście ogłoszeń. */
export default function AnnouncementAttachmentIcon({
  size = 18,
  color,
}: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"
        stroke={color}
        strokeWidth={2.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
