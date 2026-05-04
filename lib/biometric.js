/**
 * Biometric Key-Based Authentication Utility (Demo)
 *
 * Simple demo: calls native bridge handlers to check biometric support,
 * create keys, sign payloads — and displays results.
 * No backend communication.
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function isNativeBridgeAvailable() {
    return typeof window !== 'undefined' && !!window.flutter_inappwebview;
}

async function callNative(handlerName, ...args) {
    if (!isNativeBridgeAvailable()) return null;
    try {
        return await window.flutter_inappwebview.callHandler(handlerName, ...args);
    } catch (error) {
        console.error(`[Biometric] Native call "${handlerName}" failed:`, error);
        return null;
    }
}

// ─── Label / Icon ─────────────────────────────────────────────────────────────

export function getBiometricLabel(type) {
    switch (type) {
        case 'face': return 'Face ID';
        case 'fingerprint': return 'Fingerprint';
        case 'iris': return 'Iris';
        case 'strong': return 'Biometric';
        case 'weak': return 'Biometric (weak)';
        default: return 'Biometric';
    }
}

export function getBiometricIcon(type) {
    switch (type) {
        case 'face': return '👤';
        case 'fingerprint': return '👆';
        case 'iris': return '👁️';
        default: return '🔑';
    }
}

// ─── Core Operations ──────────────────────────────────────────────────────────

/**
 * Check biometric availability and key status.
 */
export async function checkBiometricStatus() {
    if (!isNativeBridgeAvailable()) {
        return { isNativeApp: false, canAuthenticate: false, isRegistered: false, biometricType: null, loading: false };
    }

    try {
        const [available, keyStatus] = await Promise.all([
            callNative('biometricAuthAvailable'),
            callNative('biometricKeyExists'),
        ]);

        if (available === null) {
            return {
                isNativeApp: true, canAuthenticate: false, isRegistered: false,
                biometricType: null, reason: 'Key-based biometric handlers not available. Update the app.', loading: false,
            };
        }

        if (!available?.success || !available?.canAuthenticate) {
            return {
                isNativeApp: true, canAuthenticate: false, isRegistered: false,
                biometricType: null, reason: available?.reason || 'Biometric not available', loading: false,
            };
        }

        return {
            isNativeApp: true, canAuthenticate: true,
            isRegistered: keyStatus?.exists === true,
            biometricType: available?.availableBiometrics?.[0] || null,
            loading: false,
        };
    } catch (error) {
        return { isNativeApp: true, canAuthenticate: false, isRegistered: false, biometricType: null, reason: `Check failed: ${error.message}`, loading: false };
    }
}

/**
 * Create a new biometric key pair. Returns public key info (does NOT send to backend).
 */
export async function createBiometricKeys(reason = 'Authenticate to create signing keys') {
    // Delete old keys first if they exist
    const keyStatus = await callNative('biometricKeyExists');
    if (keyStatus?.exists) {
        await callNative('biometricDeleteKeys');
    }

    const result = await callNative('biometricCreateKeys', null, reason);

    if (!result?.success) {
        return { success: false, error: result?.error || 'Failed to create keys', code: result?.code };
    }

    return {
        success: true,
        publicKey: result.publicKey,
        keyAlias: result.keyAlias,
    };
}

/**
 * Sign a payload with biometric. Returns signature info (does NOT send to backend).
 */
export async function signWithBiometric(payload, reason = 'Authenticate to sign') {
    if (!payload) {
        // Generate a demo payload if none provided
        payload = `demo-challenge-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    }

    const result = await callNative('biometricSign', payload, null, reason);

    if (!result?.success) {
        return { success: false, error: result?.error || 'Sign failed', code: result?.code };
    }

    return {
        success: true,
        signature: result.signature,
        publicKey: result.publicKey,
        payload: result.payload,
        ts: result.ts,
    };
}

/**
 * Simple biometric prompt (no crypto).
 */
export async function simpleBiometricPrompt(reason = 'Verify your identity') {
    const result = await callNative('biometricSimplePrompt', reason);
    if (!result) return { success: false, error: 'Biometric not available' };
    return result;
}

/**
 * Get detailed key info.
 */
export async function getBiometricKeyInfo() {
    return callNative('biometricGetKeyInfo');
}

/**
 * Delete biometric keys.
 */
export async function deleteBiometricKeys() {
    return callNative('biometricDeleteKeys');
}

/**
 * Delete ALL biometric keys.
 */
export async function deleteAllBiometricKeys() {
    return callNative('biometricDeleteAllKeys');
}

// ─── Debug ────────────────────────────────────────────────────────────────────

export function installBridgeDebugLogger() {
    if (!isNativeBridgeAvailable()) return;

    const original = window.flutter_inappwebview.callHandler.bind(window.flutter_inappwebview);

    window.flutter_inappwebview.callHandler = async function (name, ...args) {
        console.log(`[Bridge Call] ${name}`, args);
        const result = await original(name, ...args);
        console.log(`[Bridge Result] ${name}`, result);
        return result;
    };

    console.log('[Biometric] Bridge debug logger installed.');
}