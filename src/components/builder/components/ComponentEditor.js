import React from 'react';
import { X, Plus, Minus } from 'lucide-react';

const ComponentEditor = ({ section, onUpdate, onClose }) => {
  const updateField = (field, value) => {
    onUpdate({
      ...section,
      data: {
        ...section.data,
        [field]: value
      }
    });
  };

  const renderEditor = () => {
    switch (section.type) {
      case 'HERO':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={section.data.title}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full bg-blue-900/30 border border-blue-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Subtitle
              </label>
              <textarea
                value={section.data.subtitle}
                onChange={(e) => updateField('subtitle', e.target.value)}
                className="w-full bg-blue-900/30 border border-blue-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 h-24"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hasButton"
                checked={section.data.hasButton}
                onChange={(e) => updateField('hasButton', e.target.checked)}
                className="rounded border-blue-800/50 bg-blue-900/30 text-cyan-500 focus:ring-cyan-500"
              />
              <label htmlFor="hasButton" className="text-sm text-gray-300">
                Show Button
              </label>
            </div>

            {section.data.hasButton && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Button Text
                </label>
                <input
                  type="text"
                  value={section.data.buttonText}
                  onChange={(e) => updateField('buttonText', e.target.value)}
                  className="w-full bg-blue-900/30 border border-blue-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}
