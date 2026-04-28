'use client';

import { useEffect } from 'react';
import { initSkinColor } from '../lib/skinColor';

/**
 * Client-side wrapper component that initializes SkinColor integration
 * This must be a client component to use useEffect
 */
export function SkinColorInitializer() {
  useEffect(() => {
    try {
      // Initialize SkinColor when component mounts
      initSkinColor().catch(error => {
        console.error('[SkinColor] Initialization error:', error);
      });
    } catch (error) {
      console.error('[SkinColor] Unexpected error during initialization:', error);
    }
  }, []);

  return null; // This component doesn't render anything
}
