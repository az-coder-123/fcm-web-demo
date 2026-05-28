'use client';

import { useCallback, useState } from 'react';
import useSwipeDetection from '../lib/useSwipeDetection';

/**
 * SwipeDemo — demonstrates the onSwipeDetected WebView bridge feature.
 *
 * Features:
 * - Shows real-time swipe detection status
 * - Displays last swipe details (direction, deltaX, deltaY, velocity)
 * - Maintains a swipe history log
 * - Visual arrow animation on swipe
 * - Simulates swipe via button (for testing without touch device)
 * - Swipeable card demo with navigation counter
 */
export default function SwipeDemo() {
    const { lastSwipe, swipeHistory, isListening } = useSwipeDetection();
    const [cardIndex, setCardIndex] = useState(0);
    const [arrowAnim, setArrowAnim] = useState(null); // 'left' | 'right' | 'down' | null
    const [isReloading, setIsReloading] = useState(false);

    const cards = [
        { title: 'Card 1', color: '#E3F2FD', description: 'Swipe left/right to navigate between cards' },
        { title: 'Card 2', color: '#E8F5E9', description: 'This demonstrates swipe gesture detection' },
        { title: 'Card 3', color: '#FFF3E0', description: 'Works with both native bridge and web touch events' },
        { title: 'Card 4', color: '#F3E5F5', description: 'Swipe velocity and distance are tracked' },
    ];

    const handleSwipeNavigation = useCallback((direction) => {
        if (direction === 'down') {
            // Pull-down triggers reload simulation
            setIsReloading(true);
            setTimeout(() => {
                window.location.reload();
            }, 800);
            return;
        }
        if (direction === 'left') {
            setCardIndex(prev => Math.min(prev + 1, cards.length - 1));
        } else {
            setCardIndex(prev => Math.max(prev - 1, 0));
        }
        // Trigger arrow animation
        setArrowAnim(direction);
        setTimeout(() => setArrowAnim(null), 500);
    }, [cards.length]);

    // Respond to detected swipes for card navigation
    const onSwipeNav = useCallback(() => {
        if (lastSwipe) {
            handleSwipeNavigation(lastSwipe.direction);
        }
    }, [lastSwipe, handleSwipeNavigation]);

    const simulateSwipe = (direction) => {
        const isDown = direction === 'down';
        const simulatedSwipe = {
            direction,
            deltaX: isDown ? 3 : (direction === 'right' ? 150 : -150),
            deltaY: isDown ? 120 : 5,
            velocity: isDown ? 0.4 : 0.75,
            source: 'simulated',
        };
        // Dispatch as a custom event so useSwipeDetection picks it up
        window.dispatchEvent(new CustomEvent('swipeDetected', {
            detail: simulatedSwipe,
        }));
    };

    return (
        <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                👆 Swipe Gesture Detection
                <span style={{
                    fontSize: 11,
                    padding: '2px 8px',
                    borderRadius: 10,
                    background: isListening ? '#C8E6C9' : '#FFCDD2',
                    color: isListening ? '#2E7D32' : '#C62828',
                    fontWeight: 600,
                }}>
                    {isListening ? '● Listening' : '○ Inactive'}
                </span>
            </h2>

            {/* Thresholds info */}
            <div style={styles.thresholdsBox}>
                <strong>Horizontal Swipe Thresholds:</strong>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 4 }}>
                    <span style={styles.badge}>Min distance: 80px</span>
                    <span style={styles.badge}>Max time: 500ms</span>
                    <span style={styles.badge}>Max vert ratio: 0.75</span>
                </div>
                <strong style={{ display: 'block', marginTop: 6 }}>Pull-Down Thresholds:</strong>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 4 }}>
                    <span style={styles.badge}>Min distance: 60px</span>
                    <span style={styles.badge}>Max time: 600ms</span>
                    <span style={styles.badge}>Min vert ratio: 1.5</span>
                    <span style={{ ...styles.badge, background: '#FFECB3' }}>scrollY === 0</span>
                </div>
            </div>

            {/* Reload overlay for pull-down */}
            {isReloading && (
                <div style={styles.reloadOverlay}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>🔄</div>
                    <div style={{ fontWeight: 600 }}>Reloading...</div>
                </div>
            )}

            {/* Swipe direction arrow animation */}
            <div style={styles.arrowContainer}>
                {arrowAnim ? (
                    <div style={{
                        ...styles.arrowPulse,
                        transform: arrowAnim === 'left' ? 'translateX(-20px)' : arrowAnim === 'down' ? 'translateY(20px)' : 'translateX(20px)',
                        opacity: 0,
                    }}>
                        {arrowAnim === 'left' ? '⬅️' : arrowAnim === 'down' ? '⬇️' : '➡️'}
                    </div>
                ) : (
                    <div style={{ color: '#999', fontSize: 13 }}>
                        Swipe horizontally or pull-down to see direction indicator
                    </div>
                )}
            </div>

            {/* Last swipe details */}
            {lastSwipe && (
                <div style={styles.lastSwipeBox}>
                    <strong>Last Swipe:</strong>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginTop: 6, fontSize: 13 }}>
                        <span>Direction: <strong>{lastSwipe.direction === 'left' ? '⬅️ Left' : lastSwipe.direction === 'down' ? '⬇️ Down (Pull-to-Reload)' : '➡️ Right'}</strong></span>
                        <span>Source: <strong>{lastSwipe.source}</strong></span>
                        <span>DeltaX: <strong>{lastSwipe.deltaX}px</strong></span>
                        <span>DeltaY: <strong>{lastSwipe.deltaY}px</strong></span>
                        <span>Velocity: <strong>{lastSwipe.velocity} px/ms</strong></span>
                        <span>Time: <strong>{lastSwipe.timestamp}</strong></span>
                    </div>
                </div>
            )}

            {/* Swipeable card navigation demo */}
            <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <strong style={{ fontSize: 14 }}>Swipeable Card Navigator:</strong>
                    <span style={{ fontSize: 12, color: '#666' }}>
                        {cardIndex + 1} / {cards.length}
                    </span>
                </div>

                <div style={{
                    ...styles.card,
                    background: cards[cardIndex].color,
                }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: 16 }}>{cards[cardIndex].title}</h3>
                    <p style={{ margin: 0, fontSize: 13, color: '#555' }}>{cards[cardIndex].description}</p>
                    <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                        <button
                            onClick={() => handleSwipeNavigation('right')}
                            disabled={cardIndex === 0}
                            style={{ ...styles.navBtn, opacity: cardIndex === 0 ? 0.4 : 1 }}
                        >
                            ← Back
                        </button>
                        <button
                            onClick={() => handleSwipeNavigation('left')}
                            disabled={cardIndex === cards.length - 1}
                            style={{ ...styles.navBtn, opacity: cardIndex === cards.length - 1 ? 0.4 : 1 }}
                        >
                            Next →
                        </button>
                    </div>
                </div>

                <button
                    onClick={onSwipeNav}
                    disabled={!lastSwipe}
                    style={{
                        ...styles.applyBtn,
                        opacity: lastSwipe ? 1 : 0.5,
                        cursor: lastSwipe ? 'pointer' : 'not-allowed',
                    }}
                >
                    ↻ Apply Last Swipe to Navigator
                </button>
            </div>

            {/* Simulate swipe buttons */}
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <button onClick={() => simulateSwipe('left')} style={styles.simBtn}>
                    ⬅️ Left
                </button>
                <button onClick={() => simulateSwipe('down')} style={{ ...styles.simBtn, background: '#FFF3E0' }}>
                    ⬇️ Pull Down
                </button>
                <button onClick={() => simulateSwipe('right')} style={styles.simBtn}>
                    ➡️ Right
                </button>
            </div>

            {/* Swipe history */}
            {swipeHistory.length > 0 && (
                <div style={{ marginTop: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: 14 }}>Swipe History ({swipeHistory.length}):</strong>
                    </div>
                    <div style={styles.historyList}>
                        {swipeHistory.map((sw) => (
                            <div key={sw.id} style={styles.historyItem}>
                                <span style={{ fontSize: 16 }}>
                                    {sw.direction === 'left' ? '⬅️' : sw.direction === 'down' ? '⬇️' : '➡️'}
                                </span>
                                <span style={{ fontSize: 12, fontWeight: 600 }}>
                                    {sw.direction.toUpperCase()}
                                </span>
                                <span style={{ fontSize: 11, color: '#888' }}>
                                    Δx:{sw.deltaX} Δy:{sw.deltaY} v:{sw.velocity}
                                </span>
                                <span style={{
                                    ...styles.sourceBadge,
                                    background: sw.source === 'native' ? '#C8E6C9' : sw.source === 'simulated' ? '#FFF9C4' : '#BBDEFB',
                                }}>
                                    {sw.source}
                                </span>
                                <span style={{ fontSize: 10, color: '#aaa' }}>{sw.timestamp}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    thresholdsBox: {
        background: '#F5F5F5',
        border: '1px solid #E0E0E0',
        borderRadius: 8,
        padding: '8px 12px',
        fontSize: 12,
        marginBottom: 12,
    },
    badge: {
        background: '#E0E0E0',
        padding: '2px 8px',
        borderRadius: 10,
        fontSize: 11,
    },
    arrowContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 40,
        marginBottom: 8,
    },
    arrowPulse: {
        fontSize: 28,
        transition: 'all 0.5s ease-out',
    },
    lastSwipeBox: {
        background: '#E3F2FD',
        border: '1px solid #90CAF9',
        borderRadius: 8,
        padding: '10px 14px',
        marginBottom: 12,
    },
    card: {
        borderRadius: 12,
        padding: '16px 20px',
        border: '1px solid #DDD',
        transition: 'all 0.3s ease',
        touchAction: 'pan-y', // Allow vertical scroll but detect horizontal swipe
    },
    navBtn: {
        padding: '6px 14px',
        border: '1px solid #CCC',
        borderRadius: 6,
        background: 'white',
        cursor: 'pointer',
        fontSize: 13,
    },
    applyBtn: {
        marginTop: 8,
        width: '100%',
        padding: '8px 14px',
        border: '1px solid #1565C0',
        borderRadius: 6,
        background: '#E3F2FD',
        color: '#1565C0',
        cursor: 'pointer',
        fontSize: 13,
        fontWeight: 600,
    },
    simBtn: {
        flex: 1,
        padding: '8px 12px',
        border: '1px solid #DDD',
        borderRadius: 6,
        background: '#FAFAFA',
        cursor: 'pointer',
        fontSize: 12,
    },
    reloadOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(255,255,255,0.85)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
    },
    historyList: {
        maxHeight: 160,
        overflowY: 'auto',
        border: '1px solid #E0E0E0',
        borderRadius: 6,
        marginTop: 6,
    },
    historyItem: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 10px',
        borderBottom: '1px solid #F0F0F0',
        fontSize: 12,
    },
    sourceBadge: {
        fontSize: 10,
        padding: '1px 6px',
        borderRadius: 8,
        fontWeight: 600,
    },
};