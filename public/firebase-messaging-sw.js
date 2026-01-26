importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Read Firebase config from injected globals (populated by main app in layout.js)
const firebaseConfig = window.__FIREBASE_CONFIG__ || {};

if (Object.keys(firebaseConfig).length === 0) {
    console.warn('[firebase-messaging-sw.js] Firebase config not found in window.__FIREBASE_CONFIG__');
} else {
    firebase.initializeApp(firebaseConfig);
}

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message', payload);
    const title = payload?.notification?.title || 'FCM Notification';
    const body = payload?.notification?.body || '';
    const icon = payload?.notification?.icon || '/favicon.ico';
    self.registration.showNotification(title, { body, icon });
});
