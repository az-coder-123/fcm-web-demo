export const metadata = {
    title: 'Webview FCM',
    description: 'Firebase Cloud Messaging in Next.js webview',
};

export default function RootLayout({ children }) {
    // Inject Firebase config as global for service worker access
    const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    };

    return (
        <html lang="en">
            <head>
                <script dangerouslySetInnerHTML={{
                    __html: `window.__FIREBASE_CONFIG__ = ${JSON.stringify(firebaseConfig)};`
                }} />
            </head>
            <body style={{ margin: 0 }}>{children}</body>
        </html>
    );
}
