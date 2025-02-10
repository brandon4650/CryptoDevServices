import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, Move, Maximize, LayoutGrid, Trash2 } from 'lucide-react';

const ImageManager = ({ 
  backgroundImage, 
  position = { x: 0, y: 0 }, 
  size = { width: '100%', height: '100%' },
  onImageChange,
  onPositionChange,
  onSizeChange,
  isFullBackground = false 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [sizeScale, setSizeScale] = useState(100);
  const [isBgMode, setIsBgMode] = useState(true);
  const [originalImageSize, setOriginalImageSize] = useState(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setOriginalImageSize({ width: img.width, height: img.height });
          onImageChange(e.target.result);
          // Set initial position to center
          const containerWidth = containerRef.current?.offsetWidth || 800;
          const containerHeight = containerRef.current?.offsetHeight || 600;
          onPositionChange({ 
            x: (containerWidth - img.width) / 2,
            y: (containerHeight - img.height) / 2
          });
          setSizeScale(100);
          onSizeChange({
            width: `${img.width}px`,
            height: `${img.height}px`
          });
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSizeChange = (newScale) => {
    setSizeScale(newScale);
    if (originalImageSize) {
      const newWidth = (originalImageSize.width * newScale) / 100;
      const newHeight = (originalImageSize.height * newScale) / 100;
      onSizeChange({
        width: `${newWidth}px`,
        height: `${newHeight}px`
      });
    }
  };

  const handleDragStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleDrag = (e) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      onPositionChange({ x: newX, y: newY });
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleDragEnd);
      return () => {
        window.removeEventListener('mousemove', handleDrag);
        window.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging]);

  return (
    <div className="relative" ref={containerRef}>
      <div className="mb-4 space-y-3">
        <div className="flex items-center gap-2">
          <label className="flex-1 flex items-center gap-2 px-4 py-2 bg-blue-900/30 hover:bg-blue-900/40 rounded-lg cursor-pointer">
            <ImageIcon className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-gray-300">Choose Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
          
          {backgroundImage && (
            <button
              onClick={() => onImageChange(null)}
              className="px-4 py-2 bg-red-900/30 hover:bg-red-900/40 rounded-lg text-red-400 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm">Remove</span>
            </button>
          )}
        </div>

        {backgroundImage && !isFullBackground && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBgMode(!isBgMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                isBgMode ? 'bg-cyan-600/50 text-white' : 'bg-blue-900/30 text-gray-300'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="text-sm">Background Mode</span>
            </button>
          </div>
        )}

        {backgroundImage && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Image Size: {sizeScale}%
            </label>
            <input
              type="range"
              min="10"
              max="200"
              value={sizeScale}
              onChange={(e) => handleSizeChange(parseInt(e.target.value))}
              className="w-full h-2 bg-blue-900/30 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        )}
      </div>

      {backgroundImage && (
        <div 
          className="relative bg-blue-900/20 rounded-lg overflow-hidden"
          style={{ height: '200px' }}
        >
          <div 
            className="absolute inset-0"
            style={{
              cursor: isDragging ? 'grabbing' : 'grab',
            }}
            onMouseDown={handleDragStart}
          >
            <img
              ref={imageRef}
              src={backgroundImage}
              alt="Background"
              className={isBgMode ? 'w-full h-full object-cover' : ''}
              style={{
                position: 'absolute',
                transform: `translate(${position.x}px, ${position.y}px)`,
                width: size.width,
                height: size.height,
                transition: isDragging ? 'none' : 'transform 0.1s ease-out'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageManager;
