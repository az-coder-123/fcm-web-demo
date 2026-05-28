'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Swipe detection thresholds matching the native Flutter WebView UserScript:
 * 
 * Horizontal swipe:
 * | Threshold            | Value  | Purpose                            |
 * |----------------------|--------|-------------------------------------|
 * | MIN_SWIPE_DISTANCE   | 80px   | Minimum horizontal distance         |
 * | MAX_SWIPE_TIME       | 500ms  | Maximum duration for gesture        |
 * | MAX_VERTICAL_RATIO   | 0.75   | Max vertical/horizontal ratio       |
 *
 * Pull-down (direction: "down"):
 * | Threshold                | Value  | Purpose                            |
 * |--------------------------|--------|-------------------------------------|
 * | MIN_PULL_DOWN_DISTANCE   | 60px   | Minimum vertical distance           |
 * | MAX_PULL_DOWN_TIME       | 600ms  | Maximum duration for gesture        |
 * | MIN_VERTICAL_RATIO       | 1.5    | Min vertical/horizontal ratio       |
 *
 * Pull-down only fires when scrollY === 0.
 */
const MIN_SWIPE_DISTANCE = 80;
const MAX_SWIPE_TIME = 500;
const MAX_VERTICAL_RATIO = 0.75;

const MIN_PULL_DOWN_DISTANCE = 60;
const MAX_PULL_DOWN_TIME = 600;
const MIN_VERTICAL_RATIO = 1.5;

/**
 * Custom hook for detecting horizontal swipe gestures.
 * 
 * In the native Flutter WebView, a UserScript is injected at DOCUMENT_START
 * that listens for touchstart/touchend events. This hook replicates that
 * behavior for web-only testing, AND also listens for the `swipeDetected`
 * custom event dispatched by the native bridge.
 * 
 * Usage:
 *   const { lastSwipe, swipeHistory, isListening } = useSwipeDetection();
 */
export function useSwipeDetection() {
    const [lastSwipe, setLastSwipe] = useState(null);
    const [swipeHistory, setSwipeHistory] = useState([]);
    const [isListening, setIsListening] = useState(false);
    const touchStartRef = useRef(null);

    const recordSwipe = useCallback((swipeData) => {
        const entry = {
            ...swipeData,
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            timestamp: new Date().toLocaleTimeString(),
        };
        setLastSwipe(entry);
        setSwipeHistory(prev => [entry, ...prev].slice(0, 20));
    }, []);

    // ---- Native bridge event listeners ----
    useEffect(() => {
        const handleSwipeDetected = (event) => {
            const { direction, deltaX, deltaY, velocity } = event.detail;
            console.log('[useSwipeDetection] swipeDetected from native:', event.detail);
            recordSwipe({ direction, deltaX, deltaY, velocity, source: 'native' });
        };

        // When mobile app sends pullDownRefresh event → reload the page
        const handlePullDownRefresh = (event) => {
            console.log('[useSwipeDetection] pullDownRefresh from native, reloading page...', event.detail);
            recordSwipe({
                direction: 'down',
                deltaX: 0,
                deltaY: event.detail?.deltaY || 0,
                velocity: event.detail?.velocity || 0,
                source: 'native',
            });
            setTimeout(() => {
                window.location.reload();
            }, 100);
        };

        window.addEventListener('swipeDetected', handleSwipeDetected);
        window.addEventListener('pullDownRefresh', handlePullDownRefresh);
        return () => {
            window.removeEventListener('swipeDetected', handleSwipeDetected);
            window.removeEventListener('pullDownRefresh', handlePullDownRefresh);
        };
    }, [recordSwipe]);

    // ---- Web touch-based swipe detection ----
    useEffect(() => {
        const handleTouchStart = (e) => {
            const touch = e.touches[0];
            touchStartRef.current = {
                x: touch.clientX,
                y: touch.clientY,
                time: Date.now(),
            };
        };

        const handleTouchEnd = (e) => {
            if (!touchStartRef.current) return;

            const touch = e.changedTouches[0];
            const start = touchStartRef.current;
            touchStartRef.current = null;

            const deltaX = touch.clientX - start.x;
            const deltaY = touch.clientY - start.y;
            const elapsed = Date.now() - start.time;
            const absX = Math.abs(deltaX);
            const absY = Math.abs(deltaY);

            // Check for pull-down first (only when scrolled to top)
            if (
                absY >= MIN_PULL_DOWN_DISTANCE &&
                elapsed <= MAX_PULL_DOWN_TIME &&
                deltaY > 0 &&
                (absX === 0 || (absY / absX) >= MIN_VERTICAL_RATIO) &&
                window.scrollY === 0
            ) {
                const velocity = absY / elapsed;
                recordSwipe({
                    direction: 'down',
                    deltaX: Math.round(deltaX),
                    deltaY: Math.round(deltaY),
                    velocity: Math.round(velocity * 100) / 100,
                    source: 'web',
                });
            }
            // Check for horizontal swipe
            else if (
                absX >= MIN_SWIPE_DISTANCE &&
                elapsed <= MAX_SWIPE_TIME &&
                (absY / absX) <= MAX_VERTICAL_RATIO
            ) {
                const direction = deltaX > 0 ? 'right' : 'left';
                const velocity = absX / elapsed;

                recordSwipe({
                    direction,
                    deltaX: Math.round(deltaX),
                    deltaY: Math.round(deltaY),
                    velocity: Math.round(velocity * 100) / 100,
                    source: 'web',
                });
            }
        };

        document.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchend', handleTouchEnd, { passive: true });
        setIsListening(true);

        return () => {
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchend', handleTouchEnd);
            setIsListening(false);
        };
    }, [recordSwipe]);

    return { lastSwipe, swipeHistory, isListening };
}

export default useSwipeDetection;