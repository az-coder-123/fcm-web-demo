# FCM Push Notifications

> Firebase Cloud Messaging integration for acquiring push notification tokens and handling foreground/background messages in both web-only and native WebView contexts.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Web-Only FCM Flow](#web-only-fcm-flow)
- [Native Bridge FCM Flow](#native-bridge-fcm-flow)
- [Service Worker](#service-worker)
- [API Reference](#api-reference)
- [UI Components](#ui-components)
- [Environment Setup](#environment-setup)
- [Troubleshooting](#troubleshooting)

---

## Overview

The fcm-web-demo supports **two modes** of FCM token acquisition:

| Mode | When | How |
|------|------|-----|
| **Web FCM** | Running in a regular browser | Uses Firebase JS SDK directly (`lib/fcm.js`) |
| **Native FCM** | Running inside Flutter WebView | Calls `getFCMToken` handler via native bridge |

The application auto-detects which mode to use based on the presence of `window.flutter_inappwebview`.

---

## Architecture

```
┌──────────────────────────────────────────────┐
│                   page.js                    │
│                                              │
│   isNativeApp ?                              │
│     ├── YES → callHandler('getFCMToken')     │
│     │         ↓                              │
│     │     Native Flutter FCM                 │
│     └── NO  → requestWebFCMToken()           │
│               ↓                              │
│           Firebase JS SDK                    │
│           (lib/fcm.js)                       │
└──────────────────────────────────────────────┘
```

---

## Web-Only FCM Flow

When running in a standard browser (not inside the native app):

1. **Initialize Firebase** — `lib/fcm.js` → `initializeFirebase()`
2. **Request notification permission** — Browser shows permission prompt
3. **Get FCM token** — `getToken()` from Firebase Messaging
4. **Listen for foreground messages** — `onMessage()` callback

```
User clicks "Get Web FCM Token"
    ↓
initializeFirebase()
    ↓
Notification.requestPermission()
    ↓
messaging.getToken({ vapidKey })
    ↓
Token returned → displayed in UI
    ↓
onMessage() listener active for foreground messages
```

---

## Native Bridge FCM Flow

When running inside the Flutter `InAppWebView`:

1. **Detect native app** — Check `window.flutter_inappwebview` exists
2. **Call native handler** — `callHandler('getFCMToken')`
3. **Native returns token** — The Flutter app provides the FCM token from the native Firebase SDK

```javascript
const response = await window.flutter_inappwebview.callHandler('getFCMToken');
// Response: { success: true, token: "abc123..." }
```

### Why Two Modes?

The native Flutter app manages its own Firebase configuration. When running inside the WebView, using the native SDK ensures:
- Consistent token format across platforms
- Proper token lifecycle management (refresh, deletion)
- No duplicate Firebase initialization

---

## Service Worker

**File:** `public/firebase-messaging-sw.js`

The service worker handles **background** push notifications when the web app tab is not in focus.

### Responsibilities

| Event | Behavior |
|-------|----------|
| `push` | Displays a system notification with the message payload |
| `notificationclick` | Opens/focuses the app tab and navigates to the relevant page |

### Registration

The service worker is registered automatically by the Firebase JS SDK when `initializeFirebase()` is called in `lib/fcm.js`.

---

## API Reference

### `lib/fcm.js`

#### `initializeFirebase()`

Initializes the Firebase app with configuration from environment variables.

```javascript
import { initializeFirebase } from '@/lib/fcm';
const messaging = initializeFirebase();
```

**Returns:** `FirebaseMessaging` instance or `null` on failure.

#### `requestWebFCMToken(messaging, vapidKey)`

Requests notification permission and retrieves an FCM token from the Firebase JS SDK.

```javascript
import { requestWebFCMToken } from '@/lib/fcm';
const token = await requestWebFCMToken(messaging, vapidKey);
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `messaging` | FirebaseMessaging | Initialized messaging instance |
| `vapidKey` | string | VAPID public key for web push |

**Returns:** FCM token string or `null` on failure.

#### `onForegroundMessage(messaging, callback)`

Registers a listener for foreground push messages.

```javascript
import { onForegroundMessage } from '@/lib/fcm';
onForegroundMessage(messaging, (payload) => {
    console.log('Foreground message:', payload);
});
```

---

## UI Components

### `FcmTokenSection.js`

Renders the token acquisition button and displays the current token.

| Prop | Type | Description |
|------|------|-------------|
| `isNativeApp` | boolean | Show native vs web token button |
| `token` | string | Current FCM token |
| `onEnable` | function | Web FCM token request callback |
| `onGetNativeToken` | function | Native bridge token request callback |
| `addToLog` | function | Event logger callback |

### `TokenSubmission.js`

Displays the token with copy-to-clipboard and backend submission options.

| Prop | Type | Description |
|------|------|-------------|
| `token` | string | FCM token to display |
| `onCopy` | function | Copy token callback |

---

## Environment Setup

### Required Environment Variables

```env
# .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BJxxx...
```

### Getting Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project → **Project Settings** → **General**
3. Add a web app to get the config object
4. Go to **Cloud Messaging** → **Web Push Certificates** to get the VAPID key

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| `messaging.getToken is not a function` | Firebase not initialized | Check `.env.local` values |
| Permission denied | Browser blocked notifications | Reset in browser settings |
| No token returned | Invalid VAPID key | Verify `NEXT_PUBLIC_FIREBASE_VAPID_KEY` |
| Service worker not registering | Incorrect SW path | Ensure `firebase-messaging-sw.js` is in `public/` |
| Native token returns `undefined` | Bridge not ready | Wait for `flutter_inappwebview` to be available |

---

*Last Updated: May 2026*