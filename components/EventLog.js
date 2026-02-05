import { useState } from 'react';

export default function EventLog({ notificationLog, onClearLog }) {
    const [expandedLogIds, setExpandedLogIds] = useState({});

    const toggleLogExpanded = (id) => {
        setExpandedLogIds(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <section style={{ marginBottom: 24 }}>
            <h2>Event Log</h2>
            <button
                onClick={onClearLog}
                style={{ padding: '4px 8px', fontSize: 12, marginBottom: 8 }}
            >
                Clear Log
            </button>
            <div style={{
                background: '#f5f5f5',
                padding: 12,
                borderRadius: 4,
                maxHeight: 300,
                overflow: 'auto',
                fontFamily: 'monospace',
                fontSize: 12
            }}>
                {notificationLog.length === 0 ? (
                    <p style={{ color: '#666', fontStyle: 'italic' }}>No events yet...</p>
                ) : (
                    notificationLog.map((log, idx) => {
                        // Try to parse message as JSON for nicer display
                        let parsed = null;
                        try {
                            if (typeof log.message === 'string') {
                                parsed = JSON.parse(log.message);
                            }
                        } catch (e) {
                            parsed = null;
                        }

                        const isExpanded = !!(log.id && expandedLogIds[log.id]);

                        return (
                            <div key={log.id || idx} style={{ marginBottom: 8, borderBottom: '1px solid #e0e0e0', paddingBottom: 6 }}>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <span style={{ color: '#666', minWidth: 90 }}>[{log.timestamp}]</span>
                                    <span style={{ fontWeight: 'bold' }}>{log.type}:</span>
                                    <div style={{ marginLeft: 8, flex: 1 }}>
                                        {!parsed ? (
                                            <div style={{ whiteSpace: 'pre-wrap' }}>{log.message}</div>
                                        ) : (
                                            <div>
                                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                                    <div style={{ color: '#666', fontSize: 12 }}>{Object.keys(parsed).length} keys</div>
                                                    <button onClick={() => toggleLogExpanded(log.id)} style={{ padding: '2px 8px', fontSize: 12 }}>
                                                        {isExpanded ? 'Hide details' : 'Show details'}
                                                    </button>
                                                </div>
                                                {isExpanded && (
                                                    <pre style={{ background: '#fff', padding: 8, borderRadius: 6, marginTop: 6, whiteSpace: 'pre-wrap', overflowX: 'auto' }}>
                                                        {JSON.stringify(parsed, null, 2)}
                                                    </pre>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </section>
    );
}