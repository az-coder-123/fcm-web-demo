/**
 * React hook for SkinColor integration
 * Automatically notifies native app about color changes
 */
'use client';

import { useEffect } from 'react';
import { notifyNativeSkinColor, getPrimaryColor } from './skinColor';

/**
 * Hook to notify native app about primary color on mount and when it changes
 * @param {string} [color] - Optional color to use. If not provided, will auto-detect from CSS
 * @param {boolean} [enabled=true] - Enable/disable the hook
 */
export function useSkinColor(color, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const colorToSend = color || getPrimaryColor();
    notifyNativeSkinColor(colorToSend);
  }, [color, enabled]);
}

/**
 * Hook with manual control for theme switching
 * @returns {Object} Object with setSkinColor function
 */
export function useSkinColorControl() {
  const setSkinColor = (newColor) => {
    notifyNativeSkinColor(newColor);
  };

  return { setSkinColor };
}
