import { LocalNotifications } from '@capacitor/local-notifications';
import { apiUrl } from '../config/api';

const NOTIFIED_IDS_KEY = 'admin_notified_ids';

function getNotifiedIds(): number[] {
  try {
    const raw = localStorage.getItem(NOTIFIED_IDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveNotifiedId(id: number) {
  const current = getNotifiedIds();
  if (!current.includes(id)) {
    const updated = [...current.slice(-100), id]; // keep last 100
    localStorage.setItem(NOTIFIED_IDS_KEY, JSON.stringify(updated));
  }
}

function getNotificationEmojiTitle(type: string): string {
  switch (type?.toLowerCase()) {
    case 'message':
    case 'contact':
      return '📩 New Contact Message';
    case 'comment':
      return '💬 New Blog Comment';
    case 'subscriber':
    case 'subscribe':
      return '🔔 New Subscriber Registration';
    case 'like':
      return '❤️ New Like Activity';
    default:
      return '🔔 New Portfolio Alert';
  }
}

let isInitialized = false;
let pollInterval: any = null;

export async function initAdminPushNotifications(): Promise<void> {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    stopAdminPushNotifications();
    return;
  }

  // Request permissions if in Capacitor Android environment
  try {
    const status = await LocalNotifications.checkPermissions();
    if (status.display !== 'granted') {
      await LocalNotifications.requestPermissions();
    }

    // Create Notification Channel for Android 8.0+
    await LocalNotifications.createChannel({
      id: 'admin_alerts',
      name: 'Admin System Alerts',
      description: 'Push notifications for messages, comments, likes & subscribers',
      importance: 5,
      sound: 'beep.wav',
      visibility: 1,
      vibration: true,
    });

    // Add action listener when user taps the notification
    if (!isInitialized) {
      LocalNotifications.addListener('localNotificationActionPerformed', () => {
        if (window.location.hash !== '#/admin/dashboard' && window.location.hash !== '#/admin') {
          window.location.hash = '#/admin/dashboard';
        }
      });
    }
  } catch (e) {
    // Web environment fallback for browser notifications
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch (err) {}
    }
  }

  isInitialized = true;

  // Run initial check
  checkNewNotifications(token);

  // Poll every 25 seconds if admin is logged in
  if (!pollInterval) {
    pollInterval = setInterval(() => {
      const currentToken = localStorage.getItem('admin_token');
      if (currentToken) {
        checkNewNotifications(currentToken);
      } else {
        stopAdminPushNotifications();
      }
    }, 25000);
  }
}

export function stopAdminPushNotifications(): void {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}

async function checkNewNotifications(token: string): Promise<void> {
  try {
    const res = await fetch(apiUrl('/admin/notifications'), {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) return;

    const notifs: any[] = await res.json();
    if (!Array.isArray(notifs)) return;

    const notifiedIds = getNotifiedIds();
    const unread = notifs.filter(n => !n.is_read || n.is_read === 0 || n.is_read === '0');

    for (const notif of unread) {
      if (!notifiedIds.includes(notif.id)) {
        await triggerPushNotification(notif);
        saveNotifiedId(notif.id);
      }
    }
  } catch (err) {
    // Silent fail if network unreachable
  }
}

async function triggerPushNotification(notif: any): Promise<void> {
  const title = getNotificationEmojiTitle(notif.type);
  const body = notif.message || 'You have a new activity in your portfolio.';

  try {
    // Native Capacitor Android Local Notification
    await LocalNotifications.schedule({
      notifications: [
        {
          title: title,
          body: body,
          id: typeof notif.id === 'number' ? notif.id : Math.floor(Math.random() * 100000),
          channelId: 'admin_alerts',
          schedule: { at: new Date(Date.now() + 100) },
          extra: { notifId: notif.id }
        }
      ]
    });
  } catch (e) {
    // Web Browser Fallback
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: body,
        icon: '/favicon.ico'
      });
    }
  }
}
