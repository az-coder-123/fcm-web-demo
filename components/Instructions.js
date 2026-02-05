export default function Instructions() {
    return (
        <section style={{ marginTop: 32, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
            <h3>📖 How to Test</h3>
            <ol style={{ lineHeight: 1.8 }}>
                <li><strong>Web Browser:</strong> Click "Get Web FCM Token" to get a web FCM token</li>
                <li><strong>Native App:</strong> Click "Get Native FCM Token" to get the native FCM token</li>
                <li><strong>Change Language:</strong> Use the language buttons to test locale changes</li>
                <li><strong>Logout:</strong>
                    <ul>
                        <li><strong>Web:</strong> Click "Web Logout" in Test Actions to clear the web FCM token</li>
                        <li><strong>Native:</strong> Click "Logout (Delete FCM Token)" in Native Bridge Actions</li>
                    </ul>
                </li>
                <li><strong>Simulate Notification:</strong> Click to test notification display</li>
                <li><strong>Event Log:</strong> All events are logged below for debugging</li>
            </ol>
            <h4 style={{ marginTop: 16 }}>Testing Push Notifications</h4>
            <ul style={{ lineHeight: 1.8 }}>
                <li>Use Firebase Console to send test notifications with the FCM token</li>
                <li>Include custom data in notification payload to test deep link handling</li>
                <li>Watch the event log to see when notifications are received</li>
            </ul>
        </section>
    );
}