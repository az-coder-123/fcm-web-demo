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
                <a
                    href="mailto:example@gmail.com"
                    style={{
                        padding: '8px 16px',
                        background: '#EA4335',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: '14px',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="M22 4L12 13L2 4" />
                    </svg>
                    Mail
                </a>
                <a
                    href="tel:0901122333"
                    style={{
                        padding: '8px 16px',
                        background: '#34A853',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: '14px',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                    </svg>
                    Phone
                </a>
            </div>
        </section>
    );
}