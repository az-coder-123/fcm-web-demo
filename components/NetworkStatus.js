export default function NetworkStatus({ networkStatus }) {
    if (networkStatus === null) return null;

    return (
        <div style={{
            padding: 8,
            background: networkStatus ? '#e8f5e9' : '#ffebee',
            borderRadius: 4,
            marginBottom: 16,
            color: networkStatus ? '#2e7d32' : '#c62828'
        }}>
            📡 Network: {networkStatus ? 'Online' : 'Offline'}
        </div>
    );
}