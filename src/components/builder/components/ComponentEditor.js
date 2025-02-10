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
          </div>
        );

      case 'FEATURES':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Section Title
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
                Features
              </label>
              {section.data.features.map((feature, index) => (
                <div key={index} className="mb-4 p-4 bg-blue-900/20 rounded-lg">
                  <input
                    type="text"
                    value={feature.title}
                    onChange={(e) => {
                      const newFeatures = [...section.data.features];
                      newFeatures[index].title = e.target.value;
                      updateField('features', newFeatures);
                    }}
                    className="w-full bg-blue-900/30 border border-blue-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 mb-2"
                    placeholder="Feature Title"
                  />
                  <textarea
                    value={feature.description}
                    onChange={(e) => {
                      const newFeatures = [...section.data.features];
                      newFeatures[index].description = e.target.value;
                      updateField('features', newFeatures);
                    }}
                    className="w-full bg-blue-900/30 border border-blue-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                    placeholder="Feature Description"
                  />
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center text-gray-400 py-8">
            No editor available for this component type
          </div>
        );
    }
  };

  return (
    <div className="w-80 bg-blue-900/20 border border-blue-800/50 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-blue-800/50 flex items-center justify-between">
        <h3 className="font-medium text-white">Edit Component</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Editor Content */}
      <div className="p-4">
        {renderEditor()}
      </div>
    </div>
  );
};

export default ComponentEditor;
