import { useAlertStore } from '../stores/alertStore';

// Initialize audio objects
const notificationSound = new Audio('/sounds/notification.mp3'); // We'll need to mock this or assume it exists/will fail silently
notificationSound.volume = 0.5;

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notification');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const playNotificationSound = () => {
  const { settings } = useAlertStore.getState();
  if (!settings.soundAlerts) return;

  try {
    // Some browsers block autoplay, so we catch the promise rejection
    notificationSound.play().catch(e => console.warn('Audio playback blocked:', e));
  } catch (error) {
    console.error('Failed to play notification sound', error);
  }
};

export const triggerNotification = (title: string, options?: NotificationOptions) => {
  const { settings } = useAlertStore.getState();
  
  if (settings.soundAlerts) {
    playNotificationSound();
  }

  if (settings.browserNotifications && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: '/favicon.svg',
        ...options,
      });
    } catch (error) {
      console.error('Failed to show notification', error);
    }
  }
};
