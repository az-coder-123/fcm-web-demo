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
    onGetRefreshToken,
    onSaveRefreshToken,
    biometricSupport,
    biometricPermission,
    refreshTokenOwnerKey,
    refreshToken,
    biometricAuthResult
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
        </section>
    );
}