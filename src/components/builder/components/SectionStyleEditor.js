import React from 'react';
import { useStyle } from '../contexts/StyleContext';

const FONT_STYLES = {
  'inherit': 'Inherit from Global',
  'default': 'Default',
  'modern': 'Modern',
  'elegant': 'Elegant',
  'playful': 'Playful',
  'bold': 'Bold',
  'minimal': 'Minimal'
};

const SectionStyleEditor = ({ section, onUpdate }) => {
  const { globalStyles } = useStyle();

  const handleStyleUpdate = (field, value) => {
    const newData = {
      ...section.data,
      styles: {
        ...section.data.styles,
        [field]: value
      }
    };
    onUpdate({
      ...section,
      data: newData
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Text Style
        </label>
        <select
          value={section.data.styles?.fontStyle || 'inherit'}
          onChange={(e) => handleStyleUpdate('fontStyle', e.target.value)}
          className="w-full bg-blue-900/30 border border-blue-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
        >
          {Object.entries(FONT_STYLES).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Background Color
        </label>
        <input
          type="color"
          value={section.data.styles?.backgroundColor || '#000000'}
          onChange={(e) => handleStyleUpdate('backgroundColor', e.target.value)}
          className="w-full h-10 rounded-lg cursor-pointer"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Text Color
        </label>
        <input
          type="color"
          value={section.data.styles?.textColor || '#ffffff'}
          onChange={(e) => handleStyleUpdate('textColor', e.target.value)}
          className="w-full h-10 rounded-lg cursor-pointer"
        />
      </div>

      {section.data.hasButton && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Button Style
          </label>
          <select
            value={section.data.styles?.buttonStyle || 'inherit'}
            onChange={(e) => handleStyleUpdate('buttonStyle', e.target.value)}
            className="w-full bg-blue-900/30 border border-blue-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="inherit">Inherit from Global</option>
            <option value="default">Default</option>
            <option value="outlined">Outlined</option>
            <option value="minimal">Minimal</option>
            <option value="rounded">Rounded</option>
            <option value="glass">Glass</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default SectionStyleEditor;
