import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, Loader2, MessageCircle } from 'lucide-react';
import { chatClient } from '../utils/DiscordChatClient';

const LiveChat = ({ orderId, initialOpen = false }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [isLoading, setIsLoading] = useState(false);
  const [chatConnected, setChatConnected] = useState(false);
  const [orderNumber, setOrderNumber] = useState(orderId || '');
  const [showOrderInput, setShowOrderInput] = useState(!orderId);
  const messageEndRef = useRef(null);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // Load message history when connecting to a ticket
  const loadMessageHistory = async (ticketId) => {
    try {
      const history = await chatClient.getTicketHistory(ticketId);
      if (history && history.length > 0) {
        setMessages(history);
      } else {
        // Add welcome message if no history exists
        setMessages([{
          id: 'welcome',
          sender: 'CryptoWeb Assistant',
          avatar: 'https://i.imgur.com/AfFp7pu.png',
          content: 'Welcome to live support! How can I assist you today?',
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Error loading message history:', error);
      // Add error message to chat
      setMessages([{
        id: 'error',
        sender: 'System',
        content: 'Failed to load message history. Please try again.',
        timestamp: new Date()
      }]);
    }
  };

  // Connect to Discord thread
  const connectToThread = async (threadId) => {
    setIsLoading(true);
    try {
      // Subscribe to new messages
      const subscribed = chatClient.subscribeToTicket(threadId, (message) => {
        setMessages(prev => [...prev, message]);
      });

      if (subscribed) {
        await loadMessageHistory(threadId);
        setChatConnected(true);
        setShowOrderInput(false);
      } else {
        throw new Error('Failed to connect to support ticket');
      }
    } catch (error) {
      console.error('Error connecting to thread:', error);
      setMessages([{
        id: 'error',
        sender: 'System',
        content: 'Error connecting to support ticket. Please verify your order number and try again.',
        timestamp: new Date()
      }]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (orderId) {
      connectToThread(orderId);
    }

    // Cleanup subscription when component unmounts
    return () => {
      if (orderId) {
        chatClient.unsubscribeFromTicket(orderId);
      }
    };
  }, [orderId]);

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
      // Send message to Discord
      await chatClient.sendTicketMessage(orderNumber, newMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message and remove the temporary message
      setMessages(prev => [
        ...prev.filter(m => m.id !== tempId),
        {
          id: 'error',
          sender: 'System',
          content: 'Failed to send message. Please try again.',
          timestamp: new Date()
        }
      ]);
    }
  };

  const handleOrderSubmit = (e) => {
    e.preventDefault();
    if (orderNumber) {
      connectToThread(orderNumber);
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
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-gradient-to-b from-blue-950 to-black rounded-lg shadow-xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-blue-900/20 border-b border-blue-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showOrderInput && (
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

      {/* Order Number Input */}
      {showOrderInput && (
        <div className="p-6">
          <form onSubmit={handleOrderSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Enter your Order Number to connect
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full bg-blue-900/20 border border-blue-900/40 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 text-white"
                placeholder="Enter order number..."
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
      {chatConnected && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.sender === 'You' ? 'flex-row-reverse' : ''
                }`}
              >
                {message.avatar ? (
                  <img
                    src={message.avatar}
                    alt={message.sender}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center text-white text-sm">
                    {message.sender[0]}
                  </div>
                )}
                <div
                  className={`max-w-[70%] ${
                    message.sender === 'You'
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600'
                      : 'bg-blue-900/40'
                  } p-3 rounded-lg`}
                >
                  <div className="text-sm font-medium mb-1">{message.sender}</div>
                  <div className="text-zinc-100">{message.content}</div>
                  <div className="text-xs text-zinc-400 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messageEndRef} />
          </div>

          {/* Message Input */}
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
        </>
      )}
    </div>
  );
};

export default LiveChat;
