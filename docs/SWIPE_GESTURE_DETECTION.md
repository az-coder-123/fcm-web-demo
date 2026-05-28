# Swipe Gesture Detection

> Horizontal swipe and pull-down gesture detection from the native Flutter app, received via the WebView bridge as `CustomEvent` dispatches.

## Table of Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Detection Thresholds](#detection-thresholds)
- [Custom Hook](#custom-hook)
- [UI Component](#ui-component)
- [Usage Example](#usage-example)
- [Disabling Swipe for Specific Elements](#disabling-swipe-for-specific-elements)

---

## Overview

The swipe detection feature enables the web app to respond to **touch gestures** detected by the native Flutter app. Gestures are captured by an auto-injected JavaScript `UserScript` at `DOCUMENT_START` and forwarded to the web app as browser `CustomEvent`s.

### Gesture Types

| Gesture | Event Name | Data |
|---------|-----------|------|
| Horizontal swipe | `swipeDetected` | `{ direction, deltaX, deltaY, velocity }` |
| Pull-down refresh | `pullDownRefresh` | `{ deltaY, velocity }` |

---

## How It Works

```
┌──────────────────────────────────────────────────────┐
│                 Flutter InAppWebView                 │
│                                                      │
│  UserScript (injected at DOCUMENT_START)             │
│    ↓ listens for touchstart / touchend               │
│    ↓ calculates swipe direction, distance, velocity  │
│    ↓ calls handler('onSwipeDetected', data)          │
│                                                      │
│  Native JSBridgeService                              │
│    ↓ receives swipe data                             │
│    ↓ dispatches CustomEvent('swipeDetected')         │
│                                                      │
│  ┌──────────────────────────────────────────────┐    │
│  │          Web App (fcm-web-demo)              │    │
│  │                                              │    │
│  │  useSwipeDetection() hook                    │    │
│  │    ↓ listens for 'swipeDetected' event       │    │
│  │    ↓ listens for 'pullDownRefresh' event     │    │
│  │    ↓ updates state: lastSwipe, swipeHistory  │    │
│  │                                              │    │
│  │  SwipeDemo.js component                      │    │
│  │    ↓ visualizes swipe events                 │    │
│  └──────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────┘
```

### Key Point

The web app does **not** need to add any touch event listeners. The native app auto-injects the detection logic. The web app only needs to listen for the `swipeDetected` and `pullDownRefresh` custom events.

---

## Detection Thresholds

The native app uses these thresholds to distinguish valid swipes from accidental touches:

| Threshold | Value | Purpose |
|-----------|-------|---------|
| `MIN_SWIPE_DISTANCE` | 80px | Minimum horizontal distance to qualify as a swipe |
| `MAX_SWIPE_TIME` | 500ms | Maximum gesture duration |
| `MAX_VERTICAL_RATIO` | 0.75 | Max vertical/horizontal ratio — rejects diagonal swipes |

---

## Custom Hook

### `useSwipeDetection()`

React hook that subscribes to swipe and pull-down events and maintains a history.

```javascript
import useSwipeDetection from '@/lib/useSwipeDetection';

function MyComponent() {
    const { lastSwipe, swipeHistory, isNativeApp } = useSwipeDetection();

    useEffect(() => {
        if (!lastSwipe) return;
        if (lastSwipe.direction === 'left') {
            // Navigate forward
        } else if (lastSwipe.direction === 'right') {
            // Navigate back
        }
    }, [lastSwipe]);
}
```

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| `lastSwipe` | object \| null | Most recent swipe event data |
| `swipeHistory` | array | Recent swipe events (capped) |
| `isNativeApp` | boolean | Whether running in native WebView |

### Swipe Event Shape

```javascript
// Horizontal swipe
{
    type: 'swipeDetected',
    direction: 'left' | 'right',
    deltaX: -120,    // pixels (negative = left, positive = right)
    deltaY: 15,      // pixels
    velocity: 0.8,   // pixels/ms
    timestamp: 1700000000000
}

// Pull-down refresh
{
    type: 'pullDownRefresh',
    deltaY: 150,     // pixels
    velocity: 0.5,   // pixels/ms
    timestamp: 1700000000000
}
```

---

## UI Component

### `SwipeDemo.js`

Visualizes swipe gesture detection with a direction indicator and event history.

| Prop | Type | Description |
|------|------|-------------|
| `lastSwipe` | object \| null | Latest swipe event data |
| `swipeHistory` | array | History of recent swipe events |
| `addToLog` | function | Event logger callback |

**Features:**
- Animated arrow showing swipe direction
- Swipe metadata display (distance, velocity)
- Scrollable event history

---

## Usage Example

### Basic Navigation with Swipe

```javascript
'use client';
import useSwipeDetection from '@/lib/useSwipeDetection';
import { useRouter } from 'next/navigation';

export default function SwipeablePage() {
    const { lastSwipe } = useSwipeDetection();
    const router = useRouter();

    useEffect(() => {
        if (!lastSwipe || lastSwipe.type !== 'swipeDetected') return;

        switch (lastSwipe.direction) {
            case 'right':
                router.back();
                break;
            case 'left':
                router.push('/next-page');
                break;
        }
    }, [lastSwipe, router]);

    return <div>Swipe left to go forward, right to go back</div>;
}
```

### Pull-to-Refresh

```javascript
useEffect(() => {
    if (!lastSwipe || lastSwipe.type !== 'pullDownRefresh') return;
    // Trigger data refresh
    refetchData();
}, [lastSwipe]);
```

---

## Disabling Swipe for Specific Elements

If you have interactive elements that should capture their own touch events (e.g., a horizontal carousel), stop event propagation:

```javascript
carousel.addEventListener('touchstart', (e) => {
    e.stopPropagation(); // Prevents native swipe detection
}, { passive: true });
```

---

*Last Updated: May 2026*