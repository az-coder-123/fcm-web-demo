import { useEffect } from 'react';

export default function Toast({ toast, onClose }) {
    if (!toast) return null;

    // Auto-dismiss after 5 seconds
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    // Get icon based on source
    const getIcon = () => {
        switch (toast.source) {
            case 'native_push':
                return '🔔';
            case 'native':
                return '📱';
            case 'web_fcm':
                return '🌐';
            default:
                return '✓';
        }
    };

    // Get CSS class based on source
    const getSourceClass = () => {
        switch (toast.source) {
            case 'native_push':
                return 'toast-native-push';
            case 'native':
                return 'toast-native';
            case 'web_fcm':
                return 'toast-web-fcm';
            default:
                return 'toast-default';
        }
    };

    const sourceClass = getSourceClass();

    return (
        <div className={`toast-container ${sourceClass}`}>
            {/* Progress Bar */}
            <div className="toast-progress-bar" />

            {/* Toast Content */}
            <div className="toast-content">
                {/* Icon */}
                <div className="toast-icon">
                    {getIcon()}
                </div>

                {/* Content */}
                <div className="toast-message">
                    {/* Title */}
                    <div className="toast-title">
                        {toast.title}
                    </div>

                    {/* Body */}
                    <div className="toast-body">
                        {toast.body}
                    </div>

                    {/* Source Badge */}
                    {toast.source && (
                        <div className="toast-badge">
                            {toast.source === 'native_push' && 'Push Notification'}
                            {toast.source === 'native' && 'Native App'}
                            {toast.source === 'web_fcm' && 'Web FCM'}
                        </div>
                    )}
                </div>

                {/* Close Button */}
                <button
                    aria-label="Close notification"
                    className="toast-close"
                    onClick={onClose}
                >
                    ×
                </button>
            </div>
        </div>
    );
}