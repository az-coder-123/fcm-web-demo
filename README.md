# Webview FCM & Native Bridge Demo (Next.js)

A Next.js app that demonstrates Firebase Cloud Messaging (FCM) push notifications and native bridge integration with Flutter mobile apps.

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

### Web FCM Features
- **Client Messaging** ([lib/fcm.js](lib/fcm.js)): Manages Firebase initialization, token retrieval, and foreground listeners
- **Service Worker** ([public/firebase-messaging-sw.js](public/firebase-messaging-sw.js)): Handles background notifications when the app is not in focus
- **Layout Injection** ([app/layout.js](app/layout.js)): Injects Firebase config into `window.__FIREBASE_CONFIG__` for service worker access

### Mobile Webview Mode (query param: `?versioninfo=mobileapp`)
- When the page is opened with `?versioninfo=mobileapp`, the app treats the session as a mobile app webview:
  - **Firebase initialization is skipped** (no `initializeApp` will run).
  - **Service Worker registration is skipped** (no `/firebase-messaging-sw.js` registration).
  - The UI forces native mode (`isNativeApp = true`) so the app uses the native bridge for tokens and notifications.
  - Calling web FCM functions (e.g., `requestNotificationPermissionAndToken()` or `onForegroundMessage()`) will fail — `getMessagingInstance()` will throw an error explaining web FCM is disabled in this mode.
- How to forward notifications from native to web:
  - Native should dispatch the `pushNotificationReceived` event (or call the JS bridge) to forward notification payloads, for example:

```javascript
window.dispatchEvent(new CustomEvent('pushNotificationReceived', {
  detail: {
    messageId: 'id',
    title: 'Title',
    body: 'Body',
    data: { deep_link: '/path' },
    sentTime: new Date().toISOString(),
    receivedTime: new Date().toISOString()
  }
}));
```

- For Flutter WebView, append the query param when loading the URL (dev example: `http://localhost:3000/?versioninfo=mobileapp`).
- This prevents duplicate delivery between web and native and ensures the native app is the single source of push notifications.

### Native Bridge Features
When running inside a Flutter WebView, this app also integrates with the native bridge:

- **Auto-detection**: Automatically detects if running in native app via `window.flutter_inappwebview`
- **App Info**: Gets native app name, version, and platform
- **FCM Token Management**:
  - Get native FCM token from device
  - Receive token updates when token refreshes
  - Delete FCM token on logout
- **Language Switching**: Change app language (English/Vietnamese) from native
- **Network Status**: Monitor online/offline status changes
- **Push Notifications**: Receive notifications forwarded from native app
- **Deep Link Handling**: Navigate to deep links from notifications
- **Logging**: Send debug logs to native console
- **Logout**: Trigger native logout and FCM token deletion

### UI Components
- **Status Indicator**: Shows whether running in browser or native app
- **Toast Notifications**: Displays FCM messages (web and native) with different styles
- **Event Log**: Real-time log of all events and actions
- **Control Panel**: Buttons to test all native bridge features

## Security

- Firebase config is read from environment variables (`.env.local`)
- Only public/browser-safe credentials are used (no server keys)
- Service worker can access config via injected global object
- VAPID key is required for web push but never exposed beyond the client
- Native bridge calls are validated (origin check on sensitive handlers)
- Deep links are validated before navigation (requires user confirmation)

## Available Native Bridge Handlers

| Handler | Purpose | Parameters | Returns |
|----------|---------|-------------|----------|
| `getAppInfo` | Get native app info | None | `{success, appName, version, platform, bridgeChannel}` |
| `getFCMToken` | Get native FCM token | None | `{success, token, error}` |
| `changeLocale` | Change app language | `languageCode` (en/vi) | `{success, locale, error}` |
| `getLocale` | Get current language | None | `{success, languageCode, countryCode}` |
| `logout` | Delete FCM token | None | `{success, error}` |
| `log` | Send log to native | `message`, `level` | `{success}` |

## Available Native Bridge Events

| Event | Triggered When | Data |
|--------|--------------|-------|
| `fcmTokenUpdated` | FCM token refreshes | `{success, token, ts, source}` |
| `localeChanged` | Language changes | `{languageCode}` |
| `networkStatusChanged` | Network status changes | `{isOnline}` |
| `pushNotificationReceived` | Notification received | `{messageId, title, body, data, sentTime, receivedTime}` |

## Related Documentation

- **Flutter App**: `<MOBILE_APP>/` - Native mobile app with WebView
- **Bridge Guide**: `<MOBILE_APP>/docs/WEBVIEW_BRIDGE.md` - Detailed bridge API documentation
- **Notification Guide**: `<MOBILE_APP>/docs/PUSH_NOTIFICATIONS_GUIDE.md` - FCM implementation guide
- **Integration Guide**: `<MOBILE_APP>/docs/WEBVIEW_PUSH_NOTIFICATION_INTEGRATION.md` - Web app integration guide
- **Logout Best Practices**: `<MOBILE_APP>/docs/FCM_LOGOUT_BEST_PRACTICES.md` - Comprehensive logout mechanism guide

## Testing

### Web Browser Testing

Send a test message to your FCM token using:
- Firebase Console → Cloud Messaging → Send your first message
- Or use a backend script with the Firebase Admin SDK

Foreground messages appear as toasts; background messages show system notifications.

### Native App Testing

To test with a Flutter mobile app:

1. **Configure Flutter App**:
   - Open `<MOBILE_APP>/lib/core/config/app_config.dart`
   - Set `webAppUrl` to `http://localhost:3000` (for development)
   - Or set to your deployed URL (for production)

2. **Run Flutter App**:
   ```bash
   cd <MOBILE_APP>
   flutter run
   ```

3. **Run Web Demo**:
   ```bash
   cd fcm-web-demo
   npm run dev
   ```

4. **Test Native Bridge Features**:
   - **Get FCM Token**: Click "Get Native FCM Token" to retrieve device token
   - **Change Language**: Use language buttons to test locale changes
   - **Simulate Notification**: Click to test notification display
   - **Logout**: 
     - For **Web**: Click "Web Logout" in Test Actions to clear web FCM token
     - For **Native**: Click "Logout (Delete FCM Token)" in Native Bridge Actions
   - **Send Logs**: Test log forwarding to native console

5. **Test Push Notifications**:
   - Get native FCM token from the demo page
   - Use Firebase Console to send test notification
   - Include custom data in payload:
     ```json
     {
       "notification": {
         "title": "Test Notification",
         "body": "This is a test"
       },
       "data": {
         "type": "test",
         "deep_link": "/test-page"
       }
     }
     ```
   - Notification will be forwarded to web app and displayed

6. **Monitor Events**:
   - Watch the "Event Log" section at the bottom
   - See real-time logs of all bridge interactions
   - Toast notifications appear for each event

### Integration Testing Checklist

- [ ] Web app detects running in native app (blue status bar)
- [ ] App info displays correctly (name, version, platform)
- [ ] Native FCM token retrieved successfully
- [ ] Language changes trigger locale updates
- [ ] Network status changes detected (disconnect/reconnect WiFi)
- [ ] Push notifications forwarded from native to web
- [ ] Toast notifications display with correct source (web_fcm/native)
- [ ] Deep link navigation works from notification data
- [ ] Logout works correctly:
  - Web: "Web Logout" clears web FCM token
  - Native: "Logout (Delete FCM Token)" deletes native FCM token
- [ ] Event log records all interactions

### Firebase Console Testing

1. Open Firebase Console → Cloud Messaging
2. Click "Send your first message"
3. **Target**: 
   - For web testing: Use web FCM token
   - For native testing: Use native FCM token
4. **Notification**: Enter title and body
5. **Advanced options → Custom data**:
   ```json
   {
     "type": "new_message",
     "deep_link": "/messages/123",
     "message_id": "msg_456"
   }
   ```
6. Send and observe in the demo app

### Debugging

**Check if bridge is available**:
```javascript
console.log('Bridge available:', typeof window.flutter_inappwebview !== 'undefined');
```

**Monitor native console**:
- Use Flutter DevTools or Xcode/Android Studio logs
- Look for "[JSBridge]" and "Notification" logs
- Check for "Sent event to web: pushNotificationReceived"

**Event Log in Demo**:
- All interactions are logged with timestamps
- Use "Clear Log" button to reset
- Last 20 events are kept
