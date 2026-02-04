'use client';

import { useEffect, useState } from 'react';
import {
    initFirebaseApp,
    onForegroundMessage,
    requestNotificationPermissionAndToken,
} from '../lib/fcm';

export default function Home() {
    const [token, setToken] = useState(null);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null); // { title, body }

    // Native bridge state
    const [isNativeApp, setIsNativeApp] = useState(false);
    const [appInfo, setAppInfo] = useState(null);
    const [currentLocale, setCurrentLocale] = useState(null);
    const [networkStatus, setNetworkStatus] = useState(null);
    const [notificationLog, setNotificationLog] = useState([]);
    const [logoutResult, setLogoutResult] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(true); // Track login state

    useEffect(() => {
        // Detect mobile app webview via query parameter ?versioninfo=mobileapp
        const isMobileAppParam = (typeof window !== 'undefined') && new URLSearchParams(window.location.search).get('versioninfo') === 'mobileapp';
        if (isMobileAppParam) {
            console.log('versioninfo=mobileapp detected: skipping Firebase initialization and Service Worker registration.');
            // Treat query param as mobile app webview mode so UI uses native bridge flows
            setIsNativeApp(true);
            setAppInfo({ appName: 'Mobile Webview', version: 'unknown', platform: 'mobile-webview' });
            // Log to Event Log so it's visible in UI
            try {
                addToLog('Environment', 'Detected mobile webview (versioninfo=mobileapp)');
                addToLog('App Info', JSON.stringify({ appName: 'Mobile Webview', version: 'unknown', platform: 'mobile-webview' }));
            } catch (e) {
                console.warn('addToLog not available yet', e);
            }
        } else {
            initFirebaseApp();
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker
                    .register('/firebase-messaging-sw.js')
                    .then((registration) => {
                        console.log('Service Worker registered', registration);

                        // Send firebase config to the service worker so it can initialize messaging
                        const config = (typeof window !== 'undefined' && window.__FIREBASE_CONFIG__) ? window.__FIREBASE_CONFIG__ : {};

                        navigator.serviceWorker.ready
                            .then((reg) => {
                                // Prefer active, then waiting, then installing
                                const target = reg.active || reg.waiting || reg.installing;
                                if (target && typeof target.postMessage === 'function') {
                                    target.postMessage({ type: 'SET_FIREBASE_CONFIG', config });
                                }
                            })
                            .catch((e) => console.warn('Failed to postMessage to service worker', e));
                    })
                    .catch((err) => {
                        console.error('Service Worker registration failed', err);
                    });
            }
        }

        // Check if running in native app
        checkNativeBridge();
    }, []);

    // Check if running in native app and get app info
    const checkNativeBridge = async () => {
        try {
            if (window.flutter_inappwebview) {
                const info = await window.flutter_inappwebview.callHandler('getAppInfo');
                if (info && info.success) {
                    setIsNativeApp(true);
                    setAppInfo(info);
                    console.log('Running in native app:', info);

                    // Log to Event Log
                    try {
                        addToLog('Native Bridge', `Detected native bridge: ${info.appName || 'unknown'} v${info.version || 'unknown'} (${info.platform || 'unknown'})`);
                        addToLog('App Info', JSON.stringify(info));
                    } catch (e) {
                        console.warn('addToLog not available yet', e);
                    }

                    // Get current locale
                    const locale = await window.flutter_inappwebview.callHandler('getLocale');
                    if (locale && locale.success) {
                        setCurrentLocale(locale);
                        try {
                            addToLog('Locale', `${locale.languageCode}-${locale.countryCode || ''}`);
                        } catch (e) {
                            /* ignore */
                        }
                    }
                }
            }
        } catch (err) {
            console.log('Not running in native app or bridge not ready:', err);
            try {
                addToLog('Native Bridge', `Bridge not available or error: ${err?.message || String(err)}`);
            } catch (e) {
                /* ignore */
            }
        }
    };

    // Listen for foreground messages from web FCM
    useEffect(() => {
        let unsub;
        (async () => {
            try {
                unsub = await onForegroundMessage((payload) => {
                    // Only show notification if user is logged in
                    if (!isLoggedIn) {
                        addToLog('Web FCM Ignored', 'User logged out - notification ignored');
                        return;
                    }

                    const title = payload?.notification?.title || 'Notification';
                    const body = payload?.notification?.body || '';
                    setToast({ title, body, source: 'web_fcm' });
                    addToLog('Foreground message (Web FCM)', title);
                });
            } catch (err) {
                console.warn('Foreground messaging not supported or failed to init:', err);
            }
        })();
        return () => {
            if (typeof unsub === 'function') {
                unsub();
            }
        };
    }, [isLoggedIn]);

    // Listen for native bridge events
    useEffect(() => {
        if (!isNativeApp) return;

        const listeners = [];

        // 1. FCM Token updated from native
        const handleFcmTokenUpdated = (event) => {
            const { success, token, ts, source } = event.detail;
            console.log('FCM Token Updated from native:', event.detail);
            if (success && token) {
                setToken(token);
                setToast({
                    title: 'FCM Token Updated',
                    body: `Token received from ${source} at ${new Date(ts).toLocaleTimeString()}`,
                    source: 'native'
                });
                addToLog('FCM token updated', `Source: ${source}`);
            }
        };

        // 2. Locale changed from native
        const handleLocaleChanged = (event) => {
            const { languageCode } = event.detail;
            console.log('Locale changed from native:', event.detail);
            setCurrentLocale({ languageCode });
            setToast({
                title: 'Language Changed',
                body: `App language changed to ${languageCode}`,
                source: 'native'
            });
            addToLog('Locale changed', languageCode);
        };

        // 3. Network status changed from native
        const handleNetworkStatusChanged = (event) => {
            const { isOnline } = event.detail;
            console.log('Network status changed:', event.detail);
            setNetworkStatus(isOnline);
            setToast({
                title: isOnline ? 'Back Online' : 'You Are Offline',
                body: isOnline ? 'Internet connection restored' : 'No internet connection',
                source: 'native'
            });
            addToLog('Network status', isOnline ? 'Online' : 'Offline');
        };

        // 4. Push notification received from native
        const handlePushNotificationReceived = (event) => {
            const notification = event.detail;
            console.log('Push notification from native:', notification);
            const { title, body, data, sentTime, receivedTime, messageId } = notification;

            // Log data payload for debugging (structured + event log)
            console.log('Push notification payload (native) data:', data);
            if (data && typeof data === 'object') {
                try {
                    console.log('Push payload keys:', Object.keys(data));
                    addToLog('Push data (Native)', JSON.stringify(data));
                } catch (e) {
                    console.warn('Failed to stringify push data', e);
                    addToLog('Push data (Native)', 'Unable to stringify data');
                }
            } else if (data) {
                addToLog('Push data (Native)', String(data));
            } else {
                addToLog('Push data (Native)', 'no data');
            }

            setToast({
                title: title || 'Native Notification',
                body: body || 'Received from native app',
                source: 'native_push'
            });

            // Calculate latency
            let latency = null;
            if (sentTime && receivedTime) {
                latency = new Date(receivedTime) - new Date(sentTime);
            }

            addToLog(
                'Push notification (Native)',
                `${title || 'No title'}${messageId ? ` [${messageId}]` : ''} ${latency ? `(${latency}ms)` : ''}`
            );

            // Handle deep link
            if (data && data.deep_link) {
                setTimeout(() => {
                    if (confirm(`Navigate to: ${data.deep_link}?`)) {
                        window.location.href = data.deep_link;
                    }
                }, 1000);
            }
        };

        // Register all listeners
        listeners.push({
            event: 'fcmTokenUpdated',
            handler: handleFcmTokenUpdated
        });
        window.addEventListener('fcmTokenUpdated', handleFcmTokenUpdated);

        listeners.push({
            event: 'localeChanged',
            handler: handleLocaleChanged
        });
        window.addEventListener('localeChanged', handleLocaleChanged);

        listeners.push({
            event: 'networkStatusChanged',
            handler: handleNetworkStatusChanged
        });
        window.addEventListener('networkStatusChanged', handleNetworkStatusChanged);

        listeners.push({
            event: 'pushNotificationReceived',
            handler: handlePushNotificationReceived
        });
        window.addEventListener('pushNotificationReceived', handlePushNotificationReceived);

        // Cleanup function
        return () => {
            listeners.forEach(({ event, handler }) => {
                window.removeEventListener(event, handler);
            });
        };
    }, [isNativeApp]);

    // Auto-dismiss toast after some seconds
    useEffect(() => {
        if (!toast) return;
        const id = setTimeout(() => setToast(null), 5000);
        return () => clearTimeout(id);
    }, [toast]);

    // Track which logs are expanded to show details (by id)
    const [expandedLogIds, setExpandedLogIds] = useState({});

    const toggleLogExpanded = (id) => {
        setExpandedLogIds(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const addToLog = (type, message) => {
        const timestamp = new Date().toLocaleTimeString();
        const id = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
        setNotificationLog(prev => [
            { id, type, message, timestamp },
            ...prev
        ].slice(0, 20)); // Keep last 20 logs
    };

    const handleEnable = async () => {
        try {
            const t = await requestNotificationPermissionAndToken();
            setToken(t);
            setIsLoggedIn(true);
            addToLog('Web FCM', 'Token obtained');
        } catch (e) {
            setError(e?.message || String(e));
            addToLog('Web FCM Error', e?.message || String(e));
        }
    };

    const handleGetNativeToken = async () => {
        if (!window.flutter_inappwebview) return;
        try {
            const response = await window.flutter_inappwebview.callHandler('getFCMToken');
            if (response && response.success) {
                setToken(response.token);
                addToLog('Native FCM', 'Token obtained from native app');
            } else {
                setError(response?.error || 'Failed to get token');
                addToLog('Native FCM Error', response?.error || 'Failed');
            }
        } catch (e) {
            setError(e?.message || String(e));
            addToLog('Native FCM Error', e?.message || String(e));
        }
    };

    const handleChangeLocale = async (lang) => {
        if (!window.flutter_inappwebview) return;
        try {
            const response = await window.flutter_inappwebview.callHandler('changeLocale', lang);
            if (response && response.success) {
                addToLog('Change Locale', `Changed to ${lang}`);
            } else {
                setError(response?.error || 'Failed to change locale');
                addToLog('Change Locale Error', response?.error || 'Failed');
            }
        } catch (e) {
            setError(e?.message || String(e));
            addToLog('Change Locale Error', e?.message || String(e));
        }
    };

    const handleLogout = async () => {
        if (!window.flutter_inappwebview) return;

        if (!confirm('Are you sure you want to logout? This will delete the FCM token.')) {
            return;
        }

        try {
            const response = await window.flutter_inappwebview.callHandler('logout');
            setLogoutResult(response);

            if (response && response.success) {
                setToken(null);
                setIsLoggedIn(false);
                setToast({
                    title: 'Logout Successful',
                    body: 'FCM token deleted. You can log in again to receive notifications.',
                    source: 'native'
                });
                addToLog('Logout', 'FCM token deleted');
            } else {
                setError(response?.error || 'Failed to logout');
                addToLog('Logout Error', response?.error || 'Failed');
            }
        } catch (e) {
            setError(e?.message || String(e));
            addToLog('Logout Error', e?.message || String(e));
        }
    };

    const handleLog = async (message, level = 'debug') => {
        if (!window.flutter_inappwebview) return;
        try {
            await window.flutter_inappwebview.callHandler('log', message, level);
            addToLog('Sent Log', `[${level.toUpperCase()}] ${message}`);
        } catch (e) {
            console.error('Failed to send log:', e);
        }
    };

    const handleWebLogout = () => {
        if (!confirm('Are you sure you want to logout? This will clear the FCM token and stop receiving notifications.')) {
            return;
        }

        try {
            // Clear web FCM token
            setToken(null);
            setIsLoggedIn(false);

            setToast({
                title: 'Logout Successful',
                body: 'FCM token cleared. Notifications are now disabled. Click "Get Web FCM Token" to enable again.',
                source: 'web_fcm'
            });
            addToLog('Web Logout', 'FCM token cleared - notifications disabled');

        } catch (e) {
            setError(e?.message || String(e));
            addToLog('Web Logout Error', e?.message || String(e));
        }
    };

    const handleSimulateNotification = () => {
        if (isNativeApp) {
            // Simulate receiving a notification from native
            window.dispatchEvent(new CustomEvent('pushNotificationReceived', {
                detail: {
                    messageId: 'sim-' + Date.now(),
                    title: 'Test Notification',
                    body: 'This is a simulated notification from native app',
                    data: {
                        type: 'test',
                        deep_link: '/test-page'
                    },
                    sentTime: new Date().toISOString(),
                    receivedTime: new Date().toISOString()
                }
            }));
            addToLog('Simulated Notification', 'Test notification sent');
        } else {
            // Simulate web FCM notification
            setToast({
                title: 'Test Notification',
                body: 'This is a simulated web notification',
                source: 'web_fcm'
            });
            addToLog('Simulated Notification', 'Web notification');
        }
    };

    return (
        <main style={{ padding: 16, fontFamily: 'system-ui', maxWidth: 800, margin: '0 auto' }}>
            <h1>Firebase Cloud Messaging & Native Bridge Demo</h1>

            {/* App Status */}
            <div style={{
                padding: 12,
                background: isNativeApp ? '#e3f2fd' : '#fff3e0',
                borderRadius: 8,
                marginBottom: 16,
                border: `1px solid ${isNativeApp ? '#2196f3' : '#ff9800'}`
            }}>
                <strong>Environment: {isNativeApp ? '📱 Native App' : '🌐 Web Browser'}</strong>
                {appInfo && (
                    <div style={{ fontSize: 14, marginTop: 8 }}>
                        <div>App: {appInfo.appName} v{appInfo.version}</div>
                        <div>Platform: {appInfo.platform}</div>
                    </div>
                )}
            </div>

            {/* Network Status */}
            {isNativeApp && networkStatus !== null && (
                <div style={{
                    padding: 8,
                    background: networkStatus ? '#e8f5e9' : '#ffebee',
                    borderRadius: 4,
                    marginBottom: 16,
                    color: networkStatus ? '#2e7d32' : '#c62828'
                }}>
                    📡 Network: {networkStatus ? 'Online' : 'Offline'}
                </div>
            )}

            {/* FCM Token Section */}
            <section style={{ marginBottom: 24 }}>
                <h2>FCM Token</h2>
                <p>Get FCM token to enable push notifications.</p>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                    {!isNativeApp && (
                        <button onClick={handleEnable} style={{ padding: '8px 16px' }}>
                            Get Web FCM Token
                        </button>
                    )}
                    {isNativeApp && (
                        <button onClick={handleGetNativeToken} style={{ padding: '8px 16px' }}>
                            Get Native FCM Token
                        </button>
                    )}
                </div>

                {token && (
                    <div style={{ marginTop: 16 }}>
                        <h3>FCM Registration Token</h3>
                        <textarea
                            value={token}
                            readOnly
                            rows={3}
                            style={{ width: '100%', fontFamily: 'monospace', fontSize: 12, padding: 8 }}
                        />
                        <button
                            onClick={() => { navigator.clipboard.writeText(token); addToLog('Copied', 'Token copied to clipboard'); }}
                            style={{ marginTop: 8, padding: '6px 12px' }}
                        >
                            Copy Token
                        </button>
                    </div>
                )}
            </section>

            {/* Native Bridge Actions */}
            {isNativeApp && (
                <section style={{ marginBottom: 24 }}>
                    <h2>Native Bridge Actions</h2>

                    {/* Change Locale */}
                    <div style={{ marginBottom: 16 }}>
                        <h3>Change Language</h3>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => handleChangeLocale('en')} style={{ padding: '8px 16px' }}>
                                English
                            </button>
                            <button onClick={() => handleChangeLocale('vi')} style={{ padding: '8px 16px' }}>
                                Tiếng Việt
                            </button>
                        </div>
                        {currentLocale && (
                            <p style={{ marginTop: 8, fontSize: 14 }}>
                                Current: {currentLocale.languageCode}-{currentLocale.countryCode}
                            </p>
                        )}
                    </div>

                    {/* Logout */}
                    <div style={{ marginBottom: 16 }}>
                        <h3>Logout</h3>
                        <button
                            onClick={handleLogout}
                            style={{
                                padding: '8px 16px',
                                background: '#d32f2f',
                                color: 'white',
                                border: 'none',
                                borderRadius: 4,
                                cursor: 'pointer'
                            }}
                        >
                            Logout (Delete FCM Token)
                        </button>
                        {logoutResult && (
                            <p style={{ marginTop: 8, fontSize: 14, color: logoutResult.success ? 'green' : 'red' }}>
                                {logoutResult.success ? '✅ Logout successful' : `❌ ${logoutResult.error}`}
                            </p>
                        )}
                    </div>

                    {/* Send Log */}
                    <div style={{ marginBottom: 16 }}>
                        <h3>Send Log to Native</h3>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <button onClick={() => handleLog('This is a debug message', 'debug')} style={{ padding: '8px 12px' }}>
                                Debug
                            </button>
                            <button onClick={() => handleLog('This is a warning message', 'warning')} style={{ padding: '8px 12px' }}>
                                Warning
                            </button>
                            <button onClick={() => handleLog('This is an error message', 'error')} style={{ padding: '8px 12px' }}>
                                Error
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {/* Test Actions */}
            <section style={{ marginBottom: 24 }}>
                <h2>Test Actions</h2>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                        onClick={handleSimulateNotification}
                        style={{ padding: '8px 16px' }}
                    >
                        Simulate Notification ({isNativeApp ? 'from Native' : 'Web'})
                    </button>

                    {/* Web-only Logout */}
                    {!isNativeApp && (
                        <button
                            onClick={handleWebLogout}
                            style={{
                                padding: '8px 16px',
                                background: '#d32f2f',
                                color: 'white',
                                border: 'none',
                                borderRadius: 4,
                                cursor: 'pointer'
                            }}
                        >
                            Web Logout
                        </button>
                    )}
                </div>
            </section>

            {/* Event Log */}
            <section style={{ marginBottom: 24 }}>
                <h2>Event Log</h2>
                <button
                    onClick={() => setNotificationLog([])}
                    style={{ padding: '4px 8px', fontSize: 12, marginBottom: 8 }}
                >
                    Clear Log
                </button>
                <div style={{
                    background: '#f5f5f5',
                    padding: 12,
                    borderRadius: 4,
                    maxHeight: 300,
                    overflow: 'auto',
                    fontFamily: 'monospace',
                    fontSize: 12
                }}>
                    {notificationLog.length === 0 ? (
                        <p style={{ color: '#666', fontStyle: 'italic' }}>No events yet...</p>
                    ) : (
                        notificationLog.map((log, idx) => {
                            // Try to parse message as JSON for nicer display
                            let parsed = null;
                            try {
                                if (typeof log.message === 'string') {
                                    parsed = JSON.parse(log.message);
                                }
                            } catch (e) {
                                parsed = null;
                            }

                            const isExpanded = !!(log.id && expandedLogIds[log.id]);

                            return (
                                <div key={log.id || idx} style={{ marginBottom: 8, borderBottom: '1px solid #e0e0e0', paddingBottom: 6 }}>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <span style={{ color: '#666', minWidth: 90 }}>[{log.timestamp}]</span>
                                        <span style={{ fontWeight: 'bold' }}>{log.type}:</span>
                                        <div style={{ marginLeft: 8, flex: 1 }}>
                                            {!parsed ? (
                                                <div style={{ whiteSpace: 'pre-wrap' }}>{log.message}</div>
                                            ) : (
                                                <div>
                                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                                        <div style={{ color: '#666', fontSize: 12 }}>{Object.keys(parsed).length} keys</div>
                                                        <button onClick={() => toggleLogExpanded(log.id)} style={{ padding: '2px 8px', fontSize: 12 }}>
                                                            {isExpanded ? 'Hide details' : 'Show details'}
                                                        </button>
                                                    </div>
                                                    {isExpanded && (
                                                        <pre style={{ background: '#fff', padding: 8, borderRadius: 6, marginTop: 6, whiteSpace: 'pre-wrap', overflowX: 'auto' }}>
                                                            {JSON.stringify(parsed, null, 2)}
                                                        </pre>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </section>

            {/* Error Display */}
            {error && (
                <p style={{ color: 'red', marginTop: 16, padding: 12, background: '#ffebee', borderRadius: 4 }}>
                    <strong>Error:</strong> {error}
                </p>
            )}

            {/* Toast UI */}
            {toast && (
                <div
                    style={{
                        position: 'fixed',
                        left: '50%',
                        bottom: 16,
                        transform: 'translateX(-50%)',
                        background: toast.source === 'native_push' ? '#e3f2fd' :
                            toast.source === 'native' ? '#fff3e0' : '#fff',
                        color: '#111',
                        border: toast.source === 'native_push' ? '1px solid #2196f3' :
                            toast.source === 'native' ? '1px solid #ff9800' : '1px solid #ddd',
                        borderRadius: 8,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                        padding: '12px 16px',
                        maxWidth: 420,
                        width: 'calc(100% - 32px)',
                        zIndex: 9999,
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {toast.title}
                            </div>
                            <div style={{ opacity: 0.9, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                {toast.body}
                            </div>
                            {toast.source && (
                                <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
                                    Source: {toast.source}
                                </div>
                            )}
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
                                flexShrink: 0
                            }}
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {/* Instructions */}
            <section style={{ marginTop: 32, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
                <h3>📖 How to Test</h3>
                <ol style={{ lineHeight: 1.8 }}>
                    <li><strong>Web Browser:</strong> Click "Get Web FCM Token" to get a web FCM token</li>
                    <li><strong>Native App:</strong> Click "Get Native FCM Token" to get the native FCM token</li>
                    <li><strong>Change Language:</strong> Use the language buttons to test locale changes</li>
                    <li><strong>Logout:</strong>
                        <ul>
                            <li><strong>Web:</strong> Click "Web Logout" in Test Actions to clear the web FCM token</li>
                            <li><strong>Native:</strong> Click "Logout (Delete FCM Token)" in Native Bridge Actions</li>
                        </ul>
                    </li>
                    <li><strong>Simulate Notification:</strong> Click to test notification display</li>
                    <li><strong>Event Log:</strong> All events are logged below for debugging</li>
                </ol>
                <h4 style={{ marginTop: 16 }}>Testing Push Notifications</h4>
                <ul style={{ lineHeight: 1.8 }}>
                    <li>Use Firebase Console to send test notifications with the FCM token</li>
                    <li>Include custom data in notification payload to test deep link handling</li>
                    <li>Watch the event log to see when notifications are received</li>
                </ul>
            </section>
        </main>
    );
}