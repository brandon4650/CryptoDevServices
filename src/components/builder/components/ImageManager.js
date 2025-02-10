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
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ width: 0, height: 0 });
  const [isBgMode, setIsBgMode] = useState(true);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onImageChange(e.target.result);
        // Set initial size based on uploaded image
        const img = new Image();
        img.onload = () => {
          const containerWidth = containerRef.current?.offsetWidth || 800;
          const scale = containerWidth / img.width;
          onSizeChange({
            width: `${Math.min(img.width, containerWidth)}px`,
            height: `${Math.min(img.height * scale, containerWidth)}px`
          });
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleRemoveImage = () => {
    onImageChange(null);
    onPositionChange({ x: 0, y: 0 });
    onSizeChange({ width: '100%', height: '100%' });
  };

  const handleDragStart = (e) => {
    if (isBgMode) return;
    e.preventDefault();
    setIsDragging(true);
    const imageRect = imageRef.current.getBoundingClientRect();
    setDragStart({
      x: e.clientX - imageRect.left,
      y: e.clientY - imageRect.top
    });
  };

  const handleDrag = (e) => {
    if (isDragging && !isBgMode) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const newX = e.clientX - dragStart.x - containerRect.left;
      const newY = e.clientY - dragStart.y - containerRect.top;
      onPositionChange({ 
        x: Math.max(0, Math.min(newX, containerRect.width - parseInt(size.width))),
        y: Math.max(0, Math.min(newY, containerRect.height - parseInt(size.height)))
      });
    }
  };

  const handleResizeStart = (e) => {
    if (isBgMode) return;
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
    if (isResizing && !isBgMode) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      const aspectRatio = resizeStart.width / resizeStart.height;
      
      const newWidth = Math.max(50, resizeStart.width + deltaX);
      const newHeight = Math.max(50, newWidth / aspectRatio);
      
      onSizeChange({
        width: `${newWidth}px`,
        height: `${newHeight}px`
      });
    }
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', isDragging ? handleDrag : handleResize);
      window.addEventListener('mouseup', () => {
        setIsDragging(false);
        setIsResizing(false);
      });
      
      return () => {
        window.removeEventListener('mousemove', isDragging ? handleDrag : handleResize);
        window.removeEventListener('mouseup', () => {
          setIsDragging(false);
          setIsResizing(false);
        });
      };
    }
  }, [isDragging, isResizing]);

  return (
    <div className="relative" ref={containerRef}>
      <div className="mb-4 space-y-2">
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
              onClick={handleRemoveImage}
              className="px-4 py-2 bg-red-900/30 hover:bg-red-900/40 rounded-lg text-red-400 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm">Remove</span>
            </button>
          )}
        </div>

        {backgroundImage && (
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
      </div>

      {backgroundImage && (
        <div 
          className="relative bg-blue-900/20 rounded-lg overflow-hidden"
          style={{
            height: '200px'
          }}
        >
          <img
            ref={imageRef}
            src={backgroundImage}
            alt="Background"
            className={`${isBgMode ? 'w-full h-full object-cover' : ''}`}
            style={isBgMode ? {} : {
              position: 'absolute',
              cursor: isDragging ? 'grabbing' : 'grab',
              top: position.y,
              left: position.x,
              width: size.width,
              height: size.height
            }}
            onMouseDown={handleDragStart}
          />
          
          {!isBgMode && (
            <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity">
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
