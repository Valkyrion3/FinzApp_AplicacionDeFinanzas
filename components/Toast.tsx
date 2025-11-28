import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '../constants/Colors';
import { Notification, NotificationType } from '../hooks/useNotification';

interface ToastProps {
  notification: Notification;
  onDismiss: () => void;
}

/**
 * Toast component for displaying notifications
 * Animated and dismissible
 */
export function Toast({ notification, onDismiss }: ToastProps) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    // Slide in animation
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
      tension: 40
    }).start();
  }, [slideAnim]);

  const handleDismiss = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 300,
      useNativeDriver: true
    }).start(() => onDismiss());
  };

  const getIcon = () => {
    const iconProps = { size: 20, color: Colors.white };
    
    switch (notification.type) {
      case 'success':
        return <Ionicons name="checkmark-circle" {...iconProps} />;
      case 'error':
        return <Ionicons name="close-circle" {...iconProps} />;
      case 'warning':
        return <Ionicons name="alert-circle" {...iconProps} />;
      case 'info':
      default:
        return <Ionicons name="information-circle" {...iconProps} />;
    }
  };

  const getBackgroundColor = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      case 'warning':
        return '#FF9800';
      case 'info':
      default:
        return '#2196F3';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          marginBottom: insets.bottom + 16
        }
      ]}
    >
      <View
        style={[
          styles.toast,
          { backgroundColor: getBackgroundColor(notification.type) }
        ]}
      >
        <View style={styles.iconContainer}>{getIcon()}</View>

        <View style={styles.content}>
          <Text style={styles.message} numberOfLines={2}>
            {notification.message}
          </Text>
        </View>

        {notification.action && (
          <TouchableOpacity
            onPress={() => {
              notification.action?.onPress();
              handleDismiss();
            }}
          >
            <Text style={styles.actionText}>{notification.action.label}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
          <Ionicons name="close" size={18} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

/**
 * Toast container component for displaying multiple toasts
 */
interface ToastContainerProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ notifications, onDismiss }: ToastContainerProps) {
  return (
    <View style={styles.toastContainer} pointerEvents="box-none">
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          notification={notification}
          onDismiss={() => onDismiss(notification.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  container: {
    width: '90%',
    alignSelf: 'center',
    marginHorizontal: '5%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
    gap: 12,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  message: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  actionText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  closeButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
