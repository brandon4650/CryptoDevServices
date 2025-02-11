import React from 'react';
import { Plus, Settings } from 'lucide-react';

const COMPONENTS = {
  NAVBAR: {
    type: 'NAVBAR',
    label: 'Navigation Bar',
    description: 'Top navigation with customizable links',
    icon: '🎯'
  },
  HERO: {
    type: 'HERO',
    label: 'Hero Section',
    description: 'Main landing section with title and CTA',
    icon: '🚀'
  },
  TOKEN_INFO: {
    type: 'TOKEN_INFO',
    label: 'Token Information',
    description: 'Display token price, market cap, and volume',
    icon: '💰'
  },
  CONTRACT_ADDRESS: {
    type: 'CONTRACT_ADDRESS',
    label: 'Contract Address',
    description: 'Display contract address with copy button',
    icon: '📋'
  },
  FEATURES: {
    type: 'FEATURES',
    label: 'Features Grid',
    description: 'Display key features or benefits',
    icon: '✨'
  },
  TOKENOMICS: {
    type: 'TOKENOMICS',
    label: 'Tokenomics',
    description: 'Token distribution and metrics',
    icon: '📊'
  },
  ROADMAP: {
    type: 'ROADMAP',
    label: 'Roadmap',
    description: 'Project timeline and milestones',
    icon: '🗺️'
  },
  TEAM: {
    type: 'TEAM',
    label: 'Team Section',
    description: 'Team members and roles',
    icon: '👥'
  },
  PARTNERS: {
    type: 'PARTNERS',
    label: 'Partners',
    description: 'Partner logos and information',
    icon: '🤝'
  },
  SOCIALS: {
    type: 'SOCIALS',
    label: 'Social Links',
    description: 'Social media and community links',
    icon: '🌐'
  }
};

const BuilderPanel = ({ onAddComponent, activeSection, onSelectSection }) => {
  return (
    <div className="w-80 bg-blue-900/20 border border-blue-800/50 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-blue-800/50">
        <h2 className="text-lg font-semibold text-white">Components</h2>
        <p className="text-sm text-gray-400">Click to add to your page</p>
      </div>

      {/* Components List */}
      <div className="p-4 space-y-3">
        {Object.entries(COMPONENTS).map(([key, component]) => (
          <button
            key={key}
            onClick={() => onAddComponent(key)}
            className="w-full bg-blue-900/30 hover:bg-blue-800/40 rounded-lg p-3 text-left transition-colors group"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{component.icon}</span>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-white flex items-center justify-between">
                  {component.label}
                  <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400" />
                </h3>
                <p className="text-xs text-gray-400 mt-1">{component.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Settings Panel when section is selected */}
      {activeSection && (
        <div className="border-t border-blue-800/50 p-4">
          <div className="flex items-center gap-2 text-white mb-3">
            <Settings className="w-4 h-4" />
            <span className="text-sm font-medium">Section Settings</span>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => onSelectSection(null)}
              className="w-full px-3 py-2 bg-blue-900/30 hover:bg-blue-800/40 rounded text-sm text-white transition-colors"
            >
              Edit Content
            </button>
            <button
              onClick={() => onSelectSection(null)}
              className="w-full px-3 py-2 bg-blue-900/30 hover:bg-blue-800/40 rounded text-sm text-white transition-colors"
            >
              Style Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuilderPanel;
