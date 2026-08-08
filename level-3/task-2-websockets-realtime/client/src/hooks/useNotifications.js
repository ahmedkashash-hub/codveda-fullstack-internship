import { useEffect, useMemo, useReducer } from 'react';
import socketClient from '../services/socketClient.js';

export const MAX_NOTIFICATIONS = 50;

export const notificationReducer = (notifications, action) => {
  switch (action.type) {
    case 'receive':
      return [action.notification, ...notifications].slice(0, MAX_NOTIFICATIONS);
    case 'mark-read':
      return notifications.map((notification) =>
        notification.id === action.id ? { ...notification, read: true } : notification,
      );
    case 'mark-all-read':
      return notifications.map((notification) => ({ ...notification, read: true }));
    case 'clear':
      return [];
    default:
      return notifications;
  }
};

const useNotifications = () => {
  const [notifications, dispatch] = useReducer(notificationReducer, []);

  useEffect(() => {
    const handleNotification = (notification) => {
      dispatch({ type: 'receive', notification });
    };
    socketClient.on('server:notification', handleNotification);
    return () => socketClient.off('server:notification', handleNotification);
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );

  const sendNotification = (payload) => new Promise((resolve) => {
    if (!socketClient.connected) {
      resolve({ ok: false, error: 'Connect before sending a notification' });
      return;
    }
    socketClient.timeout(3000).emit(
      'client:send-notification',
      payload,
      (timeoutError, response) => {
        if (timeoutError) {
          resolve({ ok: false, error: 'The server did not acknowledge the notification' });
          return;
        }
        resolve(response);
      },
    );
  });

  return {
    notifications,
    unreadCount,
    markRead: (id) => dispatch({ type: 'mark-read', id }),
    markAllRead: () => dispatch({ type: 'mark-all-read' }),
    clearNotifications: () => dispatch({ type: 'clear' }),
    sendNotification,
  };
};

export default useNotifications;
