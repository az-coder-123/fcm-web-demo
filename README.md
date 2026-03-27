# Webview FCM & Native Bridge Demo

<div align="center">

A professional Next.js application demonstrating Firebase Cloud Messaging (FCM) push notifications and seamless native bridge integration with Flutter mobile applications.

[![Next.js](https://img.shields.io/badge/Next.js-18-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Cloud%20Messaging-orange?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Quick Start](#-quick-start)
- [Architecture](#-architecture)
- [Setup](#-setup)
- [Usage](#-usage)
- [Native Bridge](#-native-bridge)
- [API Reference](#-api-reference)
- [Testing](#-testing)
- [Security](#-security)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Overview

This application serves as a comprehensive demonstration of modern web push notifications and native bridge communication patterns. It showcases:

- **Web FCM Integration**: Complete Firebase Cloud Messaging implementation for web browsers
- **Native Bridge**: Seamless bidirectional communication between WebView and native Flutter app
- **Push Notification Forwarding**: Smart notification routing to prevent duplicate delivery
- **Real-time Event Logging**: Comprehensive event tracking and debugging capabilities

---

## ✨ Features

### Web FCM Features
- ✅ **Push Notifications** - Receive notifications in foreground and background
- ✅ **Token Management** - Automatic token retrieval and refresh handling
- ✅ **Permission Handling** - User-friendly notification permission requests
- ✅ **Service Worker** - Background notification support
- ✅ **Toast System** - Professional, animated notification display
- ✅ **Responsive Design** - Optimized for desktop, tablet, and mobile

### Native Bridge Features
- 🔗 **Auto-detection** - Automatically detects native app environment
- 📱 **App Info** - Retrieve native app name, version, and platform
- 🔔 **FCM Token Sync** - Get and sync native FCM tokens
- 🌐 **Language Switching** - Dynamic locale changes (English/Vietnamese)
- 📶 **Network Monitoring** - Real-time online/offline status tracking
- 📨 **Push Forwarding** - Native notifications forwarded to web UI
- 🔗 **Deep Linking** - Navigation from notification data
- 📋 **Logging** - Forward debug logs to native console
- 🔐 **Logout** - Secure FCM token deletion

### UI Components
- 🎨 **Modern Design** - Professional gradient-based notifications
- 📊 **Status Dashboard** - Real-time app status indicators
- 📜 **Event Log** - Chronological event tracking
- 🎯 **Action Panels** - Intuitive control interfaces

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Firebase project with Cloud Messaging enabled
- (Optional) Flutter app for native bridge testing

### Installation

```bash
# Clone and navigate
cd fcm-web-demo

# Install dependencies
npm install

# Configure environment (see Setup section below)
cp .env.local.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to get started!

---

## 🏗️ Architecture

### System Overview

```
┌────────────────────────────────────────────────────────────┐
│                     Web Browser / WebView                  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────┐         ┌──────────────────────────────┐ │
│  │   Web FCM    │         │      Native Bridge           │ │
│  │              │         │                              │ │
│  │  • Token Mgmt│         │  • Auto-detection            │ │
│  │  • Messages  │         │  • App Info                  │ │
│  │  • SW Handle │         │  • Token Sync                │ │
│  └──────┬───────┘         │  • Locale Change             │ │
│         │                 │  • Network Status            │ │
│         │                 │  • Push Forwarding           │ │
│         │                 └──────────┬───────────────────┘ │
│         ▼                            │                     │
│  ┌──────────────┐                    │                     │
│  │   Toast UI   │                    │                     │
│  │   Event Log  │◄───────────────────┘                     │
│  │  Status Bar  │                                          │
│  └──────────────┘                                          │
│                                                            │
└────────────────────────────────────────────────────────────┘
         ▲                              ▲
         │                              │
      Firebase                     Flutter App
    Cloud Messaging                 (Native)
```

### Web FCM Flow

```
User Action ──► Request Permission
                │
                ▼
         Get FCM Token ──► Store Token
                │
                ▼
      Firebase Cloud Messaging ──► Push Notification
                                          │
                    ┌─────────────────────┴─────────────────────┐
                    │                                           │
               Foreground                                  Background
                    │                                           │
                    ▼                                           ▼
              Toast Display                            System Notification
              (App in focus)                           (App in background)
```

### Native Bridge Flow

```
Flutter App ──► WebView loads URL
                    │
                    ▼
         Detect Native Bridge
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
   Get Token      Change     Forward
                  Locale       Push
        │           │           │
        └───────────┴───────────┘
                    │
                    ▼
         Dispatch Custom Events ──► React Components
                                            │
                                            ▼
                                      Update UI State
```

---

## ⚙️ Setup

### 1. Firebase Configuration

Create a `.env.local` file in the project root:

```bash
# Firebase Web App Configuration
# Get from: Firebase Console → Project Settings → General → Your Apps → Web App
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Web Push Certificate (VAPID Key)
# Get from: Firebase Console → Project Settings → Cloud Messaging → Web configuration
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key
```

> **⚠️ Security Note**: All variables are prefixed with `NEXT_PUBLIC_` so they're available in the browser. Only use public/browser-safe credentials. Never expose private keys or server secrets.

### 2. Firebase Project Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"
   - Follow the setup wizard

2. **Enable Cloud Messaging**
   - Navigate to Project Settings → Cloud Messaging
   - Click "Cloud Messaging API (V1)"
   - Follow the setup instructions

3. **Add Web App**
   - Go to Project Settings → General
   - Click "Add app" → Web
   - Copy the configuration values to `.env.local`

4. **Generate VAPID Key**
   - Navigate to Project Settings → Cloud Messaging
   - Scroll to "Web configuration"
   - Click "Generate key pair"
   - Copy the VAPID key to `.env.local`

### 3. Service Worker Setup

The service worker is automatically registered at startup. Ensure:

- `public/firebase-messaging-sw.js` exists and is properly configured
- Firebase config is injected via `window.__FIREBASE_CONFIG__`
- Service worker runs at root path `/firebase-messaging-sw.js`

---

## 📖 Usage

### Web Browser Testing

#### Step 1: Enable Notifications
1. Click "Enable Notifications" button
2. Allow browser notification permission
3. Copy your FCM token displayed

#### Step 2: Send Test Notification
1. Go to [Firebase Console → Cloud Messaging](https://console.firebase.google.com/project/_/notification)
2. Click "Send your first message"
3. Target: Paste your FCM token
4. Notification: Enter title and body
5. Send and observe toast notification

#### Step 3: Test Background Notifications
1. Minimize or switch away from the tab
2. Send another notification
3. See system notification appear
4. Click notification to return to app

### Mobile Webview Mode

The app automatically detects mobile webview via query parameter `?versioninfo=mobileapp`.

#### Behavior Differences

| Feature | Web Browser | Mobile Webview |
|---------|-------------|----------------|
| Firebase Init | ✅ Yes | ❌ Skipped |
| Service Worker | ✅ Registered | ❌ Skipped |
| Token Source | Web FCM | Native Bridge |
| Push Delivery | Web + System | Native → Web Forwarding |

#### Loading in Flutter App

```dart
// In your Flutter WebView widget
WebView(
  initialUrl: 'http://localhost:3000/?versioninfo=mobileapp',
  // or production URL
  // initialUrl: 'https://your-domain.com/?versioninfo=mobileapp',
)
```

This prevents duplicate notifications and ensures native app is the single source of push notifications.

---

## 🌉 Native Bridge

### Auto-Detection

The app automatically detects if running in a Flutter WebView:

```javascript
if (window.flutter_inappwebview) {
  // Native bridge available
  const info = await window.flutter_inappwebview.callHandler('getAppInfo');
}
```

### Communication Flow

#### App → Native (Calling Handlers)

```javascript
const response = await window.flutter_inappwebview.callHandler('handlerName', param1, param2);
// Response: { success: true, data: {...} }
```

#### Native → App (Event Listeners)

```javascript
window.addEventListener('eventName', (event) => {
  console.log('Event data:', event.detail);
});
```

### Notification Forwarding

Native app forwards notifications to web:

```javascript
window.dispatchEvent(new CustomEvent('pushNotificationReceived', {
  detail: {
    messageId: 'msg_123',
    title: 'New Message',
    body: 'You have a new message',
    data: {
      type: 'new_message',
      deep_link: '/messages/123'
    },
    sentTime: new Date().toISOString(),
    receivedTime: new Date().toISOString()
  }
}));
```

---

## 📚 API Reference

### Native Bridge Handlers

| Handler | Description | Parameters | Returns |
|---------|-------------|------------|---------|
| `getAppInfo` | Get native app info | None | `{success, appName, version, platform, bridgeChannel}` |
| `getFCMToken` | Get native FCM token | None | `{success, token, error}` |
| `changeLocale` | Change app language | `languageCode` (en/vi) | `{success, locale, error}` |
| `getLocale` | Get current language | None | `{success, languageCode, countryCode}` |
| `logout` | Delete FCM token | None | `{success, error}` |
| `log` | Send log to native | `message`, `level` | `{success}` |
| `getLocationPermissionStatus` | Get location permission state from native | None | `{success, permission, isGranted, error}` |
| `requestLocationPermission` | Request location permission by native dialog | None | `{success, permission, isGranted, error}` |
| `getLocation` | Get current position from native (if granted) | None | `{success, latitude, longitude, accuracy, altitude?, heading?, speed?, timestamp?, error}` |

### Native Bridge Events

| Event | Triggered When | Data Structure |
|--------|--------------|-----------------|
| `fcmTokenUpdated` | FCM token refreshes | `{success, token, ts, source}` |
| `localeChanged` | Language changes | `{languageCode}` |
| `networkStatusChanged` | Network status changes | `{isOnline}` |
| `pushNotificationReceived` | Notification received | `{messageId, title, body, data, sentTime, receivedTime}` |

### Web FCM Functions

| Function | Description | Returns |
|----------|-------------|---------|
| `initFirebaseApp()` | Initialize Firebase app | `void` |
| `requestNotificationPermissionAndToken()` | Request permission & get token | `Promise<string>` - FCM token |
| `onForegroundMessage(callback)` | Listen to foreground messages | `Promise<Function>` - Unsubscribe function |

---

## 🧪 Testing

### Web Testing Checklist

- [ ] Firebase configured in `.env.local`
- [ ] Development server running at `http://localhost:3000`
- [ ] Browser notification permission granted
- [ ] FCM token displayed successfully
- [ ] Foreground notification appears as toast
- [ ] Background notification appears as system notification
- [ ] Toast dismisses automatically after 5 seconds
- [ ] Event log records all events
- [ ] Responsive design works on different screen sizes

### Native App Testing Checklist

- [ ] WebView loads with `?versioninfo=mobileapp`
- [ ] App detects native bridge (blue status bar)
- [ ] App info displays correctly
- [ ] Native FCM token retrieved
- [ ] Language changes update UI
- [ ] Network status changes detected
- [ ] Push notifications forwarded to web
- [ ] Toast notifications display with "native_push" source
- [ ] Deep link navigation works
- [ ] Logout deletes FCM token
- [ ] Event log records all bridge interactions

### Integration Test Flow

1. **Start Web Demo**
   ```bash
   npm run dev
   ```

2. **Run Flutter App**
   ```bash
   cd ../soccasio.mobileapps
   flutter run
   ```

3. **Test Sequence**
   - Verify native bridge detection
   - Get native FCM token
   - Change language (en/vi)
   - Test network status (disconnect/reconnect WiFi)
   - Send test notification from Firebase Console
   - Verify notification forwarding
   - Test deep link navigation
   - Test logout functionality
   - Review event log

4. **Firebase Console Test**
   ```json
   {
     "notification": {
       "title": "Integration Test",
       "body": "Testing notification forwarding"
     },
     "data": {
       "type": "test",
       "deep_link": "/test-page",
       "message_id": "test_123"
     }
   }
   ```

### Debugging Tools

#### Check Bridge Availability
```javascript
console.log('Bridge available:', typeof window.flutter_inappwebview !== 'undefined');
```

#### Monitor Events
```javascript
// All events are logged in the Event Log section
// Clear log button resets the log
// Last 20 events are retained
```

#### Native Console Logs
- **Flutter**: Use Flutter DevTools
- **iOS**: Check Xcode console logs
- **Android**: Check Android Studio Logcat
- Look for: `[JSBridge]`, `Notification`, `Event`

---

## 🔒 Security

### Firebase Security
- ✅ Config stored in environment variables (`.env.local`)
- ✅ Only public credentials exposed (no server keys)
- ✅ Service worker config injected via `window.__FIREBASE_CONFIG__`
- ✅ VAPID key for web push authentication
- ❌ Never expose private keys or secrets

### Native Bridge Security
- ✅ Origin validation on sensitive handlers
- ✅ Deep link validation before navigation
- ✅ User confirmation for deep links
- ✅ Secure token deletion on logout
- ✅ Error handling for invalid responses

### Best Practices
1. **Never commit** `.env.local` to version control
2. **Use environment-specific** Firebase projects (dev/staging/prod)
3. **Validate all** user inputs and deep link parameters
4. **Implement rate limiting** for bridge calls if needed
5. **Monitor** for suspicious bridge activity
6. **Use HTTPS** in production for WebView URL

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Notifications Not Working
**Symptoms**: Token displayed but no notifications received

**Solutions**:
- Check Firebase Cloud Messaging is enabled
- Verify VAPID key is correct in `.env.local`
- Ensure browser allows notifications
- Check browser console for errors
- Verify token is correct when sending from Firebase Console

#### 2. Native Bridge Not Detected
**Symptoms**: Shows "Running in Web Browser" even in WebView

**Solutions**:
- Ensure `?versioninfo=mobileapp` is in URL
- Check Flutter app config for WebView bridge
- Verify `flutter_inappwebview` plugin is installed
- Check WebView JavaScript is enabled

#### 3. Service Worker Registration Fails
**Symptoms**: Console shows SW registration error

**Solutions**:
- Ensure `public/firebase-messaging-sw.js` exists
- Check SW is served from root path
- Verify HTTPS is used (SW requires HTTPS except localhost)
- Clear browser cache and SW storage

#### 4. Duplicate Notifications
**Symptoms**: Same notification appears twice

**Solutions**:
- Ensure mobile webview uses `?versioninfo=mobileapp`
- Web FCM should be disabled in mobile webview mode
- Native app should handle all push notifications
- Check native app notification forwarding logic

#### 5. Token Not Displayed
**Symptoms**: Click "Enable Notifications" but no token appears

**Solutions**:
- Check browser notification permission is granted
- Verify Firebase config in `.env.local`
- Check browser console for errors
- Ensure Firebase project is properly configured
- Try in incognito/private browsing mode

### Getting Help

1. **Check Logs**: Review Event Log section and browser console
2. **Review Documentation**: See related docs in `soccasio.mobileapps/docs/`
3. **Check Firebase Console**: Verify project settings and configuration
4. **Test Isolated Components**: Test web FCM and native bridge separately

---

## 📚 Related Documentation

### Flutter Mobile App
- 📁 `../soccasio.mobileapps/` - Native Flutter application
- 📄 `docs/WEBVIEW_BRIDGE.md` - Detailed bridge API documentation
- 📄 `docs/PUSH_NOTIFICATIONS_GUIDE.md` - FCM implementation guide
- 📄 `docs/WEBVIEW_PUSH_NOTIFICATION_INTEGRATION.md` - Integration guide
- 📄 `docs/FCM_LOGOUT_BEST_PRACTICES.md` - Logout mechanism guide

### Additional Resources
- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Next.js Documentation](https://nextjs.org/docs)
- [Web Push Notifications](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Flutter WebView Documentation](https://pub.dev/packages/flutter_inappwebview)

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

<div align="center">

Built with ❤️ using Next.js and Firebase

</div>