import React from 'react';
import { X, Plus, Minus } from 'lucide-react';
import ImageManager from './ImageManager';

const ComponentEditor = ({ section, onUpdate, onClose }) => {
  const updateField = (field, value) => {
  // Create a new data object with the updated field
  const newData = {
    ...section.data,
    [field]: value,
    // Keep track of the isBgMode flag
    isBgMode: field === 'backgroundImage' ? true : section.data.isBgMode
  };

  // If updating background image settings, ensure we maintain all related properties
  if (field === 'backgroundImage' || field === 'backgroundPosition' || field === 'backgroundSize') {
    // If setting a new background image, initialize with default values
    if (field === 'backgroundImage') {
      newData.backgroundPosition = { x: 0, y: 0 };
      newData.backgroundSize = { width: '100%', height: '100%' };
      newData.isBgMode = true;
    }
  }

  // Log the update for debugging
  console.log('Updating section:', {
    field,
    value,
    newData
  });

  onUpdate({
    ...section,
    data: newData
  });
};

    const BackgroundSettings = () => (
    <div className="mb-6 pb-6 border-b border-blue-800/50">
      <h4 className="text-sm font-medium text-gray-300 mb-4">Background Settings</h4>
      <ImageManager
        backgroundImage={section.data.backgroundImage}
        position={section.data.backgroundPosition || { x: 0, y: 0 }}
        size={section.data.backgroundSize || { width: '100%', height: '100%' }}
        onImageChange={(image) => updateField('backgroundImage', image)}
        onPositionChange={(position) => updateField('backgroundPosition', position)}
        onSizeChange={(size) => updateField('backgroundSize', size)}
        isFullBackground={false}
      />
    </div>
  );

  const renderEditor = () => {
    switch (section.type) {
      case 'HERO':
        return (
          <>
          <BackgroundSettings />
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
         </>
        );

case 'TOKEN_INFO':
  return (
    <>
      <BackgroundSettings />
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Token Price
        </label>
        <input
          type="text"
          value={section.data.price}
          onChange={(e) => updateField('price', e.target.value)}
          className="w-full bg-blue-900/30 border border-blue-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
          placeholder="e.g. $0.00001234"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          24h Change
        </label>
        <input
          type="text"
          value={section.data.change24h}
          onChange={(e) => updateField('change24h', e.target.value)}
          className="w-full bg-blue-900/30 border border-blue-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
          placeholder="e.g. -8.05%"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Market Cap
        </label>
        <input
          type="text"
          value={section.data.marketCap}
          onChange={(e) => updateField('marketCap', e.target.value)}
          className="w-full bg-blue-900/30 border border-blue-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
          placeholder="e.g. $7.32K"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          24h Volume
        </label>
        <input
          type="text"
          value={section.data.volume24h}
          onChange={(e) => updateField('volume24h', e.target.value)}
          className="w-full bg-blue-900/30 border border-blue-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
          placeholder="e.g. $218.44"
        />
      </div>
    </div>
   </>
  );

case 'CONTRACT_ADDRESS':
  return (
    <>
      <BackgroundSettings />
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Label
        </label>
        <input
          type="text"
          value={section.data.label}
          onChange={(e) => updateField('label', e.target.value)}
          className="w-full bg-blue-900/30 border border-blue-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
          placeholder="e.g. Contract Address (CA):"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Contract Address
        </label>
        <input
          type="text"
          value={section.data.address}
          onChange={(e) => updateField('address', e.target.value)}
          className="w-full bg-blue-900/30 border border-blue-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
          placeholder="Enter contract address"
        />
      </div>
    </div>
   </>
  );

      case 'FEATURES':
        return (
          <>
      <BackgroundSettings />
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
              {section.data.features?.map((feature, index) => (
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
              <button
                onClick={() => {
                  const newFeatures = [...(section.data.features || [])];
                  newFeatures.push({ title: 'New Feature', description: 'Feature Description' });
                  updateField('features', newFeatures);
                }}
                className="w-full mt-2 p-2 bg-blue-900/30 hover:bg-blue-900/50 rounded-lg text-cyan-400 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Feature
              </button>
            </div>
          </div>
         </>
        );

      case 'TOKENOMICS':
  return (
    <>
      <BackgroundSettings />
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
          Total Supply
        </label>
        <input
          type="text"
          value={section.data.supply}
          onChange={(e) => updateField('supply', e.target.value)}
          className="w-full bg-blue-900/30 border border-blue-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Distribution
        </label>
        {section.data.distribution?.map((item, index) => (
          <div key={index} className="mb-4 p-4 bg-blue-900/20 rounded-lg">
            <input
              type="text"
              value={item.label}
              onChange={(e) => {
                const newDist = [...section.data.distribution];
                newDist[index].label = e.target.value;
                updateField('distribution', newDist);
              }}
              className="w-full bg-blue-900/30 border border-blue-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 mb-2"
              placeholder="Label"
            />
            <input
              type="number"
              value={item.value}
              onChange={(e) => {
                const newDist = [...section.data.distribution];
                newDist[index].value = parseFloat(e.target.value);
                updateField('distribution', newDist);
              }}
              className="w-full bg-blue-900/30 border border-blue-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
              placeholder="Percentage"
            />
          </div>
        ))}
        <button
          onClick={() => {
            const newDist = [...(section.data.distribution || [])];
            newDist.push({ label: 'New Category', value: 0 });
            updateField('distribution', newDist);
          }}
          className="w-full mt-2 p-2 bg-blue-900/30 hover:bg-blue-900/50 rounded-lg text-cyan-400 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>
    </div>
   </>
  );
       case 'ROADMAP':
  return (
    <>
      <BackgroundSettings />
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
          Phases
        </label>
        {section.data.phases?.map((phase, phaseIndex) => (
          <div key={phaseIndex} className="mb-4 p-4 bg-blue-900/20 rounded-lg">
            <input
              type="text"
              value={phase.title}
              onChange={(e) => {
                const newPhases = [...section.data.phases];
                newPhases[phaseIndex].title = e.target.value;
                updateField('phases', newPhases);
              }}
              className="w-full bg-blue-900/30 border border-blue-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 mb-2"
              placeholder="Phase Title"
            />
            <div className="space-y-2">
              {phase.items?.map((item, itemIndex) => (
                <div key={itemIndex} className="flex gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const newPhases = [...section.data.phases];
                      newPhases[phaseIndex].items[itemIndex] = e.target.value;
                      updateField('phases', newPhases);
                    }}
                    className="flex-1 bg-blue-900/30 border border-blue-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                    placeholder="Roadmap Item"
                  />
                  <button
                    onClick={() => {
                      const newPhases = [...section.data.phases];
                      newPhases[phaseIndex].items = newPhases[phaseIndex].items.filter((_, i) => i !== itemIndex);
                      updateField('phases', newPhases);
                    }}
                    className="p-2 bg-red-900/30 hover:bg-red-900/50 rounded-lg text-red-400 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newPhases = [...section.data.phases];
                  if (!newPhases[phaseIndex].items) {
                    newPhases[phaseIndex].items = [];
                  }
                  newPhases[phaseIndex].items.push('New Item');
                  updateField('phases', newPhases);
                }}
                className="w-full mt-2 p-2 bg-blue-900/30 hover:bg-blue-900/50 rounded-lg text-cyan-400 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={() => {
            const newPhases = [...(section.data.phases || [])];
            newPhases.push({
              title: 'New Phase',
              items: ['New Item']
            });
            updateField('phases', newPhases);
          }}
          className="w-full mt-2 p-2 bg-blue-900/30 hover:bg-blue-900/50 rounded-lg text-cyan-400 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Phase
        </button>
      </div>
    </div>
   </>
  );


      case 'TEAM':
        return (
          <>
      <BackgroundSettings />
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
                Description
              </label>
              <textarea
                value={section.data.description}
                onChange={(e) => updateField('description', e.target.value)}
                className="w-full bg-blue-900/30 border border-blue-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 h-24"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Team Members
              </label>
              {section.data.members?.map((member, index) => (
                <div key={index} className="mb-4 p-4 bg-blue-900/20 rounded-lg">
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => {
                      const newMembers = [...section.data.members];
                      newMembers[index].name = e.target.value;
                      updateField('members', newMembers);
                    }}
                    className="w-full bg-blue-900/30 border border-blue-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 mb-2"
                    placeholder="Member Name"
                  />
                  <input
                    type="text"
                    value={member.role}
                    onChange={(e) => {
                      const newMembers = [...section.data.members];
                      newMembers[index].role = e.target.value;
                      updateField('members', newMembers);
                    }}
                    className="w-full bg-blue-900/30 border border-blue-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 mb-2"
                    placeholder="Member Role"
                  />
                  <textarea
                    value={member.description}
                    onChange={(e) => {
                      const newMembers = [...section.data.members];
                      newMembers[index].description = e.target.value;
                      updateField('members', newMembers);
                    }}
                    className="w-full bg-blue-900/30 border border-blue-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                    placeholder="Member Description"
                  />
                </div>
              ))}
              <button
                onClick={() => {
                  const newMembers = [...(section.data.members || [])];
                  newMembers.push({
                    name: 'New Member',
                    role: 'Role',
                    description: 'Description'
                  });
                  updateField('members', newMembers);
                }}
                className="w-full mt-2 p-2 bg-blue-900/30 hover:bg-blue-900/50 rounded-lg text-cyan-400 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Member
              </button>
            </div>
          </div>
         </>
        );

      case 'PARTNERS':
        return (
          <>
      <BackgroundSettings />
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
                Description
              </label>
              <textarea
                value={section.data.description}
                onChange={(e) => updateField('description', e.target.value)}
                className="w-full bg-blue-900/30 border border-blue-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 h-24"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Partners
              </label>
              {section.data.partners?.map((partner, index) => (
                <div key={index} className="mb-4 p-4 bg-blue-900/20 rounded-lg">
                  <input
                    type="text"
                    value={partner.name}
                    onChange={(e) => {
                      const newPartners = [...section.data.partners];
                      newPartners[index].name = e.target.value;
                      updateField('partners', newPartners);
                    }}
                    className="w-full bg-blue-900/30 border border-blue-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 mb-2"
                    placeholder="Partner Name"
                  />
                  <input
                    type="text"
                    value={partner.link}
                    onChange={(e) => {
                      const newPartners = [...section.data.partners];
                      newPartners[index].link = e.target.value;
                      updateField('partners', newPartners);
                    }}
                    className="w-full bg-blue-900/30 border border-blue-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                    placeholder="Partner Link"
                  />
                </div>
              ))}
              <button
                onClick={() => {
                  const newPartners = [...(section.data.partners || [])];
                  newPartners.push({
                    name: 'New Partner',
                    link: '#'
                  });
                  updateField('partners', newPartners);
                }}
                className="w-full mt-2 p-2 bg-blue-900/30 hover:bg-blue-900/50 rounded-lg text-cyan-400 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Partner
              </button>
            </div>
          </div>
          </>
        );

      case 'SOCIALS':
        return (
          <>
      <BackgroundSettings />
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
                Description
              </label>
              <textarea
                value={section.data.description}
                onChange={(e) => updateField('description', e.target.value)}
                className="w-full bg-blue-900/30 border border-blue-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 h-24"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Social Links
              </label>
              {section.data.links?.map((link, index) => (
                <div key={index} className="mb-4 p-4 bg-blue-900/20 rounded-lg">
                  <input
                    type="text"
                    value={link.platform}
                    onChange={(e) => {
                      const newLinks = [...section.data.links];
                      newLinks[index].platform = e.target.value;
                      updateField('links', newLinks);
                    }}
                    className="w-full bg-blue-900/30 border border-blue-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 mb-2"
                    placeholder="Platform Name"
                  />
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) => {
                      const newLinks = [...section.data.links];
                      newLinks[index].url = e.target.value;
                      updateField('links', newLinks);
                    }}
                    className="w-full bg-blue-900/30 border border-blue-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                    placeholder="Platform URL"
                  />
                </div>
              ))}
              <button
                onClick={() => {
                  const newLinks = [...(section.data.links || [])];
                  newLinks.push({
                    platform: 'New Platform',
                    url: '#'
                  });
                  updateField('links', newLinks);
                }}
                className="w-full mt-2 p-2 bg-blue-900/30 hover:bg-blue-900/50 rounded-lg text-cyan-400 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Social Link
              </button>
            </div>
          </div>
         </>
        );

      default:
        return (
          <>
          <BackgroundSettings />
          <div className="text-center text-gray-400 py-8">
            No editor available for this component type
          </div>
         </>
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
      <div className="p-4 max-h-[calc(100vh-10rem)] overflow-y-auto">
        {renderEditor()}
      </div>
    </div>
  );
};

export default ComponentEditor;
