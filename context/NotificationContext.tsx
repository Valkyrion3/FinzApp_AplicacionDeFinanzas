import { createContext, ReactNode, useContext } from 'react';
import { ToastContainer } from '../components/Toast';
import { NotificationType, useNotification } from '../hooks/useNotification';

/**
 * Notification context type
 */
interface NotificationContextType {
  show: (type: NotificationType, message: string, duration?: number) => string;
  success: (message: string, duration?: number) => string;
  error: (message: string, duration?: number) => string;
  warning: (message: string, duration?: number) => string;
  info: (message: string, duration?: number) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

/**
 * Create notification context
 */
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

/**
 * Notification provider component
 * Wrap your app with this to enable notifications globally
 */
export function NotificationProvider({ children }: { children: ReactNode }) {
  const {
    notifications,
    show,
    success,
    error,
    warning,
    info,
    dismiss,
    dismissAll
  } = useNotification();

  const value: NotificationContextType = {
    show,
    success,
    error,
    warning,
    info,
    dismiss,
    dismissAll
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <ToastContainer
        notifications={notifications}
        onDismiss={dismiss}
      />
    </NotificationContext.Provider>
  );
}

/**
 * Hook to use notification context
 * Must be used inside NotificationProvider
 */
export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used inside NotificationProvider');
  }
  return context;
}
