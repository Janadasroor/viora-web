// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
// Note: Service workers cannot access process.env, so values must be hardcoded
firebase.initializeApp({
    apiKey: "AIzaSyBlhTi5_f01TZe2o946Ys_mInxd9kuNqBk",
    authDomain: "viora-887d7.firebaseapp.com",
    projectId: "viora-887d7",
    storageBucket: "viora-887d7.firebasestorage.app",
    messagingSenderId: "248070785873",
    appId: "1:248070785873:web:a2540afe4b2808f3ffa170",
    measurementId: "G-R6NQ2NX5SK"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification?.title || 'New Notification';
    const notificationOptions = {
        body: payload.notification?.body || '',
        icon: payload.notification?.icon || '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        data: payload.data,
        tag: payload.data?.type || 'notification',
        requireInteraction: false,
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification click received.', event);

    event.notification.close();

    // Navigate to the appropriate page based on notification data
    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Check if there's already a window open
            for (const client of clientList) {
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not, open a new window
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
