import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timestamp: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const slideAnim = useRef(new Animated.Value(-100)).current;

  const addNotification = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date(),
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove notification after 3 seconds
    setTimeout(() => {
      removeNotification(newNotification.id);
    }, 3000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Animate notifications
  useEffect(() => {
    if (notifications.length > 0) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(slideAnim, {
        toValue: -100,
        useNativeDriver: true,
      }).start();
    }
  }, [notifications.length, slideAnim]);

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'success':
        return styles.successNotification;
      case 'error':
        return styles.errorNotification;
      case 'warning':
        return styles.warningNotification;
      case 'info':
      default:
        return styles.infoNotification;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
      
      {/* Notification Container */}
      <Animated.View
        style={[
          styles.notificationContainer,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {notifications.map((notification) => (
          <View
            key={notification.id}
            style={[styles.notification, getNotificationStyle(notification.type)]}
          >
            <Text style={styles.notificationIcon}>
              {getNotificationIcon(notification.type)}
            </Text>
            <Text style={styles.notificationText}>{notification.message}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => removeNotification(notification.id)}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </Animated.View>
    </NotificationContext.Provider>
  );
};

const styles = StyleSheet.create({
  notificationContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  notification: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  successNotification: {
    backgroundColor: '#16a34a',
  },
  errorNotification: {
    backgroundColor: '#dc3545',
  },
  warningNotification: {
    backgroundColor: '#ffc107',
  },
  infoNotification: {
    backgroundColor: '#0dcaf0',
  },
  notificationIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  notificationText: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  closeButton: {
    marginLeft: 10,
    padding: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 