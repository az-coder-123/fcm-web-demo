'use client';

import { useEffect, useState } from 'react';
import { notifyNativeSkinColor } from '../lib/skinColor';

const PRESET_COLORS = [
  { name: 'Blue', value: '#1E88E5' },
  { name: 'Red', value: '#FF5252' },
  { name: 'Green', value: '#4CAF50' },
  { name: 'Purple', value: '#9C27B0' },
  { name: 'Orange', value: '#FF9800' },
  { name: 'Pink', value: '#E91E63' },
  { name: 'Teal', value: '#00BCD4' },
  { name: 'Indigo', value: '#3F51B5' },
];

export function SkinColorControl() {
  const [currentColor, setCurrentColor] = useState('#1E88E5');
  const [customColor, setCustomColor] = useState('#1E88E5');
  const [showCustomInput, setShowCustomInput] = useState(false);

  useEffect(() => {
    // Update CSS variable when color changes
    try {
      if (typeof document !== 'undefined' && document.documentElement) {
        document.documentElement.style.setProperty('--primary-color', currentColor);
      }
    } catch (error) {
      console.error('[SkinColorControl] Failed to set CSS variable:', error);
    }
  }, [currentColor]);

  const handleColorChange = (color) => {
    try {
      setCurrentColor(color);
      setCustomColor(color);
      notifyNativeSkinColor(color).catch(error => {
        console.error('[SkinColorControl] Failed to notify native:', error);
      });
    } catch (error) {
      console.error('[SkinColorControl] Error in handleColorChange:', error);
    }
  };

  const handleCustomColorChange = (e) => {
    try {
      const color = e.target.value;
      setCustomColor(color);
      setCurrentColor(color);
      notifyNativeSkinColor(color).catch(error => {
        console.error('[SkinColorControl] Failed to notify native:', error);
      });
    } catch (error) {
      console.error('[SkinColorControl] Error in handleCustomColorChange:', error);
    }
  };

  const [hoveredColor, setHoveredColor] = useState(null);
  const [isNativeApp, setIsNativeApp] = useState(false);

  useEffect(() => {
    setIsNativeApp(typeof window !== 'undefined' && !!window.flutter_inappwebview);
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>🎨 Change App Color</h3>
        <div style={{ ...styles.colorPreview, backgroundColor: currentColor }} />
      </div>

      <div style={styles.presetsSection}>
        <label style={styles.label}>Preset Colors:</label>
        <div style={styles.presetGrid}>
          {PRESET_COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => handleColorChange(color.value)}
              onMouseEnter={() => setHoveredColor(color.value)}
              onMouseLeave={() => setHoveredColor(null)}
              style={{
                ...styles.presetButton,
                backgroundColor: color.value,
                border:
                  currentColor === color.value
                    ? '3px solid #000'
                    : '2px solid #ccc',
                boxShadow:
                  currentColor === color.value
                    ? `0 0 12px ${color.value}`
                    : hoveredColor === color.value
                    ? `0 0 8px ${color.value}`
                    : 'none',
                transform: hoveredColor === color.value ? 'scale(1.05)' : 'scale(1)',
              }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      <div style={styles.customSection}>
        <label style={styles.label}>
          <input
            type="checkbox"
            checked={showCustomInput}
            onChange={(e) => setShowCustomInput(e.target.checked)}
            style={{ marginRight: '8px' }}
          />
          Custom Color
        </label>
        {showCustomInput && (
          <div style={styles.customInputGroup}>
            <input
              type="color"
              value={customColor}
              onChange={handleCustomColorChange}
              style={styles.colorInput}
            />
            <input
              type="text"
              value={customColor}
              onChange={(e) => {
                try {
                  const value = e.target.value;
                  setCustomColor(value);
                  if (/^#[0-9A-F]{6}$/i.test(value)) {
                    setCurrentColor(value);
                    notifyNativeSkinColor(value).catch(error => {
                      console.error('[SkinColorControl] Failed to notify native:', error);
                    });
                  }
                } catch (error) {
                  console.error('[SkinColorControl] Error in hex input:', error);
                }
              }}
              placeholder="#RRGGBB"
              style={styles.textInput}
            />
          </div>
        )}
      </div>

      <div style={styles.infoSection}>
        <small style={styles.info}>
          ℹ️ Current color: <strong>{currentColor}</strong>
          <br />
          {isNativeApp
            ? '✅ Connected to native app'
            : '⚠️ Not in native app (testing in browser)'}
        </small>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '16px',
    margin: '16px 0',
    backgroundColor: '#f5f5f5',
    borderRadius: '12px',
    border: '1px solid #e0e0e0',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  title: {
    margin: '0',
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
  },
  colorPreview: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    border: '2px solid #999',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  presetsSection: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '8px',
    color: '#555',
    cursor: 'pointer',
  },
  presetGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(44px, 1fr))',
    gap: '8px',
  },
  presetButton: {
    width: '100%',
    aspectRatio: '1',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    padding: '0',
    border: '2px solid #ccc',
  },
  customSection: {
    marginBottom: '16px',
    paddingTop: '12px',
    borderTop: '1px solid #ddd',
  },
  customInputGroup: {
    display: 'flex',
    gap: '8px',
    marginTop: '8px',
  },
  colorInput: {
    width: '60px',
    height: '40px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    cursor: 'pointer',
    padding: '4px',
  },
  textInput: {
    flex: 1,
    padding: '8px 12px',
    fontSize: '14px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    fontFamily: 'monospace',
  },
  infoSection: {
    paddingTop: '12px',
    borderTop: '1px solid #ddd',
  },
  info: {
    display: 'block',
    color: '#666',
    lineHeight: '1.6',
  },
};
