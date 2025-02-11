import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, Move, Maximize, LayoutGrid, Trash2 } from 'lucide-react';

const ImageManager = ({ 
  backgroundImage, 
  position = { x: 0, y: 0 }, 
  size = { width: '100%', height: '100%' },
  onImageChange,
  onPositionChange,
  onSizeChange,
  isBgMode = true,
  onBgModeChange
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ width: 0, height: 0 });
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
        
        // Create image to get dimensions
        const img = new Image();
        img.onload = () => {
          setOriginalImageSize({ width: img.width, height: img.height });
          
          // Calculate initial size
          const containerWidth = containerRef.current?.offsetWidth || 800;
          const containerHeight = containerRef.current?.offsetHeight || 600;
          
          const aspectRatio = img.width / img.height;
          let newWidth = containerWidth;
          let newHeight = newWidth / aspectRatio;
          
          if (newHeight > containerHeight) {
            newHeight = containerHeight;
            newWidth = newHeight * aspectRatio;
          }
          
          onImageChange(dataUrl);
          onSizeChange({
            width: `${newWidth}px`,
            height: `${newHeight}px`
          });
          onPositionChange({
            x: (containerWidth - newWidth) / 2,
            y: (containerHeight - newHeight) / 2
          });
          setSizeScale(100);
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const rect = imageRef.current.getBoundingClientRect();
    setDragStart({
      x: e.clientX - (isBgMode ? position.x : rect.left),
      y: e.clientY - (isBgMode ? position.y : rect.top)
    });
  };

  const handleDrag = (e) => {
    if (isDragging) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      if (isBgMode) {
        onPositionChange({ x: newX, y: newY });
      } else {
        // Constrain to container for non-background mode
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
    if (isResizing && originalImageSize) {
      const deltaX = e.clientX - resizeStart.x;
      const aspectRatio = originalImageSize.width / originalImageSize.height;
      
      let newWidth = Math.max(50, resizeStart.width + deltaX);
      const newHeight = newWidth / aspectRatio;
      
      onSizeChange({
        width: `${newWidth}px`,
        height: `${newHeight}px`
      });
      
      // Update scale
      setSizeScale((newWidth / originalImageSize.width) * 100);
    }
  };

  const handleSizeScale = (newScale) => {
    if (originalImageSize) {
      setSizeScale(newScale);
      const newWidth = (originalImageSize.width * newScale) / 100;
      const newHeight = (originalImageSize.height * newScale) / 100;
      onSizeChange({
        width: `${newWidth}px`,
        height: `${newHeight}px`
      });
    }
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      const moveHandler = isDragging ? handleDrag : handleResize;
      const upHandler = () => {
        setIsDragging(false);
        setIsResizing(false);
      };
      
      window.addEventListener('mousemove', moveHandler);
      window.addEventListener('mouseup', upHandler);
      
      return () => {
        window.removeEventListener('mousemove', moveHandler);
        window.removeEventListener('mouseup', upHandler);
      };
    }
  }, [isDragging, isResizing]);

  return (
    <div className="space-y-4" ref={containerRef}>
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
            className="px-4 py-2 bg-red-900/30 hover:bg-red-900/40 rounded-lg text-red-400"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {backgroundImage && (
        <>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onBgModeChange(!isBgMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                isBgMode ? 'bg-cyan-600/50 text-white' : 'bg-blue-900/30 text-gray-300'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="text-sm">Background Mode</span>
            </button>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Size: {Math.round(sizeScale)}%
            </label>
            <input
              type="range"
              min="10"
              max="200"
              value={sizeScale}
              onChange={(e) => handleSizeScale(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div 
            className="relative bg-blue-900/20 rounded-lg overflow-hidden h-48"
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            <img
              ref={imageRef}
              src={backgroundImage}
              alt=""
              className={isBgMode ? 'w-full h-full object-cover' : ''}
              style={{
                ...(isBgMode ? {
                  transform: `translate(${position.x}px, ${position.y}px)`,
                } : {
                  position: 'absolute',
                  top: position.y,
                  left: position.x,
                }),
                width: size.width,
                height: size.height,
                cursor: isDragging ? 'grabbing' : 'grab'
              }}
              onMouseDown={handleDragStart}
            />
            
            <button
              onMouseDown={handleResizeStart}
              className="absolute bottom-2 right-2 p-1 bg-blue-900/80 rounded text-white hover:bg-blue-800"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
