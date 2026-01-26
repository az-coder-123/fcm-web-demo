'use client';
import { useEffect, useState } from 'react';
import { initFirebaseApp, onForegroundMessage, requestNotificationPermissionAndToken } from '../lib/fcm';

export default function Home() {
    const [token, setToken] = useState(null);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null); // { title, body }

    useEffect(() => {
        initFirebaseApp();
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/firebase-messaging-sw.js')
                .then((registration) => {
                    console.log('Service Worker registered', registration);
                })
                .catch((err) => {
                    console.error('Service Worker registration failed', err);
                });
        }
    }, []);

    // Listen for foreground messages and show a simple toast.
    useEffect(() => {
        let unsubscribe;
        (async () => {
            try {
                unsubscribe = await onForegroundMessage((payload) => {
                    const title = payload?.notification?.title || 'Notification';
                    const body = payload?.notification?.body || '';
                    setToast({ title, body });
                });
            } catch (err) {
                console.warn('Foreground messaging not supported or failed to init:', err);
            }
        })();
        return () => {
            if (typeof unsubscribe === 'function') unsubscribe();
        };
    }, []);

    // Auto-dismiss toast after some seconds
    useEffect(() => {
        if (!toast) return;
        const id = setTimeout(() => setToast(null), 5000);
        return () => clearTimeout(id);
    }, [toast]);

    const handleEnable = async () => {
        try {
            const t = await requestNotificationPermissionAndToken();
            setToken(t);
        } catch (e) {
            setError(e?.message || String(e));
        }
    };

    return (
        <main style={{ padding: 16, fontFamily: 'system-ui' }}>
            <h1>Firebase Cloud Messaging (Web)</h1>
            <p>Click to enable notifications and get FCM token.</p>
            <button onClick={handleEnable} style={{ padding: '8px 12px' }}>Enable Notifications</button>
            {token && (
                <div style={{ marginTop: 16 }}>
                    <h3>FCM Registration Token</h3>
                    <textarea value={token} readOnly rows={4} style={{ width: '100%' }} />
                </div>
            )}
            {error && (
                <p style={{ color: 'red', marginTop: 16 }}>Error: {error}</p>
            )}

            {/* Simple Toast UI */}
            {toast && (
                <div
                    style={{
                        position: 'fixed',
                        left: '50%',
                        bottom: 16,
                        transform: 'translateX(-50%)',
                        background: '#fff',
                        color: '#111',
                        border: '1px solid #ddd',
                        borderRadius: 8,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                        padding: '12px 16px',
                        maxWidth: 420,
                        width: 'calc(100% - 32px)',
                        zIndex: 9999,
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                        <div>
                            <div style={{ fontWeight: 600, marginBottom: 4 }}>{toast.title}</div>
                            <div style={{ opacity: 0.9 }}>{toast.body}</div>
                        </div>
                        <button
                            aria-label="Close notification"
                            onClick={() => setToast(null)}
                            style={{
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                fontSize: 18,
                                lineHeight: 1,
                            }}
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}
