export default function NativeBridgeActions({ 
    currentLocale, 
    logoutResult,
    onChangeLocale,
    onLogout,
    onSendLog
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
        </section>
    );
}