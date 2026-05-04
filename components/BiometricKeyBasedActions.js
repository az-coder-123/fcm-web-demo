'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
    checkBiometricStatus,
    createBiometricKeys,
    deleteAllBiometricKeys,
    deleteBiometricKeys,
    getBiometricIcon,
    getBiometricKeyInfo,
    getBiometricLabel,
    installBridgeDebugLogger,
    signWithBiometric,
    simpleBiometricPrompt,
} from '../lib/biometric';

export default function BiometricKeyBasedActions({ isNativeApp, addToLog }) {
    // Status
    const [status, setStatus] = useState({
        isNativeApp: false,
        canAuthenticate: false,
        isRegistered: false,
        biometricType: null,
        reason: null,
        loading: true,
    });

    // Operation states
    const [busy, setBusy] = useState(null);
    const [lastResult, setLastResult] = useState(null);
    const [debugInstalled, setDebugInstalled] = useState(false);

    // Stable ref to avoid infinite re-renders
    const addToLogRef = useRef(addToLog);
    addToLogRef.current = addToLog;

    const log = (title, detail) => addToLogRef.current(title, detail);

    // ─── Refresh Status ──────────────────────────────────────────────────
    const refreshStatus = useCallback(async () => {
        setStatus(prev => ({ ...prev, loading: true }));
        const result = await checkBiometricStatus();
        setStatus(result);
        log('Biometric Status', JSON.stringify(result, null, 2));
    }, []);

    useEffect(() => {
        if (isNativeApp) {
            refreshStatus();
        } else {
            setStatus({ isNativeApp: false, canAuthenticate: false, isRegistered: false, biometricType: null, reason: null, loading: false });
        }
    }, [isNativeApp, refreshStatus]);

    // ─── Handlers ────────────────────────────────────────────────────────

    const handleCreateKeys = async () => {
        setBusy('createKeys');
        setLastResult(null);
        try {
            const result = await createBiometricKeys('Authenticate to create signing keys');
            setLastResult(result);
            if (result.success) {
                log('Create Keys ✅', `Public Key:\n${result.publicKey}\n\nKey Alias: ${result.keyAlias || '(default)'}`);
            } else {
                log('Create Keys ❌', `${result.error}${result.code ? ` (code: ${result.code})` : ''}`);
            }
            await refreshStatus();
        } catch (err) {
            setLastResult({ success: false, error: err.message });
            log('Create Keys Error', err.message);
        } finally {
            setBusy(null);
        }
    };

    const handleSign = async () => {
        setBusy('sign');
        setLastResult(null);
        try {
            const result = await signWithBiometric(null, 'Authenticate to sign');
            setLastResult(result);
            if (result.success) {
                log('Sign ✅', `Signature: ${result.signature}\n\nPublic Key: ${result.publicKey}\n\nPayload: ${result.payload}\n\nTimestamp: ${result.ts}`);
            } else {
                log('Sign ❌', `${result.error}${result.code ? ` (code: ${result.code})` : ''}`);
            }
        } catch (err) {
            setLastResult({ success: false, error: err.message });
            log('Sign Error', err.message);
        } finally {
            setBusy(null);
        }
    };

    const handleSimplePrompt = async () => {
        setBusy('simple');
        setLastResult(null);
        try {
            const result = await simpleBiometricPrompt('Verify your identity to continue');
            setLastResult(result);
            log('Simple Prompt', result?.success ? '✅ Authenticated' : `❌ ${result?.error || 'Failed'}`);
        } catch (err) {
            setLastResult({ success: false, error: err.message });
            log('Simple Prompt Error', err.message);
        } finally {
            setBusy(null);
        }
    };

    const handleGetKeyInfo = async () => {
        setBusy('keyInfo');
        setLastResult(null);
        try {
            const result = await getBiometricKeyInfo();
            setLastResult(result);
            log('Key Info', JSON.stringify(result, null, 2));
        } catch (err) {
            setLastResult({ error: err.message });
            log('Key Info Error', err.message);
        } finally {
            setBusy(null);
        }
    };

    const handleDeleteKeys = async () => {
        if (!confirm('Delete biometric keys on this device?')) return;
        setBusy('delete');
        setLastResult(null);
        try {
            const result = await deleteBiometricKeys();
            setLastResult(result);
            log('Delete Keys', JSON.stringify(result));
            await refreshStatus();
        } catch (err) {
            setLastResult({ success: false, error: err.message });
            log('Delete Keys Error', err.message);
        } finally {
            setBusy(null);
        }
    };

    const handleDeleteAllKeys = async () => {
        if (!confirm('Delete ALL biometric keys on this device?')) return;
        setBusy('deleteAll');
        setLastResult(null);
        try {
            const result = await deleteAllBiometricKeys();
            setLastResult(result);
            log('Delete All Keys', JSON.stringify(result));
            await refreshStatus();
        } catch (err) {
            setLastResult({ success: false, error: err.message });
            log('Delete All Error', err.message);
        } finally {
            setBusy(null);
        }
    };

    const handleInstallDebugLogger = () => {
        installBridgeDebugLogger();
        setDebugInstalled(true);
        log('Debug', 'Bridge debug logger installed — check browser console');
    };

    // ─── Derived ─────────────────────────────────────────────────────────

    const biometricLabel = getBiometricLabel(status.biometricType);
    const biometricEmoji = getBiometricIcon(status.biometricType);
    const canAuth = status.canAuthenticate;
    const isReg = status.isRegistered;

    // ─── Render ──────────────────────────────────────────────────────────

    return (
        <section style={{ marginBottom: 24 }}>
            <h2>{biometricEmoji} Biometric Key-Based Auth <span style={{ fontSize: 12, color: '#888', fontWeight: 'normal' }}>(demo — no backend)</span></h2>

            {!isNativeApp && (
                <p style={{ marginTop: 8, fontSize: 14, color: '#b71c1c' }}>
                    ⚠️ Requires mobile app WebView. Native bridge not detected.
                </p>
            )}

            {/* Status */}
            <div style={{ marginTop: 8, fontSize: 14 }}>
                <p><strong>Device Support:</strong> {status.loading ? '⏳ Checking...' : canAuth ? '✅ Available' : '❌ Not available'}</p>
                {status.reason && <p style={{ color: '#666', margin: '4px 0' }}>Reason: {status.reason}</p>}
                <p><strong>Keys Created:</strong> {status.loading ? '⏳' : isReg ? '✅ Yes' : '⚪ No'}</p>
                <p><strong>Type:</strong> {biometricEmoji} {biometricLabel}</p>
                <button onClick={refreshStatus} disabled={status.loading} style={{ padding: '4px 12px' }}>
                    {status.loading ? 'Checking...' : '🔄 Refresh'}
                </button>
            </div>

            {/* Actions */}
            <div style={{ marginTop: 16 }}>
                <h3>Actions</h3>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button onClick={handleCreateKeys} disabled={busy || !canAuth} style={{ padding: '8px 12px', background: '#2e7d32', color: 'white', border: 'none', borderRadius: 4 }}>
                        {busy === 'createKeys' ? '⏳ Creating...' : '🔐 Create Keys'}
                    </button>
                    <button onClick={handleSign} disabled={busy || !canAuth || !isReg} style={{ padding: '8px 12px', background: '#1565c0', color: 'white', border: 'none', borderRadius: 4 }}>
                        {busy === 'sign' ? '⏳ Signing...' : '✍️ Sign (Demo)'}
                    </button>
                    <button onClick={handleSimplePrompt} disabled={busy || !canAuth} style={{ padding: '8px 12px' }}>
                        {busy === 'simple' ? '⏳ Prompting...' : '👆 Simple Prompt'}
                    </button>
                    <button onClick={handleGetKeyInfo} disabled={busy || !canAuth || !isReg} style={{ padding: '8px 12px' }}>
                        ℹ️ Key Info
                    </button>
                    <button onClick={handleDeleteKeys} disabled={busy || !isReg} style={{ padding: '8px 12px' }}>
                        🗑️ Delete Keys
                    </button>
                    <button onClick={handleDeleteAllKeys} disabled={busy} style={{ padding: '8px 12px', background: '#d32f2f', color: 'white', border: 'none', borderRadius: 4 }}>
                        🗑️ Delete All
                    </button>
                    <button onClick={handleInstallDebugLogger} disabled={debugInstalled} style={{ padding: '8px 12px' }}>
                        🐛 Debug Logger
                    </button>
                </div>
                {canAuth && !isReg && (
                    <p style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                        Create keys first to enable signing.
                    </p>
                )}
            </div>

            {/* Last Result */}
            {lastResult && (
                <div style={{ marginTop: 12, fontSize: 14, padding: 8, background: '#f5f5f5', borderRadius: 4, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                    <strong>{lastResult.success !== false ? '✅ Result' : '❌ Error'}</strong>
                    <br />
                    {typeof lastResult === 'object' ? JSON.stringify(lastResult, null, 2) : String(lastResult)}
                </div>
            )}
        </section>
    );
}