export default function ExternalUrlActions() {
    const isNativeApp = typeof window !== 'undefined' && window.flutter_inappwebview;

    const openUrlInDefaultBrowser = async (url) => {
        if (isNativeApp) {
            try {
                const response = await window.flutter_inappwebview.callHandler('openUrlInDefaultBrowser', url);
                if (!response?.success) {
                    console.error('Failed to open external URL:', response?.error);
                    alert('Failed to open URL: ' + (response?.error || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error calling openUrlInDefaultBrowser:', error);
                alert('Failed to open URL: ' + error.message);
            }
        } else {
            // Fallback to window.open for web browser
            window.open(url, '_blank');
        }
    };

    const handleOpenUrlInDefaultBrowser = () => {
        openUrlInDefaultBrowser('https://www.google.com');
    };

    const openUrlInInternalBrowser = async (url) => {
        if (isNativeApp) {
            try {
                const response = await window.flutter_inappwebview.callHandler('openUrlInInternalBrowser', url);
                if (!response?.success) {
                    console.error('Failed to open internal URL:', response?.error);
                    alert('Failed to open URL: ' + (response?.error || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error calling openUrlInInternalBrowser:', error);
                alert('Failed to open URL: ' + error.message);
            }
        } else {
            // Fallback to window.open for web browser
            window.open(url, '_blank');
        }
    };

    const handleUrlInInternalBrowser = () => {
        openUrlInInternalBrowser('https://www.facebook.com');
    };

    return (
        <section style={{ marginBottom: 24 }}>
            <h2>External URL Actions</h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                    onClick={handleOpenUrlInDefaultBrowser}
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
                    Open URL in Default Browser
                </button>
                <button
                    onClick={handleUrlInInternalBrowser}
                    style={{
                        padding: '8px 16px',
                        background: '#4267B2',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    Open URL in Internal Browser
                </button>
                <button
                    onClick={() => window.open('https://www.github.com', '_blank')}
                    style={{
                        padding: '8px 16px',
                        background: '#333',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    Open GitHub
                </button>
            </div>
        </section>
    );
}