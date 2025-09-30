import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';

interface UseInactivityTimerProps {
  timeout: number; // in milliseconds
  onTimeout: () => void;
  enabled?: boolean;
}

export const useInactivityTimer = ({ 
  timeout, 
  onTimeout, 
  enabled = true 
}: UseInactivityTimerProps) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimer = useCallback(() => {
    if (!enabled) return;
    
    lastActivityRef.current = Date.now();
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;
      if (timeSinceLastActivity >= timeout) {
        onTimeout();
      }
    }, timeout);
  }, [timeout, onTimeout, enabled]);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      clearTimer();
      return;
    }

    // Reset timer on app state change to active
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        resetTimer();
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        clearTimer();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Initial timer setup
    resetTimer();

    return () => {
      subscription?.remove();
      clearTimer();
    };
  }, [enabled, resetTimer, clearTimer]);

  return {
    resetTimer,
    clearTimer,
  };
};
