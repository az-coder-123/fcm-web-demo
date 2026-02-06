import { useState } from 'react';

const SUPABASE_URL = 'https://cmdrmhaurdicqiapicla.supabase.co/rest/v1/fcm_user_tokens';
const SUPABASE_API_KEY = 'sb_publishable_PbQ0WpjtLHjn0rStemAm9w_B6U5UH3j';

export default function TokenSubmission({ isNativeApp, token, addToLog }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionResult, setSubmissionResult] = useState(null);

    const handleSubmitToken = async () => {
        if (!token) {
            addToLog('Submission Error', 'No token available. Please get FCM token first.');
            return;
        }

        setIsSubmitting(true);
        setSubmissionResult(null);

        try {
            // Determine platform based on environment
            // Use 'native' instead of 'mobileapp' to avoid Supabase filter parsing issues
            const platform = isNativeApp ? 'native' : 'web';

            // Log the request details
            addToLog('Submitting Token', `Platform: ${platform}`);
            addToLog('Token Preview', `First 50 chars: ${token.substring(0, 50)}...`);
            addToLog('Token Length', `Total length: ${token.length} chars`);

            const requestBody = {
                token: token,
                platform: platform
            };

            const response = await fetch(`${SUPABASE_URL}`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_API_KEY,
                    'Prefer': 'resolution=merge-duplicates',
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${SUPABASE_API_KEY}`
                },
                body: JSON.stringify(requestBody)
            });

            // Get response text first
            const responseText = await response.text();

            // Log response details
            addToLog('Response Status', `${response.status}: ${response.statusText}`);
            addToLog('Response Text', responseText.substring(0, 200));

            // Try to parse as JSON, if fails use the text
            let data;
            try {
                data = responseText ? JSON.parse(responseText) : {};
            } catch (e) {
                data = { raw_response: responseText };
            }

            if (response.ok) {
                setSubmissionResult({
                    success: true,
                    message: 'Token submitted successfully!',
                    data: data
                });
                addToLog('Token Submitted', `Platform: ${platform}, Status: Success`);
            } else {
                setSubmissionResult({
                    success: false,
                    message: `Failed to submit token (${response.status}): ${response.statusText}`,
                    error: data
                });
                addToLog('Submission Error', `Platform: ${platform}, Status: ${response.status}, Error: ${response.statusText}`);
                addToLog('Full Error Response', JSON.stringify(data));
            }
        } catch (error) {
            setSubmissionResult({
                success: false,
                message: `Network error: ${error.message}`,
                error: error
            });
            addToLog('Submission Error', `Network error: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section style={{ marginBottom: 24 }}>
            <h2>Submit FCM Token to Supabase</h2>
            <p>
                Submit your FCM token to the Supabase database to enable push notifications.
                Platform is automatically detected: <strong>{isNativeApp ? 'native (Native App)' : 'web (Web Browser)'}</strong>
            </p>

            <button
                onClick={handleSubmitToken}
                disabled={!token || isSubmitting}
                style={{
                    padding: '8px 16px',
                    backgroundColor: !token || isSubmitting ? '#ccc' : '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: (!token || isSubmitting) ? 'not-allowed' : 'pointer',
                    opacity: (!token || isSubmitting) ? 0.6 : 1
                }}
            >
                {isSubmitting ? 'Submitting...' : 'Submit Token to Supabase'}
            </button>

            {submissionResult && (
                <div style={{
                    marginTop: 16,
                    padding: 12,
                    backgroundColor: submissionResult.success ? '#d4edda' : '#f8d7da',
                    borderRadius: 4,
                    border: `1px solid ${submissionResult.success ? '#c3e6cb' : '#f5c6cb'}`
                }}>
                    <strong style={{ fontSize: 14 }}>
                        {submissionResult.success ? '✓' : '✗'} {submissionResult.message}
                    </strong>

                    {submissionResult.data && (
                        <div style={{ marginTop: 12 }}>
                            <strong style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Response Details:</strong>
                            <pre style={{
                                fontSize: 11,
                                fontFamily: 'monospace',
                                backgroundColor: '#fff',
                                padding: 8,
                                borderRadius: 4,
                                border: '1px solid #ddd',
                                overflow: 'auto',
                                maxHeight: 300,
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word'
                            }}>
                                {JSON.stringify(submissionResult.data, null, 2)}
                            </pre>
                        </div>
                    )}

                    {submissionResult.error && !submissionResult.success && (
                        <div style={{ marginTop: 12 }}>
                            <strong style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Request Sent:</strong>
                            <pre style={{
                                fontSize: 11,
                                fontFamily: 'monospace',
                                backgroundColor: '#fff',
                                padding: 8,
                                borderRadius: 4,
                                border: '1px solid #ddd',
                                overflow: 'auto',
                                maxHeight: 200,
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word'
                            }}>
                                {`URL: ${SUPABASE_URL}
Method: POST
Headers:
  - apikey: ${SUPABASE_API_KEY.substring(0, 20)}...
  - Prefer: resolution=merge-duplicates
  - Content-Type: application/json
  - Authorization: Bearer ${SUPABASE_API_KEY.substring(0, 20)}...
Body:
  - token: ${token ? token.substring(0, 50) + '...' : 'null'}
  - platform: ${isNativeApp ? 'native' : 'web'}`}
                            </pre>
                        </div>
                    )}
                </div>
            )}

            <div style={{ marginTop: 16, fontSize: 12, color: '#666' }}>
                <strong>API Details:</strong>
                <div style={{ marginTop: 4 }}>
                    <div>URL: {SUPABASE_URL}</div>
                    <div>Method: POST</div>
                    <div>Headers: apikey, Prefer, Content-Type</div>
                    <div>Conflict Resolution: merge-duplicates on token field</div>
                </div>
            </div>
        </section>
    );
}