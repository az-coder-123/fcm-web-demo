export default function TestActions({ isNativeApp, onSimulateNotification, onWebLogout }) {
    return (
        <section style={{ marginBottom: 24 }}>
            <h2>Test Actions</h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                    onClick={onSimulateNotification}
                    style={{ padding: '8px 16px' }}
                >
                    Simulate Notification ({isNativeApp ? 'from Native' : 'Web'})
                </button>

                {/* Web-only Logout */}
                {!isNativeApp && (
                    <button
                        onClick={onWebLogout}
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
    );
}