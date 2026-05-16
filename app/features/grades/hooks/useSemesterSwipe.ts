import { useMemo, useRef } from 'react';
import { PanResponder } from 'react-native';

const SWIPE_THRESHOLD = 48;
const SWIPE_ACTIVATION = 14;

type Options = {
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

export function useSemesterSwipe({
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
}: Options) {
  const navigationRef = useRef({ canGoPrevious, canGoNext, onPrevious, onNext });
  navigationRef.current = { canGoPrevious, canGoNext, onPrevious, onNext };

  return useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) => {
          const { dx, dy } = gesture;
          return (
            Math.abs(dx) > SWIPE_ACTIVATION &&
            Math.abs(dx) > Math.abs(dy) * 1.25
          );
        },
        onPanResponderRelease: (_, gesture) => {
          const { canGoPrevious: prev, canGoNext: next, onPrevious, onNext } =
            navigationRef.current;

          if (gesture.dx > SWIPE_THRESHOLD && prev) {
            onPrevious();
          } else if (gesture.dx < -SWIPE_THRESHOLD && next) {
            onNext();
          }
        },
      }),
    []
  );
}
