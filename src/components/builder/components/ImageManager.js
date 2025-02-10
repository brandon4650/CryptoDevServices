import React, { useState } from 'react';
import { Image as ImageIcon, Move, Maximize } from 'lucide-react';

const ImageManager = ({ 
  backgroundImage, 
  position = { x: 0, y: 0 }, 
  size = { width: '100%', height: 'auto' },
  onImageChange,
  onPositionChange,
  onSizeChange,
  isFullBackground = false 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ width: 0, height: 0 });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onImageChange(e.target.result);
      };
      reader.readAsDataURL(file);
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

  const handleResizeStart = (e) => {
    e.preventDefault();
    setIsResizing(true);
    setResizeStart({
      width: parseInt(size.width),
      height: parseInt(size.height),
      x: e.clientX,
      y: e.clientY
    });
  };

  const handleResize = (e) => {
    if (isResizing) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      onSizeChange({
        width: `${resizeStart.width + deltaX}px`,
        height: `${resizeStart.height + deltaY}px`
      });
    }
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
  };

  React.useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', isDragging ? handleDrag : handleResize);
      window.addEventListener('mouseup', isDragging ? handleDragEnd : handleResizeEnd);
      
      return () => {
        window.removeEventListener('mousemove', isDragging ? handleDrag : handleResize);
        window.removeEventListener('mouseup', isDragging ? handleDragEnd : handleResizeEnd);
      };
    }
  }, [isDragging, isResizing]);

  return (
    <div className="relative">
      <div className="mb-4 space-y-2">
        <label className="flex items-center gap-2 px-4 py-2 bg-blue-900/30 hover:bg-blue-900/40 rounded-lg cursor-pointer">
          <ImageIcon className="w-4 h-4 text-cyan-400" />
          <span className="text-sm text-gray-300">
            {isFullBackground ? 'Choose Background Image' : 'Upload Image'}
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>
      </div>

      {backgroundImage && (
        <div 
          className="relative group"
          style={{
            position: 'relative',
            width: size.width,
            height: size.height
          }}
        >
          <img
            src={backgroundImage}
            alt="Background"
            className="w-full h-full object-cover"
            style={{
              position: isFullBackground ? 'fixed' : 'absolute',
              top: position.y,
              left: position.x,
              width: size.width,
              height: size.height,
              zIndex: isFullBackground ? -1 : 'auto'
            }}
          />
          
          {!isFullBackground && (
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Drag handle */}
              <button
                onMouseDown={handleDragStart}
                className="absolute top-2 left-2 p-1 bg-blue-900/80 rounded text-white hover:bg-blue-800"
              >
                <Move className="w-4 h-4" />
              </button>
              
              {/* Resize handle */}
              <button
                onMouseDown={handleResizeStart}
                className="absolute bottom-2 right-2 p-1 bg-blue-900/80 rounded text-white hover:bg-blue-800"
              >
                <Maximize className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageManager;
