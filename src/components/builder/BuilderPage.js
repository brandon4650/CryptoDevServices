import React, { useState } from 'react';
import BuilderPanel from './components/BuilderPanel';
import BuilderPreview from './components/BuilderPreview';
import ComponentEditor from './components/ComponentEditor';
import ImageManager from './components/ImageManager';
import { Eye, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const BuilderPage = () => {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [previewMode, setPreviewMode] = useState('DESKTOP');
  const [isFullPreview, setIsFullPreview] = useState(false);
  
  // Image management state
  const [pageBackground, setPageBackground] = useState(null);
  const [pageBackgroundPosition, setPageBackgroundPosition] = useState({ x: 0, y: 0 });
  const [pageBackgroundSize, setPageBackgroundSize] = useState({ width: '100%', height: '100%' });

  const handleAddComponent = (type) => {
    const newSection = {
      id: Date.now(),
      type,
      data: getDefaultData(type)
    };
    setSections([...sections, newSection]);
  };

  const handleUpdateSection = (updatedSection) => {
    setSections(sections.map(section => 
      section.id === updatedSection.id ? updatedSection : section
    ));
  };

  const handleRemoveSection = (id) => {
    setSections(sections.filter(section => section.id !== id));
    if (selectedSection === id) setSelectedSection(null);
  };

  const handleMoveSection = (index, direction) => {
    const newSections = [...sections];
    if (direction === 'up' && index > 0) {
      [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
    } else if (direction === 'down' && index < sections.length - 1) {
      [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
    }
    setSections(newSections);
  };

  const getDefaultData = (type) => {
    switch (type) {
      case 'HERO':
        return {
          title: 'Welcome to Our Site',
          subtitle: 'Discover the future of crypto',
          hasButton: true,
          buttonText: 'Get Started',
          backgroundImage: null,
          backgroundPosition: { x: 0, y: 0 },
          backgroundSize: { width: '100%', height: '100%' }
        };
      case 'FEATURES':
        return {
          title: 'Our Features',
          features: [
            { title: 'Secure', description: 'Built with security in mind' },
            { title: 'Fast', description: 'Lightning-fast transactions' },
            { title: 'Scalable', description: 'Built for growth' }
          ],
          backgroundImage: null,
          backgroundPosition: { x: 0, y: 0 },
          backgroundSize: { width: '100%', height: '100%' }
        };
      case 'TOKEN_INFO':
        return {
          price: '$0.000001234',
          change24h: '-8.05%',
          marketCap: '$7.32K',
          volume24h: '$218.44',
          backgroundImage: null,
          backgroundPosition: { x: 0, y: 0 },
          backgroundSize: { width: '100%', height: '100%' }
        };
      case 'CONTRACT_ADDRESS':
        return {
          label: 'Contract Address (CA):',
          address: '0x1234...5678',
          backgroundImage: null,
          backgroundPosition: { x: 0, y: 0 },
          backgroundSize: { width: '100%', height: '100%' }
        };
      case 'TOKENOMICS':
        return {
          title: 'Tokenomics',
          supply: '1,000,000',
          distribution: [
            { label: 'Presale', value: 60 },
            { label: 'Liquidity', value: 30 },
            { label: 'Team', value: 10 }
          ],
          backgroundImage: null,
          backgroundPosition: { x: 0, y: 0 },
          backgroundSize: { width: '100%', height: '100%' }
        };
      case 'ROADMAP':
        return {
          title: 'Our Roadmap',
          phases: [
            { title: 'Phase 1', items: ['Launch', 'Marketing', 'Community Building'] },
            { title: 'Phase 2', items: ['Exchange Listings', 'Partnerships', 'Development'] }
          ],
          backgroundImage: null,
          backgroundPosition: { x: 0, y: 0 },
          backgroundSize: { width: '100%', height: '100%' }
        };
      case 'TEAM':
        return {
          title: 'Our Team',
          description: 'Meet the people behind the project',
          members: [
            { name: 'John Doe', role: 'CEO', description: 'Crypto veteran with 10 years experience' },
            { name: 'Jane Smith', role: 'CTO', description: 'Blockchain developer and security expert' }
          ],
          backgroundImage: null,
          backgroundPosition: { x: 0, y: 0 },
          backgroundSize: { width: '100%', height: '100%' }
        };
      case 'PARTNERS':
        return {
          title: 'Our Partners',
          description: 'Trusted by leading companies in the space',
          partners: [
            { name: 'Partner 1', link: '#' },
            { name: 'Partner 2', link: '#' }
          ],
          backgroundImage: null,
          backgroundPosition: { x: 0, y: 0 },
          backgroundSize: { width: '100%', height: '100%' }
        };
      case 'SOCIALS':
        return {
          title: 'Join Our Community',
          description: 'Connect with us on social media',
          links: [
            { platform: 'Twitter', url: '#' },
            { platform: 'Telegram', url: '#' },
            { platform: 'Discord', url: '#' }
          ],
          backgroundImage: null,
          backgroundPosition: { x: 0, y: 0 },
          backgroundSize: { width: '100%', height: '100%' }
        };
      default:
        return {};
    }
  };

  return (
    <div 
      className="min-h-screen bg-gray-900 relative"
      style={{
        backgroundImage: pageBackground ? `url(${pageBackground})` : undefined,
        backgroundPosition: `${pageBackgroundPosition.x}px ${pageBackgroundPosition.y}px`,
        backgroundSize: `${pageBackgroundSize.width} ${pageBackgroundSize.height}`,
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Header */}
      <header className="bg-blue-900/50 border-b border-blue-800/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2">
                <ArrowLeft className="w-5 h-5" />
                Back to Home
              </Link>
              <span className="text-white font-medium">Website Builder</span>
            </div>
            <button
              onClick={() => setIsFullPreview(!isFullPreview)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 rounded-lg text-white"
            >
              <Eye className="w-4 h-4" />
              {isFullPreview ? 'Exit Preview' : 'Preview'}
            </button>
          </div>
        </div>
        
        {/* Background Manager */}
        {!isFullPreview && (
          <div className="border-t border-blue-800/50 p-4">
            <div className="max-w-7xl mx-auto">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Page Background</h3>
              <ImageManager
                backgroundImage={pageBackground}
                position={pageBackgroundPosition}
                size={pageBackgroundSize}
                onImageChange={setPageBackground}
                onPositionChange={setPageBackgroundPosition}
                onSizeChange={setPageBackgroundSize}
                isFullBackground={true}
              />
            </div>
          </div>
        )}
      </header>

      {/* Builder Interface */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {!isFullPreview && (
            <BuilderPanel
              onAddComponent={handleAddComponent}
              activeSection={selectedSection}
              onSelectSection={setSelectedSection}
            />
          )}
          
          <BuilderPreview
            sections={sections}
            previewMode={previewMode}
            onRemoveSection={handleRemoveSection}
            onMoveSection={handleMoveSection}
            onSelectSection={setSelectedSection}
            selectedSection={selectedSection}
          />

          {!isFullPreview && selectedSection && (
            <ComponentEditor
              section={sections.find(s => s.id === selectedSection)}
              onUpdate={handleUpdateSection}
              onClose={() => setSelectedSection(null)}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default BuilderPage;
