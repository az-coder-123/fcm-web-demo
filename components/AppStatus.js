export default function AppStatus({ isNativeApp, appInfo }) {
    return (
        <div style={{
            padding: 12,
            background: isNativeApp ? '#e3f2fd' : '#fff3e0',
            borderRadius: 8,
            marginBottom: 16,
            border: `1px solid ${isNativeApp ? '#2196f3' : '#ff9800'}`
        }}>
            <strong>Environment: {isNativeApp ? '📱 Native App' : '🌐 Web Browser'}</strong>
            {appInfo && (
                <div style={{ fontSize: 14, marginTop: 8 }}>
                    <div>App: {appInfo.appName} v{appInfo.version}</div>
                    <div>Platform: {appInfo.platform}</div>
                </div>
            )}
        </div>
    );
}