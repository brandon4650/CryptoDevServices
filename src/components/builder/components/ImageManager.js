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
  const [isBgMode, setIsBgMode] = useState(isFullBackground);
  const [sizeScale, setSizeScale] = useState(100);
  const [originalImageSize, setOriginalImageSize] = useState(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        onImageChange(dataUrl);
        
        // Set initial size and store original dimensions
        const img = new Image();
      img.onload = () => {
        const containerWidth = containerRef.current?.offsetWidth || 800;
        const containerHeight = containerRef.current?.offsetHeight || 600;
        
        // Calculate initial size while maintaining aspect ratio
        const aspectRatio = img.width / img.height;
        let newWidth = containerWidth;
        let newHeight = newWidth / aspectRatio;
        
        // Adjust if height is too large
        if (newHeight > containerHeight) {
          newHeight = containerHeight;
          newWidth = newHeight * aspectRatio;
        }
        
        // Update size
        const newSize = {
          width: `${newWidth}px`,
          height: `${newHeight}px`
        };
        onSizeChange(newSize);
        
        // Center the image
        const newPosition = {
          x: (containerWidth - newWidth) / 2,
          y: (containerHeight - newHeight) / 2
        };
        onPositionChange(newPosition);
        
        // Store original size for scaling
        setOriginalImageSize({ width: img.width, height: img.height });
        setSizeScale(100);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }
};

  const handleDragStart = (e) => {
    if (isBgMode && !isFullBackground) return;
    e.preventDefault();
    setIsDragging(true);
    const rect = isFullBackground ? containerRef.current.getBoundingClientRect() : imageRef.current.getBoundingClientRect();
    setDragStart({
      x: e.clientX - (isFullBackground ? position.x : rect.left),
      y: e.clientY - (isFullBackground ? position.y : rect.top)
    });
  };

  const handleDrag = (e) => {
    if (isDragging) {
      const containerRect = containerRef.current.getBoundingClientRect();
      if (isFullBackground) {
        // For full background, allow unlimited movement
        onPositionChange({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        });
      } else if (!isBgMode) {
        // For free positioning, constrain to container
        const newX = e.clientX - dragStart.x - containerRect.left;
        const newY = e.clientY - dragStart.y - containerRect.top;
        onPositionChange({
          x: Math.max(0, Math.min(newX, containerRect.width - parseInt(size.width))),
          y: Math.max(0, Math.min(newY, containerRect.height - parseInt(size.height)))
        });
      }
    }
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
      const aspectRatio = resizeStart.width / resizeStart.height;
      
      let newWidth = Math.max(50, resizeStart.width + deltaX);
      if (isFullBackground) {
        // For full background, maintain minimum coverage
        newWidth = Math.max(newWidth, containerRef.current.offsetWidth);
      }
      
      const newHeight = newWidth / aspectRatio;
      onSizeChange({
        width: `${newWidth}px`,
        height: `${newHeight}px`
      });
    }
  };

  const handleSizeScale = (newScale) => {
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

  const handleRemoveImage = () => {
    onImageChange(null);
    onPositionChange({ x: 0, y: 0 });
    onSizeChange({ width: '100%', height: '100%' });
    setSizeScale(100);
    setOriginalImageSize(null);
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
              onClick={handleRemoveImage}
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
              onChange={(e) => handleSizeScale(parseInt(e.target.value))}
              className="w-full h-2 bg-blue-900/30 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>
        )}
      </div>

      {backgroundImage && (
        <div 
          className="relative bg-blue-900/20 rounded-lg overflow-hidden"
          style={{
            height: '200px',
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
          onMouseDown={isFullBackground ? handleDragStart : undefined}
        >
          <img
            ref={imageRef}
            src={backgroundImage}
            alt="Background"
            className={`${isBgMode || isFullBackground ? 'w-full h-full object-cover' : ''}`}
            style={isBgMode || isFullBackground ? {
              transform: `translate(${position.x}px, ${position.y}px)`,
              width: size.width,
              height: size.height
            } : {
              position: 'absolute',
              cursor: isDragging ? 'grabbing' : 'grab',
              top: position.y,
              left: position.x,
              width: size.width,
              height: size.height
            }}
            onMouseDown={!isFullBackground && !isBgMode ? handleDragStart : undefined}
          />
          
          <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity">
            <button
              onMouseDown={handleResizeStart}
              className="absolute bottom-2 right-2 p-1 bg-blue-900/80 rounded text-white hover:bg-blue-800"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageManager;
