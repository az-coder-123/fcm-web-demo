import { useState } from 'react';

export default function NativeBridgeActions({ 
    currentLocale, 
    logoutResult,
    onChangeLocale,
    onLogout,
    onSendLog,
    onGetBiometricSupport,
    onGetBiometricPermissionStatus,
    onRequestBiometricPermission,
    onBiometricAuthenticate,
    onGetLocationPermissionStatus,
    onRequestLocationPermission,
    onGetLocation,
    onGetCameraPermissionStatus,
    onRequestCameraPermission,
    onGetMicrophonePermissionStatus,
    onRequestMicrophonePermission,
    onGetPhotoPermissionStatus,
    onRequestPhotoPermission,
    onGetTrackingPermissionStatus,
    onRequestTrackingPermission,
    onGetNotificationPermissionStatus,
    onRequestNotificationPermission,
    onGetContactPermissionStatus,
    onRequestContactPermission,
    onGetRefreshToken,
    onSaveRefreshToken,
    biometricSupport,
    biometricPermission,
    locationPermission,
    location,
    locationError,
    cameraPermission,
    cameraError,
    microphonePermission,
    microphoneError,
    photoPermission,
    photoError,
    trackingPermission,
    trackingError,
    notificationPermission,
    notificationError,
    contactPermission,
    contactError,
    refreshTokenOwnerKey,
    refreshToken,
    biometricAuthResult,
    isNativeApp
}) {
    const [keyInput, setKeyInput] = useState('demo@example.com');
    const [tokenInput, setTokenInput] = useState('web-demo-refresh-token');

    return (
        <section style={{ marginBottom: 24 }}>
            <h2>Native Bridge Actions</h2>

            {/* Change Locale */}
            <div style={{ marginBottom: 16 }}>
                <h3>Change Language</h3>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => onChangeLocale('en')} style={{ padding: '8px 16px' }}>
                        English
                    </button>
                    <button onClick={() => onChangeLocale('vi')} style={{ padding: '8px 16px' }}>
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
                    onClick={onLogout}
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
                    <button onClick={() => onSendLog('This is a debug message', 'debug')} style={{ padding: '8px 12px' }}>
                        Debug
                    </button>
                    <button onClick={() => onSendLog('This is a warning message', 'warning')} style={{ padding: '8px 12px' }}>
                        Warning
                    </button>
                    <button onClick={() => onSendLog('This is an error message', 'error')} style={{ padding: '8px 12px' }}>
                        Error
                    </button>
                </div>
            </div>

            {/* Biometric Actions */}
            <div style={{ marginBottom: 16 }}>
                <h3>Biometric Actions</h3>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button onClick={onGetBiometricSupport} style={{ padding: '8px 12px' }}>
                        Get Biometric Support
                    </button>
                    <button onClick={onGetBiometricPermissionStatus} style={{ padding: '8px 12px' }}>
                        Get Biometric Permission
                    </button>
                    <button onClick={() => onRequestBiometricPermission('Please allow biometrics to continue')} style={{ padding: '8px 12px' }}>
                        Request Biometric Permission
                    </button>
                    <button onClick={() => onBiometricAuthenticate(keyInput, 'Authenticate with biometrics')} style={{ padding: '8px 12px' }}>
                        Biometric Authenticate
                    </button>
                    <button onClick={() => onGetRefreshToken(keyInput)} style={{ padding: '8px 12px' }}>
                        Get Refresh Token
                    </button>
                    <button onClick={() => onSaveRefreshToken(keyInput, tokenInput)} style={{ padding: '8px 12px' }}>
                        Save Refresh Token
                    </button>
                </div>

                <div style={{ marginTop: 12, display: 'grid', gap: 8, maxWidth: 520 }}>
                    <input
                        value={keyInput}
                        onChange={(e) => setKeyInput(e.target.value)}
                        placeholder="Key (email or phone)"
                        style={{ padding: '8px 10px' }}
                    />
                    <input
                        value={tokenInput}
                        onChange={(e) => setTokenInput(e.target.value)}
                        placeholder="Refresh token"
                        style={{ padding: '8px 10px' }}
                    />
                </div>
                {typeof biometricSupport === 'object' && (
                    <p style={{ marginTop: 8, fontSize: 14 }}>
                        Biometric support: {JSON.stringify(biometricSupport)}
                    </p>
                )}
                {typeof biometricPermission === 'object' && (
                    <p style={{ marginTop: 8, fontSize: 14 }}>
                        Biometric permission: {JSON.stringify(biometricPermission)}
                    </p>
                )}
                {refreshToken && (
                    <p style={{ marginTop: 8, fontSize: 14 }}>
                        Key: {refreshTokenOwnerKey || '(unknown)'}
                        <br />
                        Refresh token: {refreshToken}
                    </p>
                )}
                {biometricAuthResult && (
                    <p style={{ marginTop: 8, fontSize: 14 }}>
                        Biometric auth status: {JSON.stringify(biometricAuthResult)}
                    </p>
                )}
            </div>

            {/* Location Actions */}
            <div style={{ marginBottom: 16 }}>
                <h3>Location Actions</h3>
                {!isNativeApp && (
                    <p style={{ marginTop: 8, fontSize: 14, color: '#b71c1c' }}>
                        Lưu ý: chức năng location cần chạy trong mobile app WebView. Nếu đang chạy trên trình duyệt thông thường, các nút sẽ không thực hiện được vì không có bridge.
                    </p>
                )}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button onClick={onGetLocationPermissionStatus} style={{ padding: '8px 12px' }}>
                        Get Location Permission Status
                    </button>
                    <button onClick={onRequestLocationPermission} style={{ padding: '8px 12px' }}>
                        Request Location Permission
                    </button>
                    <button
                        onClick={onGetLocation}
                        style={{ padding: '8px 12px' }}
                        disabled={locationPermission && !locationPermission.isGranted}
                    >
                        Get Current Location
                    </button>
                </div>

                {locationPermission && locationPermission.isGranted === false && (
                    <p style={{ marginTop: 8, fontSize: 14, color: 'orange' }}>
                        Location permission chưa được cấp. Hãy yêu cầu quyền từ app (Request Location Permission) hoặc mở lại Settings.
                    </p>
                )}

                {locationPermission && locationPermission.isGranted === true && (
                    <p style={{ marginTop: 8, fontSize: 14, color: 'green' }}>
                        Location permission đã được cấp.
                    </p>
                )}

                {locationPermission && (
                    <p style={{ marginTop: 8, fontSize: 14 }}>
                        Location permission: {JSON.stringify(locationPermission)}
                    </p>
                )}
                {location && location.success && (
                    <p style={{ marginTop: 8, fontSize: 14 }}>
                        Found location: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)} (accuracy: {location.accuracy} m)
                    </p>
                )}
                {locationError && (
                    <p style={{ marginTop: 8, fontSize: 14, color: 'red' }}>
                        Location error: {locationError}
                    </p>
                )}
            </div>

            {/* Camera Permission Actions */}
            <div style={{ marginBottom: 16 }}>
                <h3>Camera Permission Actions</h3>
                {!isNativeApp && (
                    <p style={{ marginTop: 8, fontSize: 14, color: '#b71c1c' }}>
                        Lưu ý: chức năng camera cần chạy trong mobile app WebView. Nếu đang chạy trên trình duyệt thông thường, các nút sẽ không thực hiện được vì không có bridge.
                    </p>
                )}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button onClick={onGetCameraPermissionStatus} style={{ padding: '8px 12px' }}>
                        Get Camera Permission Status
                    </button>
                    <button onClick={onRequestCameraPermission} style={{ padding: '8px 12px' }}>
                        Request Camera Permission
                    </button>
                </div>

                {cameraPermission && cameraPermission.isGranted === false && (
                    <p style={{ marginTop: 8, fontSize: 14, color: 'orange' }}>
                        Camera permission chưa được cấp. Hãy yêu cầu quyền từ app (Request Camera Permission) hoặc mở lại Settings.
                    </p>
                )}

                {cameraPermission && cameraPermission.isGranted === true && (
                    <p style={{ marginTop: 8, fontSize: 14, color: 'green' }}>
                        Camera permission đã được cấp.
                    </p>
                )}

                {cameraPermission && (
                    <p style={{ marginTop: 8, fontSize: 14 }}>
                        Camera permission: {JSON.stringify(cameraPermission)}
                    </p>
                )}
                {cameraError && (
                    <p style={{ marginTop: 8, fontSize: 14, color: 'red' }}>
                        Camera error: {cameraError}
                    </p>
                )}
            </div>

            {/* Microphone Permission Actions */}
            <div style={{ marginBottom: 16 }}>
                <h3>Microphone Permission Actions</h3>
                {!isNativeApp && (
                    <p style={{ marginTop: 8, fontSize: 14, color: '#b71c1c' }}>
                        Lưu ý: chức năng microphone cần chạy trong mobile app WebView. Nếu đang chạy trên trình duyệt thông thường, các nút sẽ không thực hiện được vì không có bridge.
                    </p>
                )}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button onClick={onGetMicrophonePermissionStatus} style={{ padding: '8px 12px' }}>
                        Get Microphone Permission Status
                    </button>
                    <button onClick={onRequestMicrophonePermission} style={{ padding: '8px 12px' }}>
                        Request Microphone Permission
                    </button>
                </div>

                {microphonePermission && microphonePermission.isGranted === false && (
                    <p style={{ marginTop: 8, fontSize: 14, color: 'orange' }}>
                        Microphone permission chưa được cấp. Hãy yêu cầu quyền từ app (Request Microphone Permission) hoặc mở lại Settings.
                    </p>
                )}

                {microphonePermission && microphonePermission.isGranted === true && (
                    <p style={{ marginTop: 8, fontSize: 14, color: 'green' }}>
                        Microphone permission đã được cấp.
                    </p>
                )}

                {microphonePermission && (
                    <p style={{ marginTop: 8, fontSize: 14 }}>
                        Microphone permission: {JSON.stringify(microphonePermission)}
                    </p>
                )}
                {microphoneError && (
                    <p style={{ marginTop: 8, fontSize: 14, color: 'red' }}>
                        Microphone error: {microphoneError}
                    </p>
                )}
            </div>

            {/* Photo Library Permission Actions */}
            <div style={{ marginBottom: 16 }}>
                <h3>Photo Library Permission Actions</h3>
                {!isNativeApp && (
                    <p style={{ marginTop: 8, fontSize: 14, color: '#b71c1c' }}>
                        Lưu ý: chức năng truy cập thư viện ảnh cần chạy trong mobile app WebView. Nếu đang chạy trên trình duyệt thông thường, các nút sẽ không thực hiện được vì không có bridge.
                    </p>
                )}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button onClick={onGetPhotoPermissionStatus} style={{ padding: '8px 12px' }}>
                        Get Photo Permission Status
                    </button>
                    <button onClick={onRequestPhotoPermission} style={{ padding: '8px 12px' }}>
                        Request Photo Permission
                    </button>
                </div>

                {photoPermission && photoPermission.isGranted === false && (
                    <p style={{ marginTop: 8, fontSize: 14, color: 'orange' }}>
                        Photo permission chưa được cấp. Hãy yêu cầu quyền từ app (Request Photo Permission) hoặc mở lại Settings.
                    </p>
                )}

                {photoPermission && photoPermission.isGranted === true && (
                    <p style={{ marginTop: 8, fontSize: 14, color: 'green' }}>
                        Photo permission đã được cấp.
                    </p>
                )}

                {photoPermission && photoPermission.isLimited && (
                    <p style={{ marginTop: 8, fontSize: 14, color: 'orange' }}>
                        Quyền truy cập "Giới hạn" (Limited): người dùng đã chọn một số ảnh cụ thể.
                    </p>
                )}

                {photoPermission && (
                    <p style={{ marginTop: 8, fontSize: 14 }}>
                        Photo permission: {JSON.stringify(photoPermission)}
                    </p>
                )}
                {photoError && (
                    <p style={{ marginTop: 8, fontSize: 14, color: 'red' }}>
                        Photo error: {photoError}
                    </p>
                )}
            </div>

            {/* App Tracking Transparency (iOS) & Advertising ID (Android) Permission Actions */}
            <div style={{ marginBottom: 16 }}>
                <h3>App Tracking Transparency & Advertising ID Permission</h3>
                {!isNativeApp && (
                    <p style={{ marginTop: 8, fontSize: 14, color: '#b71c1c' }}>
                        Lưu ý: chức năng theo dõi quảng cáo cần chạy trong mobile app WebView. Nếu đang chạy trên trình duyệt thông thường, các nút sẽ không thực hiện được vì không có bridge.
                    </p>
                )}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button onClick={onGetTrackingPermissionStatus} style={{ padding: '8px 12px' }}>
                        Get Tracking Permission Status
                    </button>
                    <button onClick={onRequestTrackingPermission} style={{ padding: '8px 12px' }}>
                        Request Tracking Permission
                    </button>
                </div>

                {trackingPermission && trackingPermission.isGranted === false && (
                    <p style={{ marginTop: 8, fontSize: 14, color: 'orange' }}>
                        Tracking permission chưa được cấp. Hãy yêu cầu quyền từ app (Request Tracking Permission).
                    </p>
                )}

                {trackingPermission && trackingPermission.isGranted === true && (
                    <p style={{ marginTop: 8, fontSize: 14, color: 'green' }}>
                        Tracking permission đã được cấp.
                    </p>
                )}

                {trackingPermission && trackingPermission.permission === 'restricted' && (
                    <p style={{ marginTop: 8, fontSize: 14, color: 'orange' }}>
                        ⚠️ Tracking permission bị hạn chế (restricted): có thể do thiết bị được quản lý hoặc kiểm soát của phụ huynh.
                    </p>
                )}

                {trackingPermission && (
                    <p style={{ marginTop: 8, fontSize: 14 }}>
                        Tracking permission: {JSON.stringify(trackingPermission)}
                    </p>
                )}
                {trackingError && (
                    <p style={{ marginTop: 8, fontSize: 14, color: 'red' }}>
                        Tracking error: {trackingError}
                    </p>
                )}
            </div>

            {/* Notification Permission Actions */}
            <div style={{ marginBottom: 16 }}>
                <h3>Notification Permission Actions</h3>
                {!isNativeApp && (
                    <p style={{ marginTop: 8, fontSize: 14, color: '#b71c1c' }}>
                        Lưu ý: chức năng yêu cầu quyền thông báo cần chạy trong mobile app WebView. Nếu đang chạy trên trình duyệt thông thường, các nút sẽ không thực hiện được vì không có bridge.
                    </p>
                )}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button onClick={onGetNotificationPermissionStatus} style={{ padding: '8px 12px' }}>
                        Get Notification Permission Status
                    </button>
                    <button onClick={onRequestNotificationPermission} style={{ padding: '8px 12px' }}>
                        Request Notification Permission
                    </button>
                </div>

                {notificationPermission && notificationPermission.isGranted === true && (
                    <p style={{ marginTop: 8, fontSize: 14, color: 'green' }}>
                        ✅ Notification permission đã được cấp.
                    </p>
                )}

                {notificationPermission && notificationPermission.permission === 'restricted' && (
                    <p style={{ marginTop: 8, fontSize: 14, color: 'orange' }}>
                        ⚠️ Notification permission bị hạn chế (restricted): có thể do thiết bị được quản lý hoặc kiểm soát của phụ huynh.
                    </p>
                )}

                {notificationPermission && (
                    <p style={{ marginTop: 8, fontSize: 14 }}>
                        Notification permission: {JSON.stringify(notificationPermission)}
                    </p>
                )}
                {notificationError && (
                    <p style={{ marginTop: 8, fontSize: 14, color: 'red' }}>
                        Notification error: {notificationError}
                    </p>
                )}
            </div>

            {/* Contacts Permission Actions */}
            <div style={{ marginBottom: 16 }}>
                <h3>Contacts Permission Actions</h3>
                {!isNativeApp && (
                    <p style={{ marginTop: 8, fontSize: 14, color: '#b71c1c' }}>
                        Lưu ý: chức năng yêu cầu quyền danh bạ cần chạy trong mobile app WebView. Nếu đang chạy trên trình duyệt thông thường, các nút sẽ không thực hiện được vì không có bridge.
                    </p>
                )}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button onClick={onGetContactPermissionStatus} style={{ padding: '8px 12px' }}>
                        Get Contact Permission Status
                    </button>
                    <button onClick={onRequestContactPermission} style={{ padding: '8px 12px' }}>
                        Request Contact Permission
                    </button>
                </div>

                {contactPermission && contactPermission.isGranted === false && (
                    <p style={{ marginTop: 8, fontSize: 14, color: 'orange' }}>
                        Danh bạ permission chưa được cấp. Hãy yêu cầu quyền từ app (Request Contact Permission) hoặc mở lại Settings.
                    </p>
                )}

                {contactPermission && contactPermission.isGranted === true && (
                    <p style={{ marginTop: 8, fontSize: 14, color: 'green' }}>
                        ✅ Danh bạ permission đã được cấp.
                    </p>
                )}

                {contactPermission && contactPermission.permission === 'restricted' && (
                    <p style={{ marginTop: 8, fontSize: 14, color: 'orange' }}>
                        ⚠️ Danh bạ permission bị hạn chế (restricted): có thể do thiết bị được quản lý hoặc kiểm soát của phụ huynh.
                    </p>
                )}

                {contactPermission && (
                    <p style={{ marginTop: 8, fontSize: 14 }}>
                        Contact permission: {JSON.stringify(contactPermission)}
                    </p>
                )}
                {contactError && (
                    <p style={{ marginTop: 8, fontSize: 14, color: 'red' }}>
                        Contact error: {contactError}
                    </p>
                )}
            </div>
        </section>
    );
}