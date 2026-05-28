# Network Status Monitoring

> Online/offline connectivity detection and display in the fcm-web-demo, combining browser-native APIs with native bridge events.

## Table of Contents

- [Overview](#overview)
- [Dual Detection Strategy](#dual-detection-strategy)
- [UI Component](#ui-component)
- [Native Bridge Event](#native-bridge-event)
- [Usage Patterns](#usage-patterns)

---

## Overview

The `NetworkStatus.js` component displays the device's current connectivity state. It works in both **web browser** and **native WebView** contexts using complementary detection methods.

---

## Dual Detection Strategy

| Context | Mechanism | Event |
|---------|-----------|-------|
| **Web browser** | `navigator.onLine` + `online`/`offline` events | Browser native |
| **Native WebView** | `networkStatusChanged` CustomEvent from bridge | Flutter dispatch |

The component uses both simultaneously — the browser API provides immediate feedback, while the native event can supply additional context from the device.

---

## UI Component

### `NetworkStatus.js`

Displays a status badge indicating online or offline state.

| Prop | Type | Description |
|------|------|-------------|
| `status` | string | `'online'` or `'offline'` |

**Behavior:**
- Reads `navigator.onLine` on mount
- Listens for browser `online`/`offline` events
- In native app context, also listens for `networkStatusChanged` bridge event
- Displays green badge (online) or red badge (offline)

---

## Native Bridge Event

### `networkStatusChanged`

Dispatched by the Flutter native app when connectivity changes.

```javascript
window.addEventListener('networkStatusChanged', (event) => {
    const { isOnline } = event.detail;
    // Update UI
});
```

**Event Data:**

| Field | Type | Description |
|-------|------|-------------|
| `isOnline` | boolean | `true` = connected, `false` = offline |

---

## Usage Patterns

### Basic Status Display

```javascript
import NetworkStatus from '@/components/NetworkStatus';

function App({ networkStatus }) {
    return <NetworkStatus status={networkStatus} />;
}
```

### Reacting to Connectivity Changes

```javascript
useEffect(() => {
    const handleOnline = () => {
        setNetworkStatus('online');
        retryFailedRequests();
    };
    const handleOffline = () => {
        setNetworkStatus('offline');
        enableOfflineMode();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
}, []);
```

### Combining with API Requests

```javascript
async function safeFetch(url) {
    if (!navigator.onLine) {
        showToast('You are offline. Request queued.');
        queueRequest(url);
        return null;
    }
    return fetch(url);
}
```

---

*Last Updated: May 2026*