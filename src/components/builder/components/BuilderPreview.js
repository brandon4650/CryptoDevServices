import React from 'react';
import { Smartphone, Monitor, Tablet, X, ChevronUp, ChevronDown, Settings, Trash2 } from 'lucide-react';

const PreviewModes = {
  DESKTOP: { width: '100%', label: 'Desktop' },
  TABLET: { width: '768px', label: 'Tablet' },
  MOBILE: { width: '375px', label: 'Mobile' }
};

const BuilderPreview = ({ 
  sections, 
  previewMode = 'DESKTOP',
  onRemoveSection,
  onMoveSection,
  onSelectSection,
  selectedSection
}) => {
  const renderSection = (section) => {
    // Return preview HTML based on section type
    switch (section.type) {
      case 'HERO':
        return (
          <div className="text-center py-20 px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              {section.data.title}
            </h1>
            <p className="mt-6 text-xl text-gray-300 max-w-2xl mx-auto">
              {section.data.subtitle}
            </p>
            {section.data.hasButton && (
              <button className="mt-8 px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg text-white text-lg font-medium hover:opacity-90 transition-opacity">
                {section.data.buttonText}
              </button>
            )}
          </div>
        );

      case 'FEATURES':
        return (
          <div className="py-20 px-4">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              {section.data.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {section.data.features.map((feature, idx) => (
                <div 
                  key={idx}
                  className="bg-blue-900/30 rounded-lg p-6 hover:bg-blue-900/40 transition-colors"
                >
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'TOKENOMICS':
        return (
          <div className="py-20 px-4">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              {section.data.title}
            </h2>
            <div className="flex flex-wrap justify-center gap-8 max-w-4xl mx-auto">
              {section.data.distribution.map((item, idx) => (
                <div 
                  key={idx}
                  className="text-center bg-blue-900/30 rounded-lg p-6 w-48"
                >
                  <div className="text-4xl font-bold text-cyan-400">
                    {item.value}%
                  </div>
                  <div className="mt-2 text-gray-300">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      // Add more section type previews as needed
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 bg-blue-900/10 rounded-lg overflow-hidden">
      {/* Preview Header */}
      <div className="bg-blue-900/20 border-b border-blue-800/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              className={`p-2 rounded ${previewMode === 'DESKTOP' ? 'bg-blue-800/50 text-white' : 'text-gray-400 hover:text-white'}`}
              title="Desktop view"
            >
              <Monitor className="w-5 h-5" />
            </button>
            <button 
              className={`p-2 rounded ${previewMode === 'TABLET' ? 'bg-blue-800/50 text-white' : 'text-gray-400 hover:text-white'}`}
              title="Tablet view"
            >
              <Tablet className="w-5 h-5" />
            </button>
            <button 
              className={`p-2 rounded ${previewMode === 'MOBILE' ? 'bg-blue-800/50 text-white' : 'text-gray-400 hover:text-white'}`}
              title="Mobile view"
            >
              <Smartphone className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className="p-4 overflow-auto h-[calc(100vh-10rem)]">
        <div 
          className="bg-gray-900 min-h-[800px] mx-auto transition-all duration-300 overflow-hidden"
          style={{ width: PreviewModes[previewMode].width }}
        >
          {sections.map((section, index) => (
            <div 
              key={section.id}
              className={`relative group ${
                selectedSection === section.id ? 'ring-2 ring-cyan-500' : ''
              }`}
            >
              {/* Section Controls */}
              <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onMoveSection(index, 'up')}
                  className="p-1 bg-blue-900/80 hover:bg-blue-800 rounded text-white"
                  disabled={index === 0}
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onMoveSection(index, 'down')}
                  className="p-1 bg-blue-900/80 hover:bg-blue-800 rounded text-white"
                  disabled={index === sections.length - 1}
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onSelectSection(section.id)}
                  className="p-1 bg-blue-900/80 hover:bg-blue-800 rounded text-white"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onRemoveSection(section.id)}
                  className="p-1 bg-red-900/80 hover:bg-red-800 rounded text-white"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              {/* Section Content */}
              {renderSection(section)}
            </div>
          ))}

          {sections.length === 0 && (
            <div className="h-[800px] flex items-center justify-center text-gray-400">
              <p>Add components from the panel to start building</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuilderPreview;
