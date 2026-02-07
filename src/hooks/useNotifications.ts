import { useEffect, useState, useCallback } from 'react';
import { getMessagingInstance, getToken, onMessage } from '@/lib/firebase-config';
import { apiUrl } from '@/api/config';

interface UseNotificationsReturn {
    token: string | null;
    notificationPermission: NotificationPermission;
    requestPermission: () => Promise<boolean>;
    loading: boolean;
    error: string | null;
}

export function useNotifications(): UseNotificationsReturn {
    const [token, setToken] = useState<string | null>(null);
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Check current permission status
    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setNotificationPermission(Notification.permission);
        }
    }, []);

    // Request notification permission and get FCM token
    const requestPermission = useCallback(async (): Promise<boolean> => {

        if (typeof window === 'undefined' || !('Notification' in window)) {
            console.error(' Notifications not supported in this browser');
            setError('Notifications not supported in this browser');
            return false;
        }


        // Get messaging instance
        const messagingInstance = await getMessagingInstance();

        if (!messagingInstance) {
            console.error(' Firebase messaging not available');
            setError('Firebase messaging not initialized');
            return false;
        }


        setLoading(true);
        setError(null);

        try {
            // Request permission
            const permission = await Notification.requestPermission();
            setNotificationPermission(permission);

            if (permission === 'granted') {
                // Get FCM token
                const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

                if (!vapidKey) {
                    console.error(' VAPID key not configured in environment variables');
                    throw new Error('VAPID key not configured');
                }

                const currentToken = await getToken(messagingInstance, { vapidKey });

                if (currentToken) {
                    setToken(currentToken);

                    // Send token to backend
                    await registerTokenWithBackend(currentToken);

                    // Store token in localStorage
                    localStorage.setItem('fcm_token', currentToken);

                    return true;
                } else {
                    console.error(' No registration token available');
                    setError('No registration token available');
                    return false;
                }
            } else {
                console.warn('⚠️ Notification permission denied');
                setError('Notification permission denied');
                return false;
            }
        } catch (err) {
            console.error(' Error getting notification permission:', err);
            setError(err instanceof Error ? err.message : 'Failed to get permission');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    // Register token with backend
    const registerTokenWithBackend = async (fcmToken: string) => {
        try {
            // Get current user ID from auth context or localStorage
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                console.warn('No user found, skipping token registration');
                return;
            }

            const user = JSON.parse(userStr);
            const userId = user.userId || user.user_id;

            const apiUrlBase = apiUrl.replace(/\/1\.0\.0$/, '');
            const response = await fetch(`${apiUrlBase}/notifications/fcm-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId,
                    token: fcmToken
                }),
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to register token with backend');
            }

        } catch (err) {
            console.error('Error registering token:', err);
        }
    };

    // Listen for foreground messages
    useEffect(() => {
        let unsubscribe: (() => void) | undefined;

        getMessagingInstance().then((messagingInstance) => {
            if (!messagingInstance) return;

            unsubscribe = onMessage(messagingInstance, (payload) => {

                // Show notification even when app is in foreground
                if (payload.notification) {
                    new Notification(payload.notification.title || 'New Notification', {
                        body: payload.notification.body,
                        icon: payload.notification.icon || '/icons/icon-192x192.png',
                        badge: '/icons/badge-72x72.png',
                        data: payload.data,
                    });
                }
            });
        });

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, []);

    // Auto-request permission if previously granted
    useEffect(() => {
        if (notificationPermission === 'granted' && !token && !loading) {
            requestPermission();
        }
    }, [notificationPermission, token, loading, requestPermission]);

    return {
        token,
        notificationPermission,
        requestPermission,
        loading,
        error,
    };
}
