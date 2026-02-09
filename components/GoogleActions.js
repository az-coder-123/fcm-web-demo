export default function GoogleActions() {
    const handleOpenGoogleNewTab = () => {
        window.open('https://www.google.com', '_blank');
    };

    const handleOpenGoogleNewWindow = () => {
        const width = 800;
        const height = 600;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;

        window.open(
            'https://www.google.com',
            '_blank',
            `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no,scrollbars=yes,resizable=yes`
        );
    };

    return (
        <section style={{ marginBottom: 24 }}>
            <h2>Google Actions</h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                    onClick={handleOpenGoogleNewTab}
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
                    Open Google in New Tab
                </button>

                <button
                    onClick={handleOpenGoogleNewWindow}
                    style={{
                        padding: '8px 16px',
                        background: '#34A853',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    Open Google in New Window
                </button>
            </div>
        </section>
    );
}