import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, Loader2, MessageCircle, LogOut, Upload, X } from 'lucide-react';
import { chatClient } from '../utils/DiscordChatClient';

const DEFAULT_WELCOME_MESSAGE = {
  id: 'welcome',
  sender: 'CCD Support',
  avatar: '/images/cryptowebservice.png',
  content: 'Welcome to live support! How can I assist you today?',
  timestamp: new Date()
};

// File upload constants
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB
const MAX_FILES = 10;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

const LiveChat = ({ 
  initialOpen = false, 
  showChannelInput: forceShowInput = false,
  defaultChannelId = '' 
}) => {
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
  const messageEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && !chatConnected) {
      navigator.clipboard.readText()
        .then(text => {
          if (text && text.trim()) {
            setChannelId(text.trim());
          }
        })
        .catch(err => console.log('Could not read clipboard'));
    }
  }, [isOpen, chatConnected]);

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + selectedFiles.length > MAX_FILES) {
      alert(`You can only upload up to ${MAX_FILES} images at a time.`);
      return;
    }

    const validFiles = files.filter(file => {
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

    setSelectedFiles(prev => [...prev, ...validFiles]);
    
    // Generate previews
    validFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      setPreviewUrls(prev => [...prev, url]);
    });
  };

  // Remove file from selection
  const removeFile = (index) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

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
      
      // Clear files after successful upload
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      setSelectedFiles([]);
      setPreviewUrls([]);
      setUploadProgress(0);

      // Add system message about successful upload
      setMessages(prev => [...prev, {
        id: `upload-${Date.now()}`,
        sender: 'System',
        content: `Successfully uploaded ${selectedFiles.length} image${selectedFiles.length > 1 ? 's' : ''}.`,
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

  const connectToChannel = async (id) => {
    setIsLoading(true);
    try {
      console.log('Connecting to channel:', id);
      const validation = await chatClient.validateChannel(id);
      if (!validation.valid) {
        throw new Error('Invalid channel ID');
      }
      chatClient.subscribeToChannel(id, (message) => {
        console.log('Received new message:', message);
        setMessages(prev => [...prev, message]);
      });
      if (validation.messages && validation.messages.length > 0) {
        setMessages([DEFAULT_WELCOME_MESSAGE, ...validation.messages]);
      }
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Handle file upload first if files are selected
    if (selectedFiles.length > 0) {
      await handleUpload();
    }

    // Then handle text message if present
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
      <div className="p-4 bg-blue-900/20 border-b border-blue-800 flex items-center justify-between">
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
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
                    <div className="text-zinc-100">{message.content}</div>
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
                    <div className="text-zinc-100">{message.content}</div>
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
                  className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
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
        </div>
      )}

      {/* Message Input */}
      {chatConnected && (
        <form onSubmit={handleSubmit} className="p-4 bg-blue-900/20 border-t border-blue-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-cyan-400 hover:text-cyan-300 transition-colors"
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
              className="bg-gradient-to-r from-cyan-600 to-blue-600 p-2 rounded-lg hover:opacity-90 transition-opacity"
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
