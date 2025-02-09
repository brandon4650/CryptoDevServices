import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, Loader2, MessageCircle, LogOut, Upload, X, FileIcon, Download } from 'lucide-react';
import { chatClient } from '../utils/DiscordChatClient';
import SellAppButton from './SellAppButton';
import { SELL_APP_PACKAGES, findMatchingPackage, isQuoteType } from '../utils/packageData';

const DEFAULT_WELCOME_MESSAGE = {
  id: 'welcome',
  sender: 'CCD Support',
  avatar: '/images/cryptowebservice.png',
  content: 'Welcome to live support! If your looking to make your purchase type /buy',
  timestamp: new Date()
};



// File upload constants
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB
const MAX_FILES = 10;
const ALLOWED_TYPES = [
  'image/jpeg', 
  'image/png', 
  'image/gif',
  'text/plain',
  'application/pdf',
  'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const LiveChat = ({ 
  initialOpen = false, 
  showChannelInput: forceShowInput = false,
  defaultChannelId = '' 
}) => {
  // States
  const [messages, setMessages] = useState([DEFAULT_WELCOME_MESSAGE]);
  const [newMessage, setNewMessage] = useState('');
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [isLoading, setIsLoading] = useState(false);
  const [chatConnected, setChatConnected] = useState(false);
  const [channelId, setChannelId] = useState(defaultChannelId || '');
  const [showChannelInput, setShowChannelInput] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  // Refs
  const messageEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // File Message Component
const FileMessage = ({ file }) => {
  const isImage = IMAGE_TYPES.includes(file.contentType);
  
  if (isImage) {
    return (
      <a 
        href={file.url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="block"
      >
        <img 
          src={file.url} 
          alt={file.name} 
          className="max-w-[200px] rounded-lg hover:opacity-90 transition-opacity"
        />
      </a>
    );
  }

  return (
    <a
      href={file.url}
      download={file.name}
      className="flex items-center gap-2 p-2 bg-blue-900/40 rounded-lg hover:bg-blue-900/60 transition-colors"
    >
      <div className="flex-shrink-0 p-2 bg-blue-800/50 rounded">
        <FileIcon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{file.name}</p>
        <p className="text-xs text-zinc-400">{formatFileSize(file.size)}</p>
      </div>
      <Download className="h-4 w-4 text-zinc-400" />
    </a>
  );
};

  // Scroll chat to bottom
  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll chat to bottom when messages update
useEffect(() => {
  if (messages.length > 0) {
    scrollToBottom();
  }
}, [messages]);

// Handle channel connection and clipboard
useEffect(() => {
  const getChannelFromClipboard = async () => {
    if (isOpen && !chatConnected) {
      try {
        const text = await navigator.clipboard.readText();
        if (text?.trim()) {
          setChannelId(text.trim());
        }
      } catch (err) {
        console.log('Could not read clipboard');
      }
    }
  };

  getChannelFromClipboard();
}, [isOpen, chatConnected]);

// Handle package selection and initial message loading
useEffect(() => {
  const initializePackage = async () => {
    if (!channelId) return;

    try {
      // First check localStorage for existing package
      const savedPackage = localStorage.getItem(`plan_${channelId}`);
      if (savedPackage) {
        try {
          const parsedPackage = JSON.parse(savedPackage);
          setSelectedPackage(parsedPackage);
          return; // Exit if we found a saved package
        } catch (error) {
          console.error('Error parsing saved package:', error);
          localStorage.removeItem(`plan_${channelId}`); // Clear invalid data
        }
      }

      // If no saved package, check initial messages from Discord
      const validation = await chatClient.validateChannel(channelId);
      if (validation.messages?.length > 0) {
        const initialMessage = validation.messages[0];
        console.log('Checking initial message:', initialMessage);

        // Look for plan info in embed fields
        if (initialMessage.embeds?.[0]?.fields) {
          const planField = initialMessage.embeds[0].fields.find(
            f => f.name === "Plan Type"
          );
          
          // Only process if it's not a quote
          if (planField && planField.value.toLowerCase() !== 'quote') {
            const matchingPackage = SELL_APP_PACKAGES.find(pkg => 
              pkg.planName.toLowerCase().includes(planField.value.toLowerCase())
            );
            
            if (matchingPackage) {
              console.log('Found matching package:', matchingPackage);
              setSelectedPackage(matchingPackage);
              localStorage.setItem(`plan_${channelId}`, JSON.stringify(matchingPackage));
            }
          }
        }
      }
    } catch (error) {
      console.error('Error initializing package:', error);
    }
  };

  initializePackage();
}, [channelId]); // Only depend on channelId

useEffect(() => {
    console.log('selectedPackage changed:', selectedPackage);
    console.log('chatConnected status:', chatConnected);
  }, [selectedPackage, chatConnected]);


  // Process files (used by both drag&drop and file input)
  const processFiles = (files) => {
    if (files.length + selectedFiles.length > MAX_FILES) {
      alert(`You can only upload up to ${MAX_FILES} images at a time.`);
      return;
    }

    const validFiles = Array.from(files).filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        alert(`${file.name} is too large. Maximum size is 8MB.`);
        return false;
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        alert(`${file.name} must be a JPEG, PNG, or GIF.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setSelectedFiles(prev => [...prev, ...validFiles]);
    
    // Generate previews
    validFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      setPreviewUrls(prev => [...prev, url]);
    });
  };

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (chatConnected) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (chatConnected) {
      e.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (!chatConnected) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  // File input handler
  const handleFileSelect = (e) => {
    processFiles(e.target.files);
  };

  // Remove file from selection
  const removeFile = (index) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Handle file upload
// Handle file upload
  const handleUpload = async () => {
  if (selectedFiles.length === 0) return;
  setIsUploading(true);
  setUploadProgress(0);

  const formData = new FormData();
  selectedFiles.forEach(file => formData.append('files', file));
  formData.append('channelId', channelId);

  try {
    const response = await fetch('/.netlify/functions/discord-upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Upload failed');

    const result = await response.json();
    console.log('Upload result:', result);
    
    // Clear files after successful upload
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setSelectedFiles([]);
    setPreviewUrls([]);
    setUploadProgress(0);

    // Only add system message - remove the direct message addition
    // The actual file message will come through the subscription callback
    setMessages(prev => [...prev, {
      id: `upload-${Date.now()}`,
      sender: 'System',
      content: `Successfully uploaded ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}.`,
      timestamp: new Date()
    }]);

  } catch (error) {
    console.error('Upload error:', error);
    alert('Failed to upload files. Please try again.');
  } finally {
    setIsUploading(false);
  }
};
  // Logout function
  const handleLogout = () => {
    chatClient.unsubscribeFromChannel(channelId);
    setChatConnected(false);
    setShowChannelInput(true);
    setMessages([DEFAULT_WELCOME_MESSAGE]);
    setChannelId('');
    setSelectedFiles([]);
    setPreviewUrls([]);
  };

  // Connect to channel
  const connectToChannel = async (id) => {
  setIsLoading(true);
  try {
    console.log('Connecting to channel:', id);
    const validation = await chatClient.validateChannel(id);
    console.log('Validation response:', validation); 
    
    if (!validation.valid) {
      throw new Error('Invalid channel ID');
    }

    chatClient.subscribeToChannel(id, (message) => {
      setMessages(prev => [...prev, message]);
    });

    // Simply check the first message for plan type
    if (validation.messages?.[0]?.embeds?.[0]?.fields) {
      const fields = validation.messages[0].embeds[0].fields;
      console.log('Found embed fields:', fields);
      const planField = fields.find(f => f.name === "Plan Type");
      console.log('Found plan field:', planField);
      
      if (planField?.value) {
        const planType = planField.value.toLowerCase();
        console.log('Plan type found:', planType);

        if (planType.includes('quote')) {
          console.log('Quote request detected, skipping package selection');
          setSelectedPackage(null);
        } else {
        
        // Match basic/standard/premium
        if (planType.includes('basic')) {
          console.log('Setting Basic package');
          setSelectedPackage(SELL_APP_PACKAGES[0]); // Basic
          console.log('Selected package after set:', SELL_APP_PACKAGES[0]);
        } else if (planType.includes('standard')) {
          console.log('Setting Standard package');
          setSelectedPackage(SELL_APP_PACKAGES[1]); // Standard
          console.log('Selected package after set:', SELL_APP_PACKAGES[1]);
        } else if (planType.includes('premium')) {
          console.log('Setting Premium package');
          setSelectedPackage(SELL_APP_PACKAGES[2]); // Premium
          console.log('Selected package after set:', SELL_APP_PACKAGES[2]);
        }
        console.log('Plan type found:', planType);
        console.log('Chat connected status at package set:', chatConnected);
      }
    }

    setMessages([DEFAULT_WELCOME_MESSAGE, ...validation.messages]);
    setChatConnected(true);
    setShowChannelInput(false);

  } catch (error) {
    console.error('Error connecting to channel:', error);
    setMessages([{
      id: 'error',
      sender: 'System',
      content: 'Error connecting to support chat. Please verify your channel ID and try again.',
      timestamp: new Date()
    }]);
  }
  setIsLoading(false);
};

  // Handle message submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newMessage.trim().toLowerCase() === '/packages' || newMessage.trim().toLowerCase() === '/buy') {
  try {
    console.log('Sending package buttons');
    const result = await chatClient.sendChannelMessage(channelId, {
      type: 'sell-buttons',
      content: 'Available Packages:',
      fromWebsite: true
    });
    
    if (result.success) {
      setMessages(prev => [...prev, result.message]);
    }
    setNewMessage('');
    return;
  } catch (error) {
    console.error('Error sending package buttons:', error);
  }
}


    // Handle file upload first
    if (selectedFiles.length > 0) {
      await handleUpload();
    }

    // Handle text message
    if (!newMessage.trim()) return;

    const tempMessage = {
      id: `temp-${Date.now()}`,
      sender: 'You',
      content: newMessage,
      timestamp: new Date(),
      fromWebsite: true,
      isYou: true
    };

    setMessages(prev => [...prev, tempMessage]);
    const messageContent = newMessage;
    setNewMessage('');

    try {
      const result = await chatClient.sendChannelMessage(channelId, messageContent);
      if (!result.success) {
        throw new Error('Failed to send message');
      }
      setMessages(prev => prev.map(msg => 
        msg.id === tempMessage.id ? {
          ...result.message,
          fromWebsite: true,
          isYou: true
        } : msg
      ));
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [
        ...prev.filter(msg => msg.id !== tempMessage.id),
        {
          id: 'error',
          sender: 'System',
          content: 'Failed to send message. Please try again.',
          timestamp: new Date()
        }
      ]);
    }
  };

const handlePackageSelect = (pkg) => {
  setSelectedPackage(pkg);
  localStorage.setItem(`plan_${channelId}`, JSON.stringify(pkg));
  chatClient.sendChannelMessage(channelId, 
    `Selected Package: ${pkg.planName} ($${pkg.price})`
  );
};
  const handleChannelSubmit = (e) => {
    e.preventDefault();
    if (channelId) {
      connectToChannel(channelId);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-4 rounded-full shadow-lg hover:opacity-90 transition-all z-50"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-gradient-to-b from-blue-950 to-black rounded-lg shadow-xl flex flex-col overflow-hidden z-50">
      {/* Header */}
<div className="sticky top-0 z-20">
  {/* Header Content */}
  <div className="p-4 bg-blue-900/20 border-b border-blue-800 flex items-center justify-between backdrop-blur-sm">
    <div className="flex items-center gap-3">
      {showChannelInput ? (
        <button
          onClick={() => setIsOpen(false)}
          className="text-cyan-400 hover:text-cyan-300"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      ) : (
        <button
          onClick={handleLogout}
          className="text-cyan-400 hover:text-cyan-300"
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
      )}
      <h3 className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
        {chatConnected ? 'Live Support' : 'Connect to Chat'}
      </h3>
    </div>
    <button
      onClick={() => setIsOpen(false)}
      className="text-zinc-400 hover:text-white transition-colors"
    >
      ×
    </button>
  </div>

  {/* Pinned Package Banner */}
  {selectedPackage && chatConnected && (
    <div className="p-3 bg-gradient-to-r from-blue-900/95 to-blue-950/95 backdrop-blur-sm border-b border-blue-800">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-cyan-400">
            {selectedPackage.planName}
          </div>
          <div className="text-xs text-zinc-400">
            ${selectedPackage.price}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setMessages(prev => [...prev, {
                id: `pkg-${Date.now()}`,
                type: 'sell-buttons',
                sender: 'System',
                timestamp: new Date()
              }]);
            }}
            className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Change Plan
          </button>
          <SellAppButton
            storeId={selectedPackage.storeId}
            productId={selectedPackage.productId}
            planName={selectedPackage.planName}
            price={selectedPackage.price}
            className="scale-90"
          />
        </div>
      </div>
    </div>
  )}
</div>

      {/* Channel ID Input */}
      {showChannelInput && (
        <div className="p-6">
          <form onSubmit={handleChannelSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Enter your Channel ID to connect
              </label>
              <input
                type="text"
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
                className="w-full bg-blue-900/20 border border-blue-900/40 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 text-white"
                placeholder="Enter channel ID..."
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 disabled:opacity-50 transition-opacity rounded-lg py-3 font-medium"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
              ) : (
                'Connect to Support'
              )}
            </button>
          </form>
        </div>
      )}

      {/* Chat Messages */}
      <div 
        className={`flex-1 overflow-y-auto p-4 space-y-4 relative ${
          isDragging ? 'bg-blue-900/40' : ''
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {isDragging && chatConnected && (
          <div className="absolute inset-0 bg-blue-900/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center text-white">
              <Upload className="h-12 w-12 mx-auto mb-2" />
              <p className="text-lg font-medium">Drop to upload</p>
              <p className="text-sm text-zinc-300">Images or files up to {formatFileSize(MAX_FILE_SIZE)}</p>
            </div>
          </div>
        )}

        {messages.map((message) => {
          console.log('Rendering message:', message);
          // Add package buttons rendering
  if (message.type === 'sell-buttons') {
  return (
    <div className="flex flex-col gap-3 mt-4 mb-2">
      <div className="text-sm text-cyan-400 font-medium">Select a Package:</div>
      {SELL_APP_PACKAGES.map((pkg, index) => (
        <div key={index} className="bg-blue-900/20 p-3 rounded-lg">
          <div className="mb-2">
            <div className="text-white font-medium">{pkg.planName}</div>
            <div className="text-sm text-zinc-400">{pkg.description}</div>
          </div>
          <div className="flex items-center gap-2">
            <SellAppButton
              storeId={pkg.storeId}
              productId={pkg.productId}
              planName={pkg.planName}
              price={pkg.price}
            />
            <button
              onClick={() => handlePackageSelect(pkg)}
              className="px-3 py-1 text-sm bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300 transition-colors rounded-lg"
            >
              Pin Package
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
  const isBotMessage = message.fromWebsite || message.sender === 'You';
  const isSystemMessage = message.sender === 'System';
  const isDiscordMessage = message.fromDiscord;

  return (
    <div
      key={message.id}
      className={`flex items-start gap-3 ${isBotMessage ? 'flex-row-reverse' : ''}`}
    >
      {isDiscordMessage || message.sender === 'CCD Support' ? (
        <>
          <img
            src="/images/cryptowebservice.png"
            alt="CCD Support"
            className="w-8 h-8 rounded-full bg-blue-900/40"
          />
          <div className="bg-blue-900/40 p-3 rounded-lg max-w-[70%]">
            <div className="text-sm font-medium mb-1">CCD Support</div>
            {message.content && (
              <div className="text-zinc-100 mb-2">{message.content}</div>
            )}
            {message.attachments && message.attachments.length > 0 && message.attachments.map((attachment, index) => (
              <div key={`${message.id}-attachment-${index}`} className="mt-2">
                {attachment.isImage || attachment.filename?.match(/\.(jpg|jpeg|png|gif)$/i) !== null ? (
                  <a 
                    href={attachment.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img
                      src={attachment.url}
                      alt={attachment.filename}
                      className="max-w-[200px] h-auto rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                    />
                  </a>
                ) : (
                  <a
                    href={attachment.url}
                    download={attachment.filename}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 bg-blue-900/40 rounded-lg hover:bg-blue-900/60 transition-colors"
                  >
                    <div className="flex-shrink-0 p-2 bg-blue-800/50 rounded">
                      <FileIcon className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-cyan-400 truncate">{attachment.filename}</p>
                      <p className="text-xs text-zinc-400">
                        {formatFileSize(attachment.size)}
                      </p>
                    </div>
                    <Download className="h-4 w-4 text-zinc-400 ml-auto" />
                  </a>
                )}
              </div>
            ))}
            <div className="text-xs text-zinc-400 mt-1">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center text-white text-sm">
            {message.sender[0]}
          </div>
          <div 
            className={`${
              isSystemMessage 
                ? 'bg-blue-900/40' 
                : 'bg-gradient-to-r from-cyan-600 to-blue-600'
            } p-3 rounded-lg max-w-[70%]`}
          >
            <div className="text-sm font-medium mb-1">
              {isBotMessage ? 'You' : message.sender}
            </div>
            {message.content && (
              <div className="text-zinc-100 mb-2">{message.content}</div>
            )}
            {message.attachments && message.attachments.length > 0 && message.attachments.map((attachment, index) => (
              <div key={`${message.id}-attachment-${index}`} className="mt-2">
                {attachment.isImage || attachment.filename?.match(/\.(jpg|jpeg|png|gif)$/i) !== null ? (
                  <a 
                    href={attachment.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img
                      src={attachment.url}
                      alt={attachment.filename}
                      className="max-w-[200px] h-auto rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                    />
                  </a>
                ) : (
                  <a
                    href={attachment.url}
                    download={attachment.filename}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 bg-blue-900/40 rounded-lg hover:bg-blue-900/60 transition-colors"
                  >
                    <div className="flex-shrink-0 p-2 bg-blue-800/50 rounded">
                      <FileIcon className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-cyan-400 truncate">{attachment.filename}</p>
                      <p className="text-xs text-zinc-400">
                        {formatFileSize(attachment.size)}
                      </p>
                    </div>
                    <Download className="h-4 w-4 text-zinc-400 ml-auto" />
                  </a>
                )}
              </div>
            ))}
            <div className="text-xs text-zinc-400 mt-1">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </>
      )}
    </div>
  );
})}

        <div ref={messageEndRef} />
      </div>

      {/* File Upload Preview */}
      {selectedFiles.length > 0 && (
        <div className="p-2 bg-blue-900/20 border-t border-blue-800">
          <div className="flex flex-wrap gap-2">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative">
                <img 
                  src={url} 
                  alt={`Preview ${index + 1}`} 
                  className="w-16 h-16 object-cover rounded"
                />
                <button
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 rounded-full p-1 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          {uploadProgress > 0 && (
            <div className="w-full bg-blue-900/40 rounded-full h-2 mt-2">
              <div 
                className="bg-cyan-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
          {selectedFiles.length > 0 && !isUploading && (
            <button
              onClick={handleUpload}
              className="mt-2 w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 transition-opacity rounded-lg py-2 text-sm font-medium"
            >
              Upload {selectedFiles.length} {selectedFiles.length === 1 ? 
                (selectedFiles[0].type.startsWith('image/') ? 'image' : 'file') : 
                'files'}
            </button>
          )}
        </div>
      )}

      {/* Message Input */}
      {chatConnected && (
        <form onSubmit={handleSubmit} className="p-4 bg-blue-900/20 border-t border-blue-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`p-2 transition-colors ${
                selectedFiles.length >= MAX_FILES 
                  ? 'text-zinc-500 cursor-not-allowed' 
                  : 'text-cyan-400 hover:text-cyan-300'
              }`}
              disabled={selectedFiles.length >= MAX_FILES}
              title={selectedFiles.length >= MAX_FILES ? 'Maximum files reached' : 'Upload images'}
            >
              <Upload className="h-5 w-5" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              accept={ALLOWED_TYPES.join(',')}
              className="hidden"
              disabled={selectedFiles.length >= MAX_FILES}
            />
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-blue-900/40 border border-blue-800 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-400 text-white"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() && selectedFiles.length === 0}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 p-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default LiveChat;
