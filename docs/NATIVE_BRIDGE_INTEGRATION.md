# Native Bridge Integration

> WebView bridge communication between the fcm-web-demo and the SOCCASIO Flutter native app, including handler calls, event listeners, and security considerations.

## Table of Contents

- [Overview](#overview)
- [Bridge Detection](#bridge-detection)
- [Calling Native Handlers](#calling-native-handlers)
- [Listening for Native Events](#listening-for-native-events)
- [Available Handlers](#available-handlers)
- [Component Reference](#component-reference)
- [Error Handling](#error-handling)

---

## Overview

The native bridge uses `flutter_inappwebview` to establish a two-way communication channel between the web app and the Flutter native app. The bridge is registered under the channel name **`NativeApp`**.

```
Web App ←→ window.flutter_inappwebview ←→ JSBridgeService (Flutter)
```

### Communication Directions

| Direction | Mechanism | Example |
|-----------|-----------|---------|
| **Web → Native** | `callHandler(name, ...args)` | Get FCM token, change locale |
| **Native → Web** | `CustomEvent` dispatch | Locale changed, network status |

---

## Bridge Detection

### Checking if Running Inside Native App

```javascript
// From page.js — runs on mount
useEffect(() => {
    const checkNative = async () => {
        try {
            if (!window.flutter_inappwebview) {
                setIsNativeApp(false);
                return;
            }
            const info = await window.flutter_inappwebview.callHandler('getAppInfo');
            setIsNativeApp(!!(info && info.success));
            setAppInfo(info);
        } catch {
            setIsNativeApp(false);
        }
    };
    checkNative();
}, []);
```

### UI Component: `AppStatus.js`

Displays whether the app is running in native mode or web browser mode, along with app metadata (name, version, platform) when available.

---

## Calling Native Handlers

### Standard Pattern

```javascript
const result = await window.flutter_inappwebview.callHandler('handlerName', arg1, arg2);
```

### Response Format

All handlers return an object with a `success` boolean:

```javascript
// Success
{ success: true, ...data }

// Failure
{ success: false, error: "Error message" }
```

---

## Listening for Native Events

### Standard Pattern

```javascript
useEffect(() => {
    const handler = (event) => {
        const data = event.detail;
        // Handle event
    };

    window.addEventListener('eventName', handler);
    return () => window.removeEventListener('eventName', handler);
}, []);
```

### Events Used in fcm-web-demo

| Event | Trigger | Data |
|-------|---------|------|
| `swipeDetected` | Native detects horizontal swipe | `{ direction, deltaX, deltaY, velocity }` |
| `pullDownRefresh` | Native detects pull-down gesture | `{ deltaY, velocity }` |
| `localeChanged` | Language changed in native settings | `{ languageCode }` |
| `networkStatusChanged` | Device goes online/offline | `{ isOnline }` |
| `pushNotificationReceived` | Push notification arrives | `{ title, body, data }` |

---

## Available Handlers

The following native bridge handlers are used by fcm-web-demo:

### App Information

| Handler | Args | Returns | Origin Check |
|---------|------|---------|-------------|
| `getAppInfo` | None | `{ appName, version, platform, bridgeChannel }` | ❌ |
| `getLocale` | None | `{ languageCode, countryCode }` | ❌ |

### Push Notifications

| Handler | Args | Returns | Origin Check |
|---------|------|---------|-------------|
| `getFCMToken` | None | `{ token }` | ✅ |
| `logout` | None | `{ success }` | ❌ |

### Locale

| Handler | Args | Returns | Origin Check |
|---------|------|---------|-------------|
| `changeLocale` | `languageCode` | `{ locale }` | ✅ |

### Skin Color

| Handler | Args | Returns | Origin Check |
|---------|------|---------|-------------|
| `onSkinColorChanged` | `skinColor` | `{ color }` | ✅ |

### URLs

| Handler | Args | Returns | Origin Check |
|---------|------|---------|-------------|
| `openUrlInDefaultBrowser` | `url` | `{ url }` | ❌ |
| `openUrlInInternalBrowser` | `url` | `{ url }` | ✅ |

### Biometric

| Handler | Args | Returns | Origin Check |
|---------|------|---------|-------------|
| `biometricAuthAvailable` | None | `{ available, biometricType }` | — |
| `biometricKeyExists` | None | `{ exists, keyAlias }` | — |
| `biometricCreateKeys` | `reason` | `{ publicKey, keyAlias }` | — |
| `biometricSign` | `payload, reason` | `{ signature, algorithm }` | — |
| `biometricPrompt` | `reason` | `{ authenticated }` | — |

### Device Permissions

| Handler | Args | Returns |
|---------|------|---------|
| `getLocationPermissionStatus` | None | `{ permission, isGranted }` |
| `requestLocationPermission` | None | `{ permission, isGranted }` |
| `getLocation` | None | `{ latitude, longitude, accuracy }` |
| `log` | `message, level` | `{ success }` |

---

## Component Reference

### `NativeBridgeActions.js`

Demonstrates locale switching and logout functionality.

| Prop | Type | Description |
|------|------|-------------|
| `currentLocale` | string | Current language code |
| `onLocaleChange` | function | Callback to change locale |
| `onLogout` | function | Callback to trigger logout |
| `logoutResult` | object | Result of last logout attempt |
| `addToLog` | function | Event logger |

### `ExternalUrlActions.js`

Demonstrates opening URLs in external browser vs internal WebView.

| Prop | Type | Description |
|------|------|-------------|
| `onOpenExternal` | function | Open URL in external browser |
| `onOpenInternal` | function | Open URL in internal WebView |

### `TestActions.js`

Tests location permission and coordinate retrieval via native bridge.

| Prop | Type | Description |
|------|------|-------------|
| `locationPermission` | object | Current location permission state |
| `location` | object | Current coordinates |
| `locationError` | string | Error message |
| `onCheckPermission` | function | Check location permission |
| `onRequestPermission` | function | Request location permission |
| `onGetLocation` | function | Get current coordinates |
| `addToLog` | function | Event logger |

---

## Error Handling

### Bridge Not Available

Always check if the bridge exists before calling handlers:

```javascript
if (!window.flutter_inappwebview) {
    console.warn('Not running in native app');
    return;
}
```

### Handler Failure

Always check the `success` field in the response:

```javascript
const result = await window.flutter_inappwebview.callHandler('getFCMToken');
if (result && result.success) {
    // Use result.token
} else {
    console.error('Handler failed:', result?.error);
}
```

### Timeout Protection

Consider wrapping calls in a timeout for production use:

```javascript
function callWithTimeout(handler, args, timeoutMs = 5000) {
    return Promise.race([
        window.flutter_inappwebview.callHandler(handler, ...args),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Bridge call timed out')), timeoutMs)
        ),
    ]);
}
```

---

*Last Updated: May 2026*