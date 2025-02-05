import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, Loader2, MessageCircle } from 'lucide-react';
import { chatClient } from '../utils/DiscordChatClient';

const DEFAULT_WELCOME_MESSAGE = {
  id: 'welcome',
  sender: 'CryptoWeb Assistant',
  avatar: 'https://i.imgur.com/AfFp7pu.png',
  content: 'Welcome to live support! How can I assist you today?',
  timestamp: new Date()
};

const LiveChat = ({ channelId: initialChannelId, initialOpen = false }) => {
  const [messages, setMessages] = useState([DEFAULT_WELCOME_MESSAGE]);
  const [newMessage, setNewMessage] = useState('');
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [isLoading, setIsLoading] = useState(false);
  const [chatConnected, setChatConnected] = useState(!initialChannelId);
  const [channelId, setChannelId] = useState(initialChannelId || '');
  const [showChannelInput, setShowChannelInput] = useState(!initialChannelId);
  const messageEndRef = useRef(null);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // Connect to Discord channel
  const connectToChannel = async (id) => {
    setIsLoading(true);
    try {
      console.log('Connecting to channel:', id);

      // Validate the channel
      const validation = await chatClient.validateChannel(id);
      if (!validation.valid) {
        throw new Error('Invalid channel ID');
      }

      // Set up message subscription
      chatClient.subscribeToChannel(id, (message) => {
        console.log('Received new message:', message);
        setMessages(prev => [...prev, message]);
      });

      // Load message history
      if (validation.messages && validation.messages.length > 0) {
        setMessages([DEFAULT_WELCOME_MESSAGE, ...validation.messages]);
      } else {
        setMessages([DEFAULT_WELCOME_MESSAGE]);
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

  useEffect(() => {
    if (initialChannelId) {
      console.log('Channel ID provided:', initialChannelId);
      connectToChannel(initialChannelId);
    }

    return () => {
      if (initialChannelId) {
        chatClient.unsubscribeFromChannel(initialChannelId);
      }
    };
  }, [initialChannelId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const tempId = Date.now();
    const userMessage = {
      id: tempId,
      sender: 'You',
      content: newMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    try {
      await chatClient.sendChannelMessage(channelId, newMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev.filter(m => m.id !== tempId), {
        id: 'error',
        sender: 'System',
        content: 'Failed to send message. Please try again.',
        timestamp: new Date()
      }]);
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
          {showChannelInput && (
            <button
              onClick={() => setIsOpen(false)}
              className="text-cyan-400 hover:text-cyan-300"
            >
              <ArrowLeft className="h-5 w-5" />
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
  {messages.map((message) => (
    <div
      key={message.id}
      className={`flex items-start gap-3 ${
        message.sender === 'You' || message.fromWebsite ? 'flex-row-reverse' : ''
      }`}
    >
      {message.fromDiscord ? (
        // Discord user message with avatar
        <>
          {message.avatar ? (
            <img
              src={message.avatar}
              alt={message.sender}
              className="w-8 h-8 rounded-full bg-blue-900/40"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center text-white text-sm">
              {message.sender[0]}
            </div>
          )}
          <div className="bg-blue-900/40 p-3 rounded-lg max-w-[70%]">
            <div className="text-sm font-medium mb-1">{message.sender}</div>
            <div className="text-zinc-100">{message.content}</div>
            <div className="text-xs text-zinc-400 mt-1">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </>
      ) : (
        // Website user message or system message
        <>
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center text-white text-sm">
            {message.sender[0]}
          </div>
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-3 rounded-lg max-w-[70%]">
            <div className="text-sm font-medium mb-1">{message.sender}</div>
            <div className="text-zinc-100">{message.content}</div>
            <div className="text-xs text-zinc-400 mt-1">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </>
      )}
    </div>
  ))}
  <div ref={messageEndRef} />
</div>

      {/* Message Input */}
      {chatConnected && (
        <form onSubmit={handleSubmit} className="p-4 bg-blue-900/20 border-t border-blue-800">
          <div className="flex items-center gap-2">
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
