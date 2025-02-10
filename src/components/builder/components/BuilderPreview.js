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
case 'TOKEN_INFO':
  return (
    <div className="flex items-center justify-center gap-8 py-4 px-4 bg-[#1a1a1a]/50">
      <div className="flex items-center gap-2">
        <span className="text-gray-400">Price:</span>
        <span className="text-white">{section.data.price}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-gray-400">24h:</span>
        <span className={section.data.change24h?.startsWith('-') ? 'text-red-500' : 'text-green-500'}>
          {section.data.change24h}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-gray-400">Market Cap:</span>
        <span className="text-white">{section.data.marketCap}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-gray-400">24h Volume:</span>
        <span className="text-white">{section.data.volume24h}</span>
      </div>
    </div>
  );

case 'CONTRACT_ADDRESS':
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      <div className="text-xl text-[#f0b90b] mb-4">{section.data.label}</div>
      <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-lg p-3">
        <span className="text-gray-300">{section.data.address}</span>
        <button 
          onClick={() => navigator.clipboard.writeText(section.data.address)}
          className="px-4 py-1 bg-[#f0b90b] text-black rounded hover:bg-[#f0b90b]/80 transition-colors"
        >
          Copy
        </button>
      </div>
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
         case 'ROADMAP':
  return (
    <div className="py-20 px-4">
      <h2 className="text-3xl font-bold text-white text-center mb-12">
        {section.data.title}
      </h2>
      <div className="max-w-4xl mx-auto space-y-8">
        {section.data.phases?.map((phase, idx) => (
          <div key={idx} className="bg-blue-900/30 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              {phase.title}
            </h3>
            <ul className="space-y-2">
              {phase.items?.map((item, itemIdx) => (
                <li key={itemIdx} className="text-gray-300 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );

case 'TEAM':
  return (
    <div className="py-20 px-4">
      <h2 className="text-3xl font-bold text-white text-center mb-4">
        {section.data.title}
      </h2>
      <p className="text-gray-300 text-center max-w-2xl mx-auto mb-12">
        {section.data.description}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {section.data.members?.map((member, idx) => (
          <div key={idx} className="bg-blue-900/30 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-1">
              {member.name}
            </h3>
            <p className="text-cyan-400 text-sm mb-4">{member.role}</p>
            <p className="text-gray-300">{member.description}</p>
          </div>
        ))}
      </div>
    </div>
  );

case 'PARTNERS':
  return (
    <div className="py-20 px-4">
      <h2 className="text-3xl font-bold text-white text-center mb-4">
        {section.data.title}
      </h2>
      <p className="text-gray-300 text-center max-w-2xl mx-auto mb-12">
        {section.data.description}
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
        {section.data.partners?.map((partner, idx) => (
          <a
            key={idx}
            href={partner.link}
            className="bg-blue-900/30 rounded-lg p-6 hover:bg-blue-900/40 transition-colors text-center"
          >
            <div className="text-white font-medium">{partner.name}</div>
          </a>
        ))}
      </div>
    </div>
  );

case 'SOCIALS':
  return (
    <div className="py-20 px-4">
      <h2 className="text-3xl font-bold text-white text-center mb-4">
        {section.data.title}
      </h2>
      <p className="text-gray-300 text-center max-w-2xl mx-auto mb-12">
        {section.data.description}
      </p>
      <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
        {section.data.links?.map((link, idx) => (
          <a
            key={idx}
            href={link.url}
            className="px-6 py-3 bg-blue-900/30 hover:bg-blue-900/40 rounded-lg text-white transition-colors"
          >
            {link.platform}
          </a>
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
             style={{
               backgroundImage: section.data.backgroundImage ? `url(${section.data.backgroundImage})` : undefined,
               backgroundPosition: section.data.backgroundPosition ? 
                `${section.data.backgroundPosition.x}px ${section.data.backgroundPosition.y}px` : 'center',
               backgroundSize: section.data.backgroundSize ? 
                `${section.data.backgroundSize.width} ${section.data.backgroundSize.height}` : 'cover',
               backgroundRepeat: 'no-repeat'
             }}
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
