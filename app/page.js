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
import ExternalUrlActions from '../components/ExternalUrlActions';
import FcmTokenSection from '../components/FcmTokenSection';
import Instructions from '../components/Instructions';
import NativeBridgeActions from '../components/NativeBridgeActions';
import NetworkStatus from '../components/NetworkStatus';
import TestActions from '../components/TestActions';
import Toast from '../components/Toast';
import TokenSubmission from '../components/TokenSubmission';

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
    const [biometricSupport, setBiometricSupport] = useState(null);
    const [biometricPermission, setBiometricPermission] = useState(null);
    const [locationPermission, setLocationPermission] = useState(null);
    const [location, setLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [cameraPermission, setCameraPermission] = useState(null);
    const [cameraError, setCameraError] = useState(null);
    const [microphonePermission, setMicrophonePermission] = useState(null);
    const [microphoneError, setMicrophoneError] = useState(null);
    const [photoPermission, setPhotoPermission] = useState(null);
    const [photoError, setPhotoError] = useState(null);
    const [trackingPermission, setTrackingPermission] = useState(null);
    const [trackingError, setTrackingError] = useState(null);
    const [notificationPermission, setNotificationPermission] = useState(null);
    const [notificationError, setNotificationError] = useState(null);
    const [contactPermission, setContactPermission] = useState(null);
    const [contactError, setContactError] = useState(null);
    const [refreshTokenOwnerKey, setRefreshTokenOwnerKey] = useState(null);
    const [refreshToken, setRefreshToken] = useState(null);
    const [biometricAuthResult, setBiometricAuthResult] = useState(null);
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
        if (window.flutter_inappwebview) {
            setIsNativeApp(true);
        }

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
                } else {
                    // still considered native webview when flutter_inappwebview exists
                    setIsNativeApp(true);
                }
            }
        } catch (err) {
            console.log('Not running in native app or bridge not ready:', err);
            if (window.flutter_inappwebview) {
                setIsNativeApp(true);
            }
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
            const { languageCode, countryCode } = event.detail;
            console.log('Locale changed from native:', event.detail);
            setCurrentLocale({ languageCode, countryCode });
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

        const handleBiometricAuthenticated = (event) => {
            const detail = event.detail;
            console.log('Biometric authenticated event:', detail);
            setBiometricAuthResult(detail);
            if (detail?.key) {
                setRefreshTokenOwnerKey(detail.key);
            }
            if (detail?.refreshToken) {
                setRefreshToken(detail.refreshToken);
            }
            addToLog('Biometric Authenticated', JSON.stringify(detail));
        };

        const handleBiometricAuthenticationFailed = (event) => {
            const detail = event.detail;
            console.log('Biometric authentication failed event:', detail);
            setBiometricAuthResult(detail);
            addToLog('Biometric Authentication Failed', JSON.stringify(detail));
        };

        listeners.push({ event: 'fcmTokenUpdated', handler: handleFcmTokenUpdated });
        window.addEventListener('fcmTokenUpdated', handleFcmTokenUpdated);

        listeners.push({ event: 'localeChanged', handler: handleLocaleChanged });
        window.addEventListener('localeChanged', handleLocaleChanged);

        listeners.push({ event: 'networkStatusChanged', handler: handleNetworkStatusChanged });
        window.addEventListener('networkStatusChanged', handleNetworkStatusChanged);

        listeners.push({ event: 'pushNotificationReceived', handler: handlePushNotificationReceived });
        window.addEventListener('pushNotificationReceived', handlePushNotificationReceived);

        listeners.push({ event: 'biometricAuthenticated', handler: handleBiometricAuthenticated });
        window.addEventListener('biometricAuthenticated', handleBiometricAuthenticated);

        listeners.push({ event: 'biometricAuthenticationFailed', handler: handleBiometricAuthenticationFailed });
        window.addEventListener('biometricAuthenticationFailed', handleBiometricAuthenticationFailed);

        return () => {
            listeners.forEach(({ event, handler }) => {
                window.removeEventListener(event, handler);
            });
        };
    }, [isNativeApp]);

    const addToLog = (type, message) => {
        const timestamp = new Date().toLocaleTimeString();
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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

    const handleGetBiometricSupport = async () => {
        if (!window.flutter_inappwebview) return;
        try {
            const response = await window.flutter_inappwebview.callHandler('getBiometricSupport');
            setBiometricSupport(response);
            if (response && response.success) {
                addToLog('Biometric Support', JSON.stringify(response));
            } else {
                setError(response?.error || 'Failed to get biometric support');
                addToLog('Biometric Support Error', response?.error || 'Failed');
            }
        } catch (e) {
            setError(e?.message || String(e));
            addToLog('Biometric Support Error', e?.message || String(e));
        }
    };

    const handleGetBiometricPermissionStatus = async () => {
        if (!window.flutter_inappwebview) return;
        try {
            const response = await window.flutter_inappwebview.callHandler('getBiometricPermissionStatus');
            setBiometricPermission(response);
            if (response && response.success) {
                addToLog('Biometric Permission', JSON.stringify(response));
            } else {
                setError(response?.error || 'Failed to get biometric permission status');
                addToLog('Biometric Permission Error', response?.error || 'Failed');
            }
        } catch (e) {
            setError(e?.message || String(e));
            addToLog('Biometric Permission Error', e?.message || String(e));
        }
    };

    const handleRequestBiometricPermission = async (reason) => {
        if (!window.flutter_inappwebview) return;
        try {
            const response = await window.flutter_inappwebview.callHandler('requestBiometricPermission', reason);
            setBiometricPermission(response);
            if (response && response.success) {
                addToLog('Request Biometric Permission', JSON.stringify(response));
            } else {
                setError(response?.error || 'Failed to request biometric permission');
                addToLog('Request Biometric Permission Error', response?.error || 'Failed');
            }
        } catch (e) {
            setError(e?.message || String(e));
            addToLog('Request Biometric Permission Error', e?.message || String(e));
        }
    };

    const handleBiometricAuthenticate = async (keyValue, reason) => {
        if (!window.flutter_inappwebview) return;
        try {
            const key = (keyValue || '').trim();
            if (!key) {
                setError('Key is required');
                addToLog('Biometric Authenticate Error', 'Key is required');
                return;
            }

            const response = await window.flutter_inappwebview.callHandler('biometricAuthenticate', key, reason);
            setBiometricAuthResult(response);
            if (response && response.success) {
                addToLog('Biometric Authenticate', JSON.stringify(response));
                setRefreshTokenOwnerKey(response.key || key);
                if (response.refreshToken) {
                    setRefreshToken(response.refreshToken);
                }
            } else {
                setError(response?.error || 'Biometric authentication failed');
                addToLog('Biometric Authenticate Error', response?.error || 'Failed');
            }
        } catch (e) {
            setError(e?.message || String(e));
            addToLog('Biometric Authenticate Error', e?.message || String(e));
        }
    };

    const handleSaveRefreshToken = async (keyValue, tokenValue) => {
        if (!window.flutter_inappwebview) return;
        try {
            const key = (keyValue || '').trim();
            const token = (tokenValue || '').trim();
            if (!key || !token) {
                setError('Key and refresh token are required');
                addToLog('Save Refresh Token Error', 'Key and refresh token are required');
                return;
            }

            const response = await window.flutter_inappwebview.callHandler('saveRefreshToken', key, token);
            if (response && response.success) {
                setRefreshTokenOwnerKey(key);
                setRefreshToken(token);
                addToLog('Save Refresh Token', `Saved key=${key} refresh token to native`);
            } else {
                setError(response?.error || 'Failed to save refresh token');
                addToLog('Save Refresh Token Error', response?.error || 'Failed');
            }
        } catch (e) {
            setError(e?.message || String(e));
            addToLog('Save Refresh Token Error', e?.message || String(e));
        }
    };

    const handleGetRefreshToken = async (keyValue) => {
        if (!window.flutter_inappwebview) return;
        try {
            const key = (keyValue || '').trim();
            if (!key) {
                setError('Key is required');
                addToLog('Get Refresh Token Error', 'Key is required');
                return;
            }

            const response = await window.flutter_inappwebview.callHandler('getRefreshToken', key);
            if (response && response.success) {
                setRefreshTokenOwnerKey(response.storedKey || key);
                setRefreshToken(response.refreshToken || null);
                addToLog('Get Refresh Token', JSON.stringify(response));
            } else {
                setError(response?.error || 'Failed to get refresh token');
                addToLog('Get Refresh Token Error', response?.error || 'Failed');
            }
        } catch (e) {
            setError(e?.message || String(e));
            addToLog('Get Refresh Token Error', e?.message || String(e));
        }
    };

    const handleGetLocationPermissionStatus = async () => {
        if (!window.flutter_inappwebview) return;
        try {
            const response = await window.flutter_inappwebview.callHandler('getLocationPermissionStatus');
            setLocationPermission(response);
            setLocationError(null);
            addToLog('Location Permission Status', JSON.stringify(response));
        } catch (e) {
            setLocationError(e?.message || String(e));
            addToLog('Location Permission Status Error', e?.message || String(e));
        }
    };

    const handleRequestLocationPermission = async () => {
        if (!window.flutter_inappwebview) return;
        try {
            const response = await window.flutter_inappwebview.callHandler('requestLocationPermission');
            setLocationPermission(response);
            setLocationError(null);
            addToLog('Request Location Permission', JSON.stringify(response));
        } catch (e) {
            setLocationError(e?.message || String(e));
            addToLog('Request Location Permission Error', e?.message || String(e));
        }
    };

    const handleGetLocation = async () => {
        if (!window.flutter_inappwebview) return;
        try {
            const response = await window.flutter_inappwebview.callHandler('getLocation');
            if (response && response.success) {
                setLocation(response);
                setLocationError(null);
                addToLog('Get Location', JSON.stringify(response));
            } else {
                setLocation(null);
                setLocationError(response?.error || 'Failed to get location');
                addToLog('Get Location Error', response?.error || 'Failed');
            }
        } catch (e) {
            setLocation(null);
            setLocationError(e?.message || String(e));
            addToLog('Get Location Exception', e?.message || String(e));
        }
    };

    const handleGetCameraPermissionStatus = async () => {
        if (!window.flutter_inappwebview) return;
        try {
            const response = await window.flutter_inappwebview.callHandler('getCameraPermissionStatus');
            setCameraPermission(response);
            setCameraError(null);
            addToLog('Camera Permission Status', JSON.stringify(response));
        } catch (e) {
            setCameraError(e?.message || String(e));
            addToLog('Camera Permission Status Error', e?.message || String(e));
        }
    };

    const handleRequestCameraPermission = async () => {
        if (!window.flutter_inappwebview) return;
        try {
            const response = await window.flutter_inappwebview.callHandler('requestCameraPermission');
            setCameraPermission(response);
            setCameraError(null);
            addToLog('Request Camera Permission', JSON.stringify(response));
        } catch (e) {
            setCameraError(e?.message || String(e));
            addToLog('Request Camera Permission Error', e?.message || String(e));
        }
    };

    const handleGetMicrophonePermissionStatus = async () => {
        if (!window.flutter_inappwebview) return;
        try {
            const response = await window.flutter_inappwebview.callHandler('getMicrophonePermissionStatus');
            setMicrophonePermission(response);
            setMicrophoneError(null);
            addToLog('Microphone Permission Status', JSON.stringify(response));
        } catch (e) {
            setMicrophoneError(e?.message || String(e));
            addToLog('Microphone Permission Status Error', e?.message || String(e));
        }
    };

    const handleRequestMicrophonePermission = async () => {
        if (!window.flutter_inappwebview) return;
        try {
            const response = await window.flutter_inappwebview.callHandler('requestMicrophonePermission');
            setMicrophonePermission(response);
            setMicrophoneError(null);
            addToLog('Request Microphone Permission', JSON.stringify(response));
        } catch (e) {
            setMicrophoneError(e?.message || String(e));
            addToLog('Request Microphone Permission Error', e?.message || String(e));
        }
    };

    const handleGetPhotoPermissionStatus = async () => {
        if (!window.flutter_inappwebview) return;
        try {
            const response = await window.flutter_inappwebview.callHandler('getPhotoPermissionStatus');
            setPhotoPermission(response);
            setPhotoError(null);
            addToLog('Photo Permission Status', JSON.stringify(response));
        } catch (e) {
            setPhotoError(e?.message || String(e));
            addToLog('Photo Permission Status Error', e?.message || String(e));
        }
    };

    const handleRequestPhotoPermission = async () => {
        if (!window.flutter_inappwebview) return;
        try {
            const response = await window.flutter_inappwebview.callHandler('requestPhotoPermission');
            setPhotoPermission(response);
            setPhotoError(null);
            addToLog('Request Photo Permission', JSON.stringify(response));
        } catch (e) {
            setPhotoError(e?.message || String(e));
            addToLog('Request Photo Permission Error', e?.message || String(e));
        }
    };

    const handleGetTrackingPermissionStatus = async () => {
        if (!window.flutter_inappwebview) return;
        try {
            const response = await window.flutter_inappwebview.callHandler('getTrackingPermissionStatus');
            setTrackingPermission(response);
            setTrackingError(null);
            addToLog('Tracking Permission Status', JSON.stringify(response));
        } catch (e) {
            setTrackingError(e?.message || String(e));
            addToLog('Tracking Permission Status Error', e?.message || String(e));
        }
    };

    const handleRequestTrackingPermission = async () => {
        if (!window.flutter_inappwebview) return;
        try {
            const response = await window.flutter_inappwebview.callHandler('requestTrackingPermission');
            setTrackingPermission(response);
            setTrackingError(null);
            addToLog('Request Tracking Permission', JSON.stringify(response));
        } catch (e) {
            setTrackingError(e?.message || String(e));
            addToLog('Request Tracking Permission Error', e?.message || String(e));
        }
    };

    const handleGetNotificationPermissionStatus = async () => {
        if (!window.flutter_inappwebview) return;
        try {
            const response = await window.flutter_inappwebview.callHandler('getNotificationPermissionStatus');
            setNotificationPermission(response);
            setNotificationError(null);
            addToLog('Notification Permission Status', JSON.stringify(response));
        } catch (e) {
            setNotificationError(e?.message || String(e));
            addToLog('Notification Permission Status Error', e?.message || String(e));
        }
    };

    const handleRequestNotificationPermission = async () => {
        if (!window.flutter_inappwebview) return;
        try {
            const response = await window.flutter_inappwebview.callHandler('requestNotificationPermission');
            setNotificationPermission(response);
            setNotificationError(null);
            addToLog('Request Notification Permission', JSON.stringify(response));
        } catch (e) {
            setNotificationError(e?.message || String(e));
            addToLog('Request Notification Permission Error', e?.message || String(e));
        }
    };

    const handleGetContactPermissionStatus = async () => {
        if (!window.flutter_inappwebview) return;
        try {
            const response = await window.flutter_inappwebview.callHandler('getContactPermissionStatus');
            setContactPermission(response);
            setContactError(null);
            addToLog('Contact Permission Status', JSON.stringify(response));
        } catch (e) {
            setContactError(e?.message || String(e));
            addToLog('Contact Permission Status Error', e?.message || String(e));
        }
    };

    const handleRequestContactPermission = async () => {
        if (!window.flutter_inappwebview) return;
        try {
            const response = await window.flutter_inappwebview.callHandler('requestContactPermission');
            setContactPermission(response);
            setContactError(null);
            addToLog('Request Contact Permission', JSON.stringify(response));
        } catch (e) {
            setContactError(e?.message || String(e));
            addToLog('Request Contact Permission Error', e?.message || String(e));
        }
    };

    const handleChangeLocale = async (lang) => {
        if (!window.flutter_inappwebview) return;
        // Optimistically update locale immediately for responsive UI
        const countryCode = lang === 'vi' ? 'VN' : 'US';
        setCurrentLocale({ languageCode: lang, countryCode });
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

            <TokenSubmission
                isNativeApp={isNativeApp}
                token={token}
                addToLog={addToLog}
            />

            <NativeBridgeActions
                currentLocale={currentLocale}
                logoutResult={logoutResult}
                onChangeLocale={handleChangeLocale}
                onLogout={handleLogout}
                onSendLog={handleLog}
                onGetBiometricSupport={handleGetBiometricSupport}
                onGetBiometricPermissionStatus={handleGetBiometricPermissionStatus}
                onRequestBiometricPermission={handleRequestBiometricPermission}
                onGetLocationPermissionStatus={handleGetLocationPermissionStatus}
                onRequestLocationPermission={handleRequestLocationPermission}
                onGetLocation={handleGetLocation}
                onGetCameraPermissionStatus={handleGetCameraPermissionStatus}
                onRequestCameraPermission={handleRequestCameraPermission}
                onGetMicrophonePermissionStatus={handleGetMicrophonePermissionStatus}
                onRequestMicrophonePermission={handleRequestMicrophonePermission}
                onGetPhotoPermissionStatus={handleGetPhotoPermissionStatus}
                onRequestPhotoPermission={handleRequestPhotoPermission}
                onGetTrackingPermissionStatus={handleGetTrackingPermissionStatus}
                onRequestTrackingPermission={handleRequestTrackingPermission}
                onGetNotificationPermissionStatus={handleGetNotificationPermissionStatus}
                onRequestNotificationPermission={handleRequestNotificationPermission}
                onGetContactPermissionStatus={handleGetContactPermissionStatus}
                onRequestContactPermission={handleRequestContactPermission}
                onBiometricAuthenticate={handleBiometricAuthenticate}
                onGetRefreshToken={handleGetRefreshToken}
                onSaveRefreshToken={handleSaveRefreshToken}
                biometricSupport={biometricSupport}
                biometricPermission={biometricPermission}
                locationPermission={locationPermission}
                location={location}
                locationError={locationError}
                cameraPermission={cameraPermission}
                cameraError={cameraError}
                microphonePermission={microphonePermission}
                microphoneError={microphoneError}
                photoPermission={photoPermission}
                photoError={photoError}
                trackingPermission={trackingPermission}
                trackingError={trackingError}
                notificationPermission={notificationPermission}
                notificationError={notificationError}
                contactPermission={contactPermission}
                contactError={contactError}
                refreshTokenOwnerKey={refreshTokenOwnerKey}
                refreshToken={refreshToken}
                biometricAuthResult={biometricAuthResult}
                isNativeApp={isNativeApp}
            />

            <ExternalUrlActions />

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

            <button
                onClick={() => window.location.reload()}
                style={{
                    position: 'fixed',
                    right: 20,
                    bottom: 20,
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    border: 'none',
                    background: '#1e88e5',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                    cursor: 'pointer',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
                title="Reload page"
                aria-label="Reload page"
            >
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M13 3a9 9 0 0 0-8.8 6.9" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    <path d="M5 7V3h4" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    <path d="M11 21a9 9 0 0 0 8.8-6.9" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    <path d="M19 17v4h-4" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
            </button>
        </main>
    );
}