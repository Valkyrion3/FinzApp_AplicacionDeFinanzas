import { useCallback, useState } from 'react';

/**
 * Types for notification system
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

/**
 * Custom hook for managing notifications
 * Provides better UX than Alert popups
 */
export const useNotification = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  /**
   * Generate unique ID for each notification
   */
  const generateId = useCallback(() => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  /**
   * Show notification
   */
  const show = useCallback((
    type: NotificationType,
    message: string,
    duration: number = 3000,
    action?: { label: string; onPress: () => void }
  ) => {
    const id = generateId();
    const notification: Notification = {
      id,
      type,
      message,
      duration,
      action
    };

    setNotifications(prev => [...prev, notification]);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        dismiss(id);
      }, duration);
    }

    return id;
  }, [generateId]);

  /**
   * Convenience methods for each type
   */
  const success = useCallback(
    (message: string, duration?: number) => show('success', message, duration),
    [show]
  );

  const error = useCallback(
    (message: string, duration?: number) => show('error', message, duration),
    [show]
  );

  const warning = useCallback(
    (message: string, duration?: number) => show('warning', message, duration),
    [show]
  );

  const info = useCallback(
    (message: string, duration?: number) => show('info', message, duration),
    [show]
  );

  /**
   * Dismiss specific notification
   */
  const dismiss = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  /**
   * Dismiss all notifications
   */
  const dismissAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    show,
    success,
    error,
    warning,
    info,
    dismiss,
    dismissAll
  };
};
