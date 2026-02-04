importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Do not reference `window` in a service worker (it's undefined here).
// Accept the firebase config either from `self.__FIREBASE_CONFIG__` or via postMessage from the page.
let firebaseConfig = (typeof self !== 'undefined' && self.__FIREBASE_CONFIG__) ? self.__FIREBASE_CONFIG__ : {};

function initFirebaseIfNeeded(cfg) {
    if (!cfg || Object.keys(cfg).length === 0) {
        console.warn('[firebase-messaging-sw.js] Firebase config not found yet');
        return false;
    }
    try {
        firebase.initializeApp(cfg);
        self.__FIREBASE_CONFIG__ = cfg;
        return true;
    } catch (e) {
        console.warn('[firebase-messaging-sw.js] Firebase init failed', e);
        return false;
    }
}

let messaging;

function setupOnBackgroundMessage() {
    if (!messaging) return;
    messaging.onBackgroundMessage((payload) => {
        console.log('[firebase-messaging-sw.js] Received background message', payload);
        const title = payload?.notification?.title || 'FCM Notification';
        const body = payload?.notification?.body || '';
        const icon = payload?.notification?.icon || '/favicon.ico';
        self.registration.showNotification(title, { body, icon });
    });
}

if (initFirebaseIfNeeded(firebaseConfig)) {
    messaging = firebase.messaging();
    setupOnBackgroundMessage();
}

// Listen for config posted from the client page and initialize if needed
self.addEventListener('message', (event) => {
    const data = event.data;
    if (data && data.type === 'SET_FIREBASE_CONFIG' && data.config) {
        const cfg = data.config;
        if (!initFirebaseIfNeeded(cfg)) return;
        if (!messaging) {
            messaging = firebase.messaging();
            setupOnBackgroundMessage();
        }
    }
});
