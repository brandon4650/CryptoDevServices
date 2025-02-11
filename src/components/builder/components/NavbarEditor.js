import React from 'react';
import { Plus, Minus } from 'lucide-react';

const NavbarEditor = ({ 
  navData, 
  onUpdate,
  onClose 
}) => {
  const handleUpdateField = (field, value) => {
    onUpdate({
      ...navData,
      [field]: value
    });
  };

  const handleAddNavItem = () => {
    const newItems = [...(navData.items || [])];
    newItems.push({ label: 'New Link', url: '#' });
    handleUpdateField('items', newItems);
  };

  const handleUpdateNavItem = (index, field, value) => {
    const newItems = [...navData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };
    handleUpdateField('items', newItems);
  };

  const handleRemoveNavItem = (index) => {
    const newItems = navData.items.filter((_, i) => i !== index);
    handleUpdateField('items', newItems);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Website Title
        </label>
        <input
          type="text"
          value={navData.title || ''}
          onChange={(e) => handleUpdateField('title', e.target.value)}
          className="w-full bg-blue-900/30 border border-blue-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
          placeholder="Enter website title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Navigation Items
        </label>
        {navData.items?.map((item, index) => (
          <div key={index} className="mb-4 p-4 bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={item.label}
                onChange={(e) => handleUpdateNavItem(index, 'label', e.target.value)}
                className="flex-1 bg-blue-900/30 border border-blue-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                placeholder="Link Label"
              />
              <button
                onClick={() => handleRemoveNavItem(index)}
                className="p-2 bg-red-900/30 hover:bg-red-900/50 rounded-lg text-red-400 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              value={item.url}
              onChange={(e) => handleUpdateNavItem(index, 'url', e.target.value)}
              className="w-full bg-blue-900/30 border border-blue-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
              placeholder="Link URL"
            />
          </div>
        ))}
        <button
          onClick={handleAddNavItem}
          className="w-full mt-2 p-2 bg-blue-900/30 hover:bg-blue-900/50 rounded-lg text-cyan-400 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Navigation Item
        </button>
      </div>
    </div>
  );
};

export default NavbarEditor;
