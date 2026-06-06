import React, { useCallback, useState, type ReactNode } from 'react';
import { View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';

import ErrorBoundary from './ErrorBoundary';
import { resetScreenQueries } from '../core/queryClient/screenErrorRecovery';
import { useQueryUserKey } from '../core/queryClient/useQueryUserKey';
import type { RootParamList } from '../navigation/navigationRef';

type AppScreenName = Exclude<keyof RootParamList, 'Login'>;

type Props = {
  children: ReactNode;
  screen: AppScreenName;
};

export default function ScreenErrorBoundary({ children, screen }: Props) {
  const queryClient = useQueryClient();
  const userKey = useQueryUserKey();
  const [resetKey, setResetKey] = useState(0);

  const handleRetry = useCallback(() => {
    if (userKey) {
      void resetScreenQueries(queryClient, screen, userKey);
    }
    setResetKey((key) => key + 1);
  }, [queryClient, screen, userKey]);

  return (
    <ErrorBoundary variant="screen" onRetry={handleRetry}>
      <View key={resetKey} style={{ flex: 1 }}>
        {children}
      </View>
    </ErrorBoundary>
  );
}
