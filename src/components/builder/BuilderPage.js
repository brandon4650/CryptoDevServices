import React, { useState } from 'react';
import BuilderPanel from './components/BuilderPanel';
import BuilderPreview from './components/BuilderPreview';
import ComponentEditor from './components/ComponentEditor';
import { Eye, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const BuilderPage = () => {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [previewMode, setPreviewMode] = useState('DESKTOP');
  const [isFullPreview, setIsFullPreview] = useState(false);

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
          buttonText: 'Get Started'
        };
      case 'FEATURES':
        return {
          title: 'Our Features',
          features: [
            { title: 'Secure', description: 'Built with security in mind' },
            { title: 'Fast', description: 'Lightning-fast transactions' },
            { title: 'Scalable', description: 'Built for growth' }
          ]
        };
      // Add more default data for other component types
      default:
        return {};
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
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
