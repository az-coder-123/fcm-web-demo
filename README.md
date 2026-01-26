# Webview FCM (Next.js)

A minimal Next.js app to receive Firebase Cloud Messaging (FCM) push notifications inside a webview.

## Setup

### 1. Prerequisites
- Node.js 18+

### 2. Configure Environment Variables

All Firebase credentials are stored in `.env.local`. Copy your values from **Firebase Console → Project Settings**:

```
# Firebase Web App Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_DATABASE_URL=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Web Push Certificate (VAPID Key)
# From Firebase Console → Project Settings → Cloud Messaging → Web configuration
NEXT_PUBLIC_FIREBASE_VAPID_KEY=
```

> **Note:** All variables are prefixed with `NEXT_PUBLIC_` so they're available in the browser. Do not store secrets here.

### 3. Install Dependencies

```bash
npm install
```

## Run

Start the dev server:

```bash
npm run dev
```

Open http://localhost:3000 and click "Enable Notifications" to:
1. Request notification permission
2. Fetch your FCM registration token
3. See foreground messages as toasts

## How It Works

- **Client Messaging** ([lib/fcm.js](lib/fcm.js)): Manages Firebase initialization, token retrieval, and foreground listeners
- **Service Worker** ([public/firebase-messaging-sw.js](public/firebase-messaging-sw.js)): Handles background notifications when the app is not in focus
- **Layout Injection** ([app/layout.js](app/layout.js)): Injects Firebase config into `window.__FIREBASE_CONFIG__` for service worker access
- **UI Toast** ([app/page.js](app/page.js)): Displays foreground FCM messages as a dismissible toast

## Security

- Firebase config is read from environment variables (`.env.local`)
- Only public/browser-safe credentials are used (no server keys)
- Service worker can access config via injected global object
- VAPID key is required for web push but never exposed beyond the client

## Testing

Send a test message to your FCM token using:
- Firebase Console → Cloud Messaging → Send your first message
- Or use a backend script with the Firebase Admin SDK

Foreground messages appear as toasts; background messages show system notifications.
