import React from 'react';
import { X } from 'lucide-react';
import DinoGame from './DinoGame';

const GameModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-blue-950/95 p-6 rounded-xl max-w-4xl w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 bg-gradient-to-r from-cyan-600 to-blue-600 p-2 rounded-full text-white hover:opacity-90 transition-opacity"
        >
          <X className="h-5 w-5" />
        </button>
        
        <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent text-center">
          StickMan Runner
        </h3>
        
        <DinoGame />
      </div>
    </div>
  );
};

export default GameModal;
