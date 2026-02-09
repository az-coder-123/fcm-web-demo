export default function ExternalUrlActions() {
    const isNativeApp = typeof window !== 'undefined' && window.flutter_inappwebview;

    const openExternalUrl = async (url) => {
        if (isNativeApp) {
            try {
                const response = await window.flutter_inappwebview.callHandler('openExternalUrl', url);
                if (!response?.success) {
                    console.error('Failed to open external URL:', response?.error);
                    alert('Failed to open URL: ' + (response?.error || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error calling openExternalUrl:', error);
                alert('Failed to open URL: ' + error.message);
            }
        } else {
            // Fallback to window.open for web browser
            window.open(url, '_blank');
        }
    };

    const handleOpenExternalUrl = () => {
        openExternalUrl('https://www.google.com');
    };

    return (
        <section style={{ marginBottom: 24 }}>
            <h2>External URL Actions</h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                    onClick={handleOpenExternalUrl}
                    style={{
                        padding: '8px 16px',
                        background: '#4285F4',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    Open External URL
                </button>
            </div>
        </section>
    );
}