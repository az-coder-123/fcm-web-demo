'use client';

import { useEffect, useState } from 'react';
import {
    initFirebaseApp,
    onForegroundMessage,
    requestNotificationPermissionAndToken,
} from '../lib/fcm';

// Components
import AppStatus from '../components/AppStatus';
import ErrorDisplay from '../components/ErrorDisplay';
import EventLog from '../components/EventLog';
import FcmTokenSection from '../components/FcmTokenSection';
import Instructions from '../components/Instructions';
import NativeBridgeActions from '../components/NativeBridgeActions';
import NetworkStatus from '../components/NetworkStatus';
import TestActions from '../components/TestActions';
import Toast from '../components/Toast';

export default function Home() {
    const [token, setToken] = useState(null);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);

    // Native bridge state
    const [isNativeApp, setIsNativeApp] = useState(false);
    const [appInfo, setAppInfo] = useState(null);
    const [currentLocale, setCurrentLocale] = useState(null);
    const [networkStatus, setNetworkStatus] = useState(null);
    const [notificationLog, setNotificationLog] = useState([]);
    const [logoutResult, setLogoutResult] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(true);

    useEffect(() => {
        // Detect mobile app webview via query parameter ?versioninfo=mobileapp
        const isMobileAppParam = (typeof window !== 'undefined') && new URLSearchParams(window.location.search).get('versioninfo') === 'mobileapp';
        if (isMobileAppParam) {
            console.log('versioninfo=mobileapp detected: skipping Firebase initialization and Service Worker registration.');
            setIsNativeApp(true);
            setAppInfo({ appName: 'Mobile Webview', version: 'unknown', platform: 'mobile-webview' });
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

                        const config = (typeof window !== 'undefined' && window.__FIREBASE_CONFIG__) ? window.__FIREBASE_CONFIG__ : {};

                        navigator.serviceWorker.ready
                            .then((reg) => {
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

        checkNativeBridge();
    }, []);

    const checkNativeBridge = async () => {
        try {
            if (window.flutter_inappwebview) {
                const info = await window.flutter_inappwebview.callHandler('getAppInfo');
                if (info && info.success) {
                    setIsNativeApp(true);
                    setAppInfo(info);
                    console.log('Running in native app:', info);

                    try {
                        addToLog('Native Bridge', `Detected native bridge: ${info.appName || 'unknown'} v${info.version || 'unknown'} (${info.platform || 'unknown'})`);
                        addToLog('App Info', JSON.stringify(info));
                    } catch (e) {
                        console.warn('addToLog not available yet', e);
                    }

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

    useEffect(() => {
        let unsub;
        (async () => {
            try {
                unsub = await onForegroundMessage((payload) => {
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

    useEffect(() => {
        if (!isNativeApp) return;

        const listeners = [];

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

        const handlePushNotificationReceived = (event) => {
            const notification = event.detail;
            console.log('Push notification from native:', notification);
            const { title, body, data, sentTime, receivedTime, messageId } = notification;

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

            let latency = null;
            if (sentTime && receivedTime) {
                latency = new Date(receivedTime) - new Date(sentTime);
            }

            addToLog(
                'Push notification (Native)',
                `${title || 'No title'}${messageId ? ` [${messageId}]` : ''} ${latency ? `(${latency}ms)` : ''}`
            );

            if (data && data.deep_link) {
                setTimeout(() => {
                    if (confirm(`Navigate to: ${data.deep_link}?`)) {
                        window.location.href = data.deep_link;
                    }
                }, 1000);
            }
        };

        listeners.push({ event: 'fcmTokenUpdated', handler: handleFcmTokenUpdated });
        window.addEventListener('fcmTokenUpdated', handleFcmTokenUpdated);

        listeners.push({ event: 'localeChanged', handler: handleLocaleChanged });
        window.addEventListener('localeChanged', handleLocaleChanged);

        listeners.push({ event: 'networkStatusChanged', handler: handleNetworkStatusChanged });
        window.addEventListener('networkStatusChanged', handleNetworkStatusChanged);

        listeners.push({ event: 'pushNotificationReceived', handler: handlePushNotificationReceived });
        window.addEventListener('pushNotificationReceived', handlePushNotificationReceived);

        return () => {
            listeners.forEach(({ event, handler }) => {
                window.removeEventListener(event, handler);
            });
        };
    }, [isNativeApp]);

    const addToLog = (type, message) => {
        const timestamp = new Date().toLocaleTimeString();
        const id = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
        setNotificationLog(prev => [
            { id, type, message, timestamp },
            ...prev
        ].slice(0, 20));
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

            <AppStatus isNativeApp={isNativeApp} appInfo={appInfo} />
            <NetworkStatus networkStatus={networkStatus} />

            <FcmTokenSection 
                isNativeApp={isNativeApp}
                token={token}
                onEnable={handleEnable}
                onGetNativeToken={handleGetNativeToken}
                onCopyToken={() => { 
                    navigator.clipboard.writeText(token); 
                    addToLog('Copied', 'Token copied to clipboard'); 
                }}
                addToLog={addToLog}
            />

            {isNativeApp && (
                <NativeBridgeActions
                    currentLocale={currentLocale}
                    logoutResult={logoutResult}
                    onChangeLocale={handleChangeLocale}
                    onLogout={handleLogout}
                    onSendLog={handleLog}
                />
            )}

            <TestActions
                isNativeApp={isNativeApp}
                onSimulateNotification={handleSimulateNotification}
                onWebLogout={handleWebLogout}
            />

            <EventLog 
                notificationLog={notificationLog}
                onClearLog={() => setNotificationLog([])}
            />

            <ErrorDisplay error={error} />
            <Toast toast={toast} onClose={() => setToast(null)} />
            <Instructions />
        </main>
    );
}