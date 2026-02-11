import { useState, useEffect, useCallback } from 'react';

export function usePushNotifications(userId?: string) {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
      
      // Check existing subscription
      navigator.serviceWorker.ready.then((reg: ServiceWorkerRegistration) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pm = (reg as any).pushManager;
        if (pm) {
          pm.getSubscription().then((sub: PushSubscription | null) => {
            setIsSubscribed(!!sub);
          });
        }
      });
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch {
      return false;
    }
  }, [isSupported]);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported || !userId) return false;
    setIsLoading(true);
    try {
      const granted = await requestPermission();
      if (!granted) { setIsLoading(false); return false; }

      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      const vapidKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const subscription = await (registration as any).pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
      });

      const subscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: arrayBufferToBase64(subscription.getKey('auth')!),
        },
      };

      localStorage.setItem(`push_subscription_${userId}`, JSON.stringify(subscriptionData));
      setIsSubscribed(true);
      setIsLoading(false);
      return true;
    } catch {
      setIsLoading(false);
      return false;
    }
  }, [isSupported, userId, requestPermission]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported || !userId) return false;
    setIsLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const subscription = await (reg as any).pushManager.getSubscription();
      if (subscription) await subscription.unsubscribe();
      localStorage.removeItem(`push_subscription_${userId}`);
      setIsSubscribed(false);
      setIsLoading(false);
      return true;
    } catch {
      setIsLoading(false);
      return false;
    }
  }, [isSupported, userId]);

  const showLocalNotification = useCallback(async (title: string, options?: NotificationOptions) => {
    if (!isSupported || permission !== 'granted') return;
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, { icon: '/favicon.ico', badge: '/favicon.ico', ...options });
    } catch { /* ignore */ }
  }, [isSupported, permission]);

  return { isSupported, isSubscribed, isLoading, permission, subscribe, unsubscribe, requestPermission, showLocalNotification };
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
