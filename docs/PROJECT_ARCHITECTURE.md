# Project Architecture

> Overview of the **fcm-web-demo** application architecture, directory structure, technology stack, and design patterns.

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Directory Structure](#directory-structure)
- [Architecture Diagram](#architecture-diagram)
- [Design Patterns](#design-patterns)
- [Component Hierarchy](#component-hierarchy)
- [State Management](#state-management)
- [Environment Configuration](#environment-configuration)

---

## Overview

**fcm-web-demo** is a [Next.js](https://nextjs.org/) 14 web application that serves as a **testing and demonstration harness** for the SOCCASIO native Flutter WebView bridge. It runs inside a Flutter `InAppWebView` and exercises every bridge handler and event the native app exposes.

### Primary Goals

1. **Validate** that the native WebView bridge works correctly end-to-end
2. **Demonstrate** how to integrate each native feature from a web perspective
3. **Debug** push notifications, biometric auth, location, and other native capabilities
4. **Provide reference code** for production web apps that will run inside the SOCCASIO WebView

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | [Next.js](https://nextjs.org/) (App Router) | 14.x |
| Runtime | React | 18.x |
| Language | JavaScript (ES2022+) | — |
| Styling | CSS (global stylesheet) | — |
| Push Notifications | Firebase Cloud Messaging (JS SDK) | 10.x |
| Service Worker | Workbox (via `firebase-messaging-sw.js`) | — |
| Native Bridge | `flutter_inappwebview` | — |
| Package Manager | npm | — |

---

## Directory Structure

```
fcm-web-demo/
├── app/                          # Next.js App Router
│   ├── globals.css               # Global styles
│   ├── layout.js                 # Root layout (HTML shell, metadata)
│   └── page.js                   # Main page (orchestrator component)
│
├── components/                   # React UI components
│   ├── AppStatus.js              # Native app detection & info display
│   ├── BiometricKeyBasedActions.js # Biometric auth demo actions
│   ├── ErrorDisplay.js           # Error message rendering
│   ├── EventLog.js               # Scrollable event log panel
│   ├── ExternalUrlActions.js     # Open URL in external/internal browser
│   ├── FcmTokenSection.js        # FCM token acquisition UI
│   ├── Instructions.js           # Setup instructions display
│   ├── NativeBridgeActions.js    # Locale, logout, and misc bridge actions
│   ├── NetworkStatus.js          # Online/offline status indicator
│   ├── SkinColorControl.js       # Skin color picker and controls
│   ├── SkinColorInitializer.js   # Auto-sync skin color from native on load
│   ├── SwipeDemo.js              # Swipe gesture detection demo
│   ├── TestActions.js            # Location, camera, mic, photo permission tests
│   ├── Toast.js                  # Toast notification component
│   └── TokenSubmission.js        # Token copy & submission UI
│
├── lib/                          # Business logic & custom hooks
│   ├── biometric.js              # Biometric bridge API
│   ├── fcm.js                    # FCM initialization & token management
│   ├── skinColor.js              # Skin color bridge API
│   ├── useSkinColor.js           # React hook for skin color state
│   └── useSwipeDetection.js      # React hook for swipe gesture detection
│
├── public/
│   └── firebase-messaging-sw.js  # Firebase service worker
│
├── docs/                         # Feature documentation
├── package.json
├── next.config.js
└── README.md
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│                  Flutter Native App             │
│  ┌───────────────────────────────────────────┐  │
│  │           InAppWebView (NativeApp)        │  │
│  │                                           │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │       fcm-web-demo (Next.js)        │  │  │
│  │  │                                     │  │  │
│  │  │  ┌─────────┐    ┌──────────────┐    │  │  │
│  │  │  │ page.js │───▶│  Components  │    │  │  │
│  │  │  │ (State) │    │  (UI Layer)  │    │  │  │
│  │  │  └────┬────┘    └──────────────┘    │  │  │
│  │  │       │                             │  │  │
│  │  │  ┌────▼────────────────────────┐    │  │  │
│  │  │  │        lib/ (Hooks/API)     │    │  │  │
│  │  │  │  • fcm.js                   │    │  │  │
│  │  │  │  • biometric.js             │    │  │  │
│  │  │  │  • skinColor.js             │    │  │  │
│  │  │  │  • useSwipeDetection.js     │    │  │  │
│  │  │  └──────────┬──────────────────┘    │  │  │
│  │  └─────────────┼───────────────────────┘  │  │
│  │                │                          │  │
│  │     flutter_inappwebview bridge           │  │
│  │       (window.flutter_inappwebview)       │  │
│  └────────────────┼──────────────────────────┘  │
│                   │                             │
│  ┌────────────────▼────────────────────────┐    │
│  │        JSBridgeService (Dart)           │    │
│  │   • registerHandlers()                  │    │
│  │   • sendToWeb()                         │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

---

## Design Patterns

### 1. Centralized State (page.js)

All application state lives in `page.js` via React `useState` hooks. Child components receive state and callbacks as props. This keeps the demo simple and easy to follow.

### 2. Prop Drilling

Callbacks like `addToLog()`, `setError()`, and `showToast()` are passed down from `page.js` to leaf components. While not ideal for production, this pattern keeps the demo self-contained.

### 3. Custom Hooks for Complex Logic

Reusable logic is extracted into custom hooks in `lib/`:
- `useSwipeDetection()` — gesture detection with native bridge listener
- `useSkinColor()` — skin color state management with native sync

### 4. Bridge API Modules

Native bridge interactions are encapsulated in dedicated modules:
- `lib/fcm.js` — FCM token operations
- `lib/biometric.js` — Biometric authentication calls
- `lib/skinColor.js` — Skin color bridge API

### 5. Service Worker for Background Messages

`public/firebase-messaging-sw.js` handles push notifications when the web app is in the background, using the standard Firebase Messaging service worker pattern.

---

## Component Hierarchy

```
page.js (Home)
├── Toast
├── ErrorDisplay
├── AppStatus
├── Instructions
├── FcmTokenSection
├── TokenSubmission
├── SkinColorInitializer          (invisible — runs on mount)
├── SkinColorControl
├── NetworkStatus
├── NativeBridgeActions
├── BiometricKeyBasedActions
├── TestActions
├── ExternalUrlActions
├── SwipeDemo
└── EventLog
```

---

## State Management

The application uses **React local state** only — no external state management library.

### Key State Variables (in `page.js`)

| Category | State Variables | Purpose |
|----------|----------------|---------|
| **Core** | `token`, `error`, `toast` | FCM token, errors, toast notifications |
| **Native** | `isNativeApp`, `appInfo`, `currentLocale` | Bridge detection & app metadata |
| **Network** | `networkStatus` | Online/offline status |
| **Auth** | `logoutResult`, `isLoggedIn` | Logout flow |
| **Biometric** | `biometricSupport`, `biometricPermission`, `biometricAuthResult` | Biometric auth |
| **Location** | `locationPermission`, `location`, `locationError` | Location services |
| **Media** | `cameraPermission`, `microphonePermission`, `photoPermission` | Device permissions |
| **Skin Color** | `skinColor` (via `useSkinColor` hook) | Dynamic theming |
| **Swipe** | `lastSwipe`, `swipeHistory` (via `useSwipeDetection` hook) | Gesture events |
| **Logging** | `notificationLog` | Event log (capped at 20 entries) |

---

## Environment Configuration

The application uses a `.env.local` file for Firebase configuration:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# FCM VAPID Key (for web push)
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your-vapid-key
```

> Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser in Next.js.

---

*Last Updated: May 2026*