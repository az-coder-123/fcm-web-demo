export default function FcmTokenSection({ isNativeApp, token, onEnable, onGetNativeToken, onCopyToken, addToLog }) {
    return (
        <section style={{ marginBottom: 24 }}>
            <h2>FCM Token</h2>
            <p>Get FCM token to enable push notifications.</p>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                {!isNativeApp && (
                    <button onClick={onEnable} style={{ padding: '8px 16px' }}>
                        Get Web FCM Token
                    </button>
                )}
                {isNativeApp && (
                    <button onClick={onGetNativeToken} style={{ padding: '8px 16px' }}>
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
                        onClick={() => { 
                            navigator.clipboard.writeText(token); 
                            addToLog('Copied', 'Token copied to clipboard'); 
                        }}
                        style={{ marginTop: 8, padding: '6px 12px' }}
                    >
                        Copy Token
                    </button>
                </div>
            )}
        </section>
    );
}