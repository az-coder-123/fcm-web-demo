# Skin Color Theming

> Dynamic skin color theming synchronized between the native Flutter app and the web app via the WebView bridge.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [API Reference](#api-reference)
- [Custom Hook](#custom-hook)
- [UI Components](#ui-components)
- [Flow](#flow)

---

## Overview

The skin color feature allows the native Flutter app to define a **dynamic accent color** that the web app respects. This creates a seamless visual experience where the web content matches the native app's current theme.

### Key Behaviors

| Action | Direction | Mechanism |
|--------|-----------|-----------|
| Set color | Web → Native | `callHandler('onSkinColorChanged', color)` |
| Sync on load | Native → Web | Read color via bridge on page load |
| Clear color | Web → Native | `callHandler('onSkinColorChanged', null)` |

---

## Architecture

```
┌──────────────────────────────────────┐
│         SkinColorControl.js          │  Color picker UI
│         SkinColorInitializer.js      │  Auto-sync on mount
└──────────────┬───────────────────────┘
               │
┌──────────────▼───────────────────────┐
│          useSkinColor.js             │  React hook (state)
└──────────────┬───────────────────────┘
               │
┌──────────────▼───────────────────────┐
│          lib/skinColor.js            │  Bridge API
│  • getSkinColor()                    │
│  • setSkinColor(color)               │
│  • clearSkinColor()                  │
└──────────────┬───────────────────────┘
               │ callHandler('onSkinColorChanged')
┌──────────────▼───────────────────────┐
│       Native JSBridgeService         │  Flutter native
└──────────────────────────────────────┘
```

---

## API Reference

### `lib/skinColor.js`

#### `getSkinColor()`

Retrieves the current skin color from the native app.

```javascript
import { getSkinColor } from '@/lib/skinColor';
const color = await getSkinColor();
// "#FF5733" or null
```

**Returns:** `Promise<string | null>`

#### `setSkinColor(color)`

Sends a skin color to the native app.

```javascript
import { setSkinColor } from '@/lib/skinColor';
await setSkinColor('#FF5733');
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `color` | string | Hex color code (e.g., `"#FF5733"`) |

**Returns:** `Promise<{ success, color }>`

#### `clearSkinColor()`

Clears the skin color in the native app.

```javascript
import { clearSkinColor } from '@/lib/skinColor';
await clearSkinColor();
```

**Returns:** `Promise<{ success, color: null }>`

---

## Custom Hook

### `useSkinColor()`

React hook that manages skin color state with automatic native synchronization.

```javascript
import useSkinColor from '@/lib/useSkinColor';

function MyComponent() {
    const { skinColor, setSkinColor, clearSkinColor, isNativeApp } = useSkinColor();
    
    return (
        <div style={{ borderColor: skinColor || '#ccc' }}>
            Themed content
        </div>
    );
}
```

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| `skinColor` | string \| null | Current color hex code |
| `setSkinColor` | function | Set color (syncs to native) |
| `clearSkinColor` | function | Clear color (syncs to native) |
| `isNativeApp` | boolean | Whether running in native app |

---

## UI Components

### `SkinColorControl.js`

Renders a color picker and set/clear buttons.

| Prop | Type | Description |
|------|------|-------------|
| `skinColor` | string \| null | Current color |
| `onColorChange` | function | Callback to set new color |
| `onClearColor` | function | Callback to clear color |

### `SkinColorInitializer.js`

Invisible component that syncs the skin color from native on mount. Renders nothing.

| Prop | Type | Description |
|------|------|-------------|
| `onColorLoaded` | function | Called with the color loaded from native |

---

## Flow

### Initial Load

```
Page mounts
    ↓
SkinColorInitializer → getSkinColor()
    ↓
Native returns current color → state updated
    ↓
UI renders with synced color
```

### User Changes Color

```
User picks color in SkinColorControl
    ↓
setSkinColor('#FF5733')
    ↓
callHandler('onSkinColorChanged', '#FF5733')
    ↓
Native app updates its theme
    ↓
State updated → UI re-renders
```

---

*Last Updated: May 2026*