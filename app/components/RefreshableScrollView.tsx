import React, { forwardRef } from 'react';
import { ScrollView, type ScrollViewProps } from 'react-native';

import { useRefreshControlProps } from '../hooks/useRefreshControlProps';

const RefreshableScrollView = forwardRef<ScrollView, ScrollViewProps>(
  function RefreshableScrollView({ refreshControl: _ignored, ...props }, ref) {
    const { refreshControl } = useRefreshControlProps();

    return <ScrollView ref={ref} {...props} refreshControl={refreshControl} />;
  }
);

export default RefreshableScrollView;
