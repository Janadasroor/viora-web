// Firebase configuration for client-side
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported, Messaging } from 'firebase/messaging';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const isFirebaseConfigured = Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    process.env.NEXT_PUBLIC_USE_FIREBASE === 'true'
);

// Initialize Firebase
let app: FirebaseApp | null = null;
let storage: FirebaseStorage | null = null;

if (isFirebaseConfigured) {
    try {
        app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
        storage = getStorage(app);
    } catch (error) {
        console.error('⚠️ Firebase app initialization failed:', error);
    }
} else {
    if (process.env.NEXT_PUBLIC_USE_FIREBASE === 'true') {
        console.warn('⚠️ Firebase is enabled but configuration is missing (projectId/apiKey)');
    }
}

// Initialize Firebase Cloud Messaging
let messaging: Messaging | null = null;
let messagingPromise: Promise<Messaging | null> | null = null;

// Function to get messaging instance
async function getMessagingInstance(): Promise<Messaging | null> {
    if (typeof window === 'undefined' || !app) {
        return null;
    }

    if (messaging) {
        return messaging;
    }

    if (messagingPromise) {
        return messagingPromise;
    }

    messagingPromise = (async () => {
        try {
            const supported = await isSupported();

            if (supported && app) {
                messaging = getMessaging(app);
                return messaging;
            } else {
                console.warn('⚠️ Firebase messaging not supported or Firebase not initialized');
                return null;
            }
        } catch (error) {
            console.error('⚠️ Error initializing messaging:', error);
            return null;
        }
    })();

    return messagingPromise;
}

// Initialize messaging on load if configured
if (typeof window !== 'undefined' && isFirebaseConfigured) {
    getMessagingInstance();
}

export { app, messaging, getMessagingInstance, getToken, onMessage, storage };
