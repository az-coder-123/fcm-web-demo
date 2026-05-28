# Biometric Authentication

> Integration with the native Flutter app's biometric authentication capabilities (fingerprint, face recognition, iris scan) through the WebView bridge.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [API Reference](#api-reference)
- [UI Component](#ui-component)
- [Flows](#flows)
- [Error Handling](#error-handling)

---

## Overview

The biometric module (`lib/biometric.js`) provides a JavaScript API for the web app to interact with the native device's biometric hardware. All operations are performed through the native bridge — no web-side biometric processing occurs.

### Supported Biometric Types

| Type | Platform |
|------|----------|
| Fingerprint (Touch ID) | Android, iOS |
| Face Recognition (Face ID) | iOS, Android |
| Iris Scan | Android (select devices) |

---

## Architecture

```
┌─────────────────────────────────────┐
│        BiometricKeyBasedActions.js  │  UI Layer
└──────────────────┬──────────────────┘
                   │ calls
┌──────────────────▼──────────────────┐
│           lib/biometric.js          │  API Layer
│                                     │
│  • checkBiometricStatus()           │
│  • createBiometricKeys(reason)      │
│  • signWithBiometric(payload,reason)│
│  • simpleBiometricPrompt(reason)    │
└──────────────────┬──────────────────┘
                   │ callHandler()
┌──────────────────▼──────────────────┐
│    flutter_inappwebview bridge      │  Native Bridge
│    • biometricAuthAvailable         │
│    • biometricKeyExists             │
│    • biometricCreateKeys            │
│    • biometricSign                  │
│    • biometricPrompt                │
└─────────────────────────────────────┘
```

---

## API Reference

### `lib/biometric.js`

#### `isNativeBridgeAvailable()`

Checks if the native bridge is accessible (SSR-safe).

```javascript
import { isNativeBridgeAvailable } from '@/lib/biometric';
if (isNativeBridgeAvailable()) { /* ... */ }
```

**Returns:** `boolean`

#### `checkBiometricStatus()`

Checks whether biometric authentication is available and if keys are already registered.

```javascript
import { checkBiometricStatus } from '@/lib/biometric';
const status = await checkBiometricStatus();
// { isNativeApp: true, canAuthenticate: true, isRegistered: false, biometricType: "fingerprint" }
```

**Returns:** `Promise<{ isNativeApp, canAuthenticate, isRegistered, biometricType }>`

#### `createBiometricKeys(reason)`

Creates a new biometric key pair. Deletes any existing keys first.

```javascript
import { createBiometricKeys } from '@/lib/biometric';
const result = await createBiometricKeys('Register for secure login');
// { success: true, publicKey: "base64...", keyAlias: "..." }
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `reason` | string | User-facing prompt explaining why biometric is needed |

**Returns:** `Promise<{ success, publicKey, keyAlias }>`

#### `signWithBiometric(payload, reason)`

Signs a payload using the biometric private key. Triggers a biometric prompt.

```javascript
import { signWithBiometric } from '@/lib/biometric';
const result = await signWithBiometric('challenge-token', 'Confirm your identity');
// { success: true, signature: "base64...", algorithm: "SHA256withRSA" }
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `payload` | string | Data to sign (auto-generated if omitted) |
| `reason` | string | User-facing prompt |

**Returns:** `Promise<{ success, signature, algorithm }>`

#### `simpleBiometricPrompt(reason)`

Shows a biometric prompt without cryptographic operations. Useful for simple authentication.

```javascript
import { simpleBiometricPrompt } from '@/lib/biometric';
const result = await simpleBiometricPrompt('Verify your identity');
// { success: true, authenticated: true }
```

**Returns:** `Promise<{ success, authenticated }>`

---

## UI Component

### `BiometricKeyBasedActions.js`

Provides buttons for each biometric operation and displays results.

| Prop | Type | Description |
|------|------|-------------|
| `biometricSupport` | object | Status from `checkBiometricStatus()` |
| `biometricPermission` | object | Permission state |
| `biometricAuthResult` | object | Last operation result |
| `onCheckStatus` | function | Check biometric availability |
| `onCreateKeys` | function | Create biometric key pair |
| `onSign` | function | Sign with biometric |
| `onSimplePrompt` | function | Simple biometric prompt |
| `addToLog` | function | Event logger |

---

## Flows

### Registration Flow

```
1. User taps "Check Status"
   └── checkBiometricStatus() → { canAuthenticate: true }
2. User taps "Create Keys"
   └── createBiometricKeys("Register") → native biometric prompt
   └── User authenticates → keys created
   └── { success: true, publicKey: "..." }
3. Send publicKey to your backend server
```

### Authentication Flow

```
1. Backend sends a challenge token
2. User taps "Sign"
   └── signWithBiometric(challenge, "Login")
   └── Native biometric prompt appears
   └── User authenticates → signature created
   └── { success: true, signature: "..." }
3. Send signature to backend for verification
```

---

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| `Bridge not available` | Not in native app | Check `isNativeBridgeAvailable()` first |
| `Biometric not available` | Device lacks hardware | Inform user, offer fallback |
| `Key not found` | Keys not created | Call `createBiometricKeys()` first |
| `User cancelled` | User dismissed prompt | Handle gracefully, do not retry automatically |

---

*Last Updated: May 2026*