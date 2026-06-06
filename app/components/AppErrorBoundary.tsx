import React, { useCallback, useState, type ReactNode } from 'react';

import ErrorBoundary from './ErrorBoundary';

type Props = {
  children: ReactNode;
};

export default function AppErrorBoundary({ children }: Props) {
  const [resetKey, setResetKey] = useState(0);

  const handleRetry = useCallback(() => {
    setResetKey((key) => key + 1);
  }, []);

  return (
    <ErrorBoundary variant="app" onRetry={handleRetry}>
      <React.Fragment key={resetKey}>{children}</React.Fragment>
    </ErrorBoundary>
  );
}
