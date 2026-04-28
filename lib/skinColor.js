/**
 * SkinColor Bridge - Web to Native App communication
 * Notifies the native app about the web app's primary color
 * 
 * Used by mobile app to sync the WebView background color with the web theme
 */

/**
 * Check if running inside native app WebView
 * @returns {boolean} True if bridge is available
 */
export function isInNativeApp() {
  if (typeof window === 'undefined') return false;
  return !!window.flutter_inappwebview?.callHandler;
}

/**
 * Send skinColor to native app (if running inside WebView)
 * 
 * @param {string} color - Valid CSS color (#hex, rgb(), rgba(), null to clear cache)
 * @returns {Promise<{success: boolean, color?: string, error?: string}>} - Result from native
 * 
 * @example
 * notifyNativeSkinColor('#1E88E5');
 * notifyNativeSkinColor('rgb(30, 136, 229)');
 * notifyNativeSkinColor(null); // Clear cached color
 */
export async function notifyNativeSkinColor(color) {
  // Check if running inside native app
  if (!isInNativeApp()) {
    console.log('[SkinColor] Not in native app, skipping');
    return { success: false, reason: 'not_in_app' };
  }

  // Validate color format
  if (color !== null && (typeof color !== 'string' || color.trim() === '')) {
    console.warn('[SkinColor] Invalid color:', color);
    return { success: false, reason: 'invalid_color' };
  }

  try {
    const normalizedColor = color ? color.trim().toLowerCase() : null;
    const result = await window.flutter_inappwebview.callHandler(
      'onSkinColorChanged',
      normalizedColor
    );
    console.log('[SkinColor] Sent to native:', normalizedColor, '| Result:', result);
    return result || { success: true, color: normalizedColor };
  } catch (error) {
    console.error('[SkinColor] Failed to send:', error);
    return { success: false, reason: 'bridge_error', error: error.message };
  }
}

/**
 * Clear cached color in native app (will fallback to default blue #1877F2)
 * @returns {Promise<{success: boolean}>}
 */
export async function clearNativeSkinColor() {
  return notifyNativeSkinColor(null);
}

/**
 * Get primary color from page (either from CSS variable or meta tag)
 * @returns {string} Color in hex format
 */
export function getPrimaryColor() {
  if (typeof window === 'undefined') return '#1E88E5';

  try {
    // Try to get from CSS variable
    const computedStyle = getComputedStyle(document.documentElement);
    let primaryColor = computedStyle.getPropertyValue('--primary-color').trim();
    if (primaryColor) {
      return normalizeColorFormat(primaryColor);
    }

    // Try to get from meta tag
    const metaTag = document.querySelector('meta[name="theme-color"]');
    if (metaTag && metaTag.content) {
      return normalizeColorFormat(metaTag.content);
    }

    // Default Material Design blue
    return '#1E88E5';
  } catch (error) {
    console.error('[SkinColor] Error getting primary color:', error);
    return '#1E88E5';
  }
}

/**
 * Normalize color to hex format
 * @param {string} color - Color in any CSS format
 * @returns {string} Color in #RRGGBB format
 */
function normalizeColorFormat(color) {
  // Remove whitespace
  color = color.trim();

  // Already in hex format
  if (color.startsWith('#')) {
    return color;
  }

  // rgb(r, g, b) or rgba(r, g, b, a) format
  if (color.startsWith('rgb')) {
    const match = color.match(/\d+/g);
    if (match && match.length >= 3) {
      const r = parseInt(match[0]).toString(16).padStart(2, '0');
      const g = parseInt(match[1]).toString(16).padStart(2, '0');
      const b = parseInt(match[2]).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`;
    }
  }

  // If can't parse, return default
  return '#1E88E5';
}

/**
 * Wait for bridge to be ready before calling handler
 * Useful for synchronizing with app startup
 * @param {number} maxWait - Max time to wait in ms (default 5000)
 * @returns {Promise<boolean>} True if bridge ready, false if timeout
 */
export async function waitForBridgeReady(maxWait = 5000) {
  const start = Date.now();
  
  return new Promise((resolve) => {
    const check = () => {
      if (isInNativeApp()) {
        resolve(true);
      } else if (Date.now() - start < maxWait) {
        setTimeout(check, 100);
      } else {
        console.warn('[SkinColor] Bridge not available after', maxWait, 'ms');
        resolve(false);
      }
    };
    check();
  });
}

/**
 * Initialize SkinColor - should be called once when app loads
 * Automatically sends the primary color to native app if available
 * @returns {Promise<{success: boolean}>}
 */
export async function initSkinColor() {
  if (!isInNativeApp()) {
    console.log('[SkinColor] Not in native app, skipping init');
    return { success: false, reason: 'not_in_app' };
  }

  try {
    const primaryColor = getPrimaryColor();
    const result = await notifyNativeSkinColor(primaryColor);
    console.log('[SkinColor] Initialized with color:', primaryColor);
    return result;
  } catch (error) {
    console.error('[SkinColor] Init failed:', error);
    return { success: false, reason: 'init_error', error: error.message };
  }
}
