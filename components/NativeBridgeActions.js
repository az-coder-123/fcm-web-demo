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
    onGetResetToken,
    onSaveResetToken,
    biometricSupport,
    biometricPermission,
    resetToken,
    biometricAuthResult
}) {
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
                    <button onClick={() => onBiometricAuthenticate('Authenticate with biometrics')} style={{ padding: '8px 12px' }}>
                        Biometric Authenticate
                    </button>
                    <button onClick={onGetResetToken} style={{ padding: '8px 12px' }}>
                        Get Reset Token
                    </button>
                    <button onClick={() => onSaveResetToken('web-demo-reset-token')} style={{ padding: '8px 12px' }}>
                        Save Reset Token
                    </button>
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
                {resetToken && (
                    <p style={{ marginTop: 8, fontSize: 14 }}>
                        Reset token: {resetToken}
                    </p>
                )}
                {biometricAuthResult && (
                    <p style={{ marginTop: 8, fontSize: 14 }}>
                        Biometric auth status: {JSON.stringify(biometricAuthResult)}
                    </p>
                )}
            </div>
        </section>
    );
}