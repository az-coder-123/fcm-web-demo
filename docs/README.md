fcm-web-demo Documentation
===========================

> A comprehensive documentation suite for the **fcm-web-demo** project — a Next.js web application designed to demonstrate and test integration with the SOCCASIO native Flutter WebView bridge.

## Documentation Index

| # | Document | Description |
|---|----------|-------------|
| 1 | [Project Architecture](./PROJECT_ARCHITECTURE.md) | High-level architecture, directory structure, technology stack, and design patterns |
| 2 | [FCM Push Notifications](./FCM_PUSH_NOTIFICATIONS.md) | Firebase Cloud Messaging token acquisition, foreground/background message handling |
| 3 | [Native Bridge Integration](./NATIVE_BRIDGE_INTEGRATION.md) | WebView bridge communication, handler calls, and event listeners |
| 4 | [Biometric Authentication](./BIOMETRIC_AUTHENTICATION.md) | Biometric key creation, signing, and native biometric prompt integration |
| 5 | [Skin Color Theming](./SKIN_COLOR_THEMING.md) | Dynamic skin color theming synced between native app and web |
| 6 | [Swipe Gesture Detection](./SWIPE_GESTURE_DETECTION.md) | Horizontal swipe and pull-down gesture detection with native bridge events |
| 7 | [Network Status Monitoring](./NETWORK_STATUS_MONITORING.md) | Online/offline detection and native network status events |

## Quick Start

```bash
# Install dependencies
npm install

# Configure Firebase (see FCM_PUSH_NOTIFICATIONS.md)
cp .env.local.example .env.local
# Edit .env.local with your Firebase config

# Run development server
npm run dev
# Open http://localhost:3000
```

## Related Documentation

- [WebView Bridge Communication Guide](../../soccasio.mobileapps/docs/WEBVIEW_BRIDGE.md) — Full reference for all native ↔ web bridge handlers
- [SOCCASIO Project Structure](../../soccasio.mobileapps/docs/PROJECT_STRUCTURE.md) — Flutter mobile app architecture

---

*Last Updated: May 2026*