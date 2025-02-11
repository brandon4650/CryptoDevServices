import React from 'react';
import { ToggleLeft, ToggleRight } from 'lucide-react';
import { useStyle } from '../../../contexts/StyleContext';

const FONT_STYLES = {
  'default': 'font-sans',
  'modern': 'font-mono',
  'elegant': 'font-serif',
  'playful': 'font-comic',
  'bold': 'font-display',
  'minimal': 'font-light'
};

const BUTTON_STYLES = {
  'default': {
    base: 'px-4 py-2 rounded-lg transition-all duration-200',
    gradient: 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90'
  },
  'outlined': {
    base: 'px-4 py-2 rounded-lg border-2 transition-all duration-200',
    hover: 'hover:bg-white/10'
  },
  'minimal': {
    base: 'px-4 py-2 rounded-sm transition-all duration-200',
    hover: 'hover:bg-white/10'
  },
  'rounded': {
    base: 'px-6 py-3 rounded-full transition-all duration-200',
    gradient: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90'
  },
  'glass': {
    base: 'px-4 py-2 rounded-lg backdrop-blur-sm transition-all duration-200',
    bg: 'bg-white/10 hover:bg-white/20'
  }
};

const StyleSettings = ({ 
  globalStyles, 
  onUpdate 
}) => {
  const handleUpdateStyle = (field, value) => {
    onUpdate({
      ...globalStyles,
      [field]: value
    });
  };

  const handleColorChange = (field, value) => {
    if (globalStyles.useGlobalColors) {
      handleUpdateStyle('globalColor', value);
    } else {
      handleUpdateStyle(field, value);
    }
  };

  return (
    <div className="space-y-6">
      {/* Typography Settings */}
      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-4">Typography</h3>
        <select
          value={globalStyles.fontStyle || 'default'}
          onChange={(e) => handleUpdateStyle('fontStyle', e.target.value)}
          className="w-full bg-blue-900/30 border border-blue-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
        >
          {Object.entries(FONT_STYLES).map(([key, value]) => (
            <option key={key} value={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Color Settings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-300">Colors</h3>
          <button
            onClick={() => handleUpdateStyle('useGlobalColors', !globalStyles.useGlobalColors)}
            className="flex items-center gap-2 text-sm text-gray-300"
          >
            {globalStyles.useGlobalColors ? (
              <ToggleRight className="w-5 h-5 text-cyan-400" />
            ) : (
              <ToggleLeft className="w-5 h-5" />
            )}
            Global Colors
          </button>
        </div>

        {globalStyles.useGlobalColors ? (
          <div>
            <label className="block text-xs text-gray-400 mb-2">Global Color</label>
            <input
              type="color"
              value={globalStyles.globalColor || '#000000'}
              onChange={(e) => handleUpdateStyle('globalColor', e.target.value)}
              className="w-full h-10 rounded-lg cursor-pointer"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {['headerBg', 'mainBg', 'footerBg'].map((colorKey) => (
              <div key={colorKey}>
                <label className="block text-xs text-gray-400 mb-2">
                  {colorKey.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                </label>
                <input
                  type="color"
                  value={globalStyles[colorKey] || '#000000'}
                  onChange={(e) => handleColorChange(colorKey, e.target.value)}
                  className="w-full h-10 rounded-lg cursor-pointer"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Button Style Settings */}
      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-4">Button Style</h3>
        <select
          value={globalStyles.buttonStyle || 'default'}
          onChange={(e) => handleUpdateStyle('buttonStyle', e.target.value)}
          className="w-full bg-blue-900/30 border border-blue-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
        >
          {Object.keys(BUTTON_STYLES).map((style) => (
            <option key={style} value={style}>
              {style.charAt(0).toUpperCase() + style.slice(1)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default StyleSettings;
