export default function ErrorDisplay({ error }) {
    if (!error) return null;

    return (
        <p style={{ color: 'red', marginTop: 16, padding: 12, background: '#ffebee', borderRadius: 4 }}>
            <strong>Error:</strong> {error}
        </p>
    );
}