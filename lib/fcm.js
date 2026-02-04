import { getApps, initializeApp } from 'firebase/app';
import { getMessaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export function isMobileAppWebview() {
    if (typeof window === 'undefined') return false;
    try {
        const params = new URLSearchParams(window.location.search);
        return params.get('versioninfo') === 'mobileapp';
    } catch (e) {
        return false;
    }
}

export function initFirebaseApp() {
    if (isMobileAppWebview()) {
        // Skip initializing Firebase when loaded in the mobile app webview
        console.log('[fcm] versioninfo=mobileapp detected - skipping Firebase initialization');
        return;
    }

    if (!getApps().length) {
        initializeApp(firebaseConfig);
    }
}

async function getMessagingInstance() {
    const supported = await isSupported();
    if (!supported) throw new Error('Firebase Messaging is not supported in this browser.');
    if (isMobileAppWebview()) {
        throw new Error('Running in mobile app webview (versioninfo=mobileapp); web FCM is disabled. Use native bridge to receive notifications.');
    }
    initFirebaseApp();
    return getMessaging();
}

async function getServiceWorkerRegistration() {
    if (!('serviceWorker' in navigator)) return undefined;
    const reg = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
    return reg || undefined;
}

export async function requestNotificationPermissionAndToken() {
    const messaging = await getMessagingInstance();
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
        throw new Error('Notification permission not granted.');
    }

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
        throw new Error('Missing NEXT_PUBLIC_FIREBASE_VAPID_KEY. Set it in .env.local');
    }

    const registration = await getServiceWorkerRegistration();
    const { getToken } = await import('firebase/messaging');
    const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
    return token;
}

// Subscribe to foreground messages while the page is in focus.
// Returns an unsubscribe function.
export async function onForegroundMessage(handler) {
    const messaging = await getMessagingInstance();
    const { onMessage } = await import('firebase/messaging');
    return onMessage(messaging, handler);
}
