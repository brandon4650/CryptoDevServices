const BOT_USER_ID = '1283568907982209105';
const YOUR_DISCORD_ID = '643915314329026561';

class DiscordChatClient {
  constructor() {
    this.channels = new Map();
    this.messageCallbacks = new Map();
    this.pollingIntervals = new Map();
    this.lastMessageIds = new Map();
    this.seenMessages = new Set();
    console.log('DiscordChatClient initialized');
  }

  async validateChannel(channelId) {
    try {
      const cleanChannelId = channelId.replace('ticket-', '');
      console.log('Validating channel:', cleanChannelId);
      
      const response = await fetch('/.netlify/functions/discord-validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ channelId: cleanChannelId })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Validation error:', error);
        throw new Error(error.error || 'Failed to validate channel');
      }

      const data = await response.json();
      console.log('Validation response:', data);

      if (data.valid && data.channelId) {
  this.channels.set(cleanChannelId, data.channelId);
  if (data.messages && data.messages.length > 0) {
    const lastMessage = data.messages[data.messages.length - 1];
    this.lastMessageIds.set(cleanChannelId, lastMessage.id);
    data.messages.forEach(msg => {
      // Track messages by both ID and content/attachment to prevent duplicates
      const messageKey = msg.attachments?.[0] 
        ? `${msg.id}-${msg.attachments[0].url}` 
        : `${msg.id}-${msg.content}`;
      this.seenMessages.add(messageKey);
      
      // Also track temp messages for website messages
      if (msg.fromWebsite) {
        const tempKey = msg.attachments?.[0]
          ? `temp-${msg.attachments[0].url}`
          : `temp-${msg.content}`;
        this.seenMessages.add(tempKey);
      }
    });
  }
  return {
    valid: true,
    channelId: data.channelId,
    messages: data.messages?.map(msg => this.formatMessage(msg)) || []
  };
}

      return { valid: false };
    } catch (error) {
      console.error('Error validating channel:', error);
      throw error;
    }
  }

  formatMessage(msg) {
  // Process all attachments as an array
  const attachments = msg.attachments?.map(attachment => ({
    id: attachment.id,
    url: attachment.url,
    filename: attachment.filename,
    contentType: attachment.content_type || 'application/octet-stream',
    isImage: attachment.content_type?.startsWith('image/') || 
             attachment.filename?.match(/\.(jpg|jpeg|png|gif)$/i) !== null,
    size: attachment.size
  })) || [];

  // Format website user messages
  if (msg.author?.id === BOT_USER_ID || msg.fromWebsite) {
    return {
      id: msg.id,
      sender: 'You',
      content: msg.content,
      timestamp: msg.timestamp,
      fromWebsite: true,
      isYou: true,
      attachments: attachments // Now using array
    };
  }
  
  // Format Discord messages
  if (msg.author?.id === YOUR_DISCORD_ID || msg.fromDiscord) {
    return {
      id: msg.id,
      sender: 'CCD Support',
      content: msg.content,
      avatar: '/images/cryptowebservice.png',
      timestamp: msg.timestamp,
      fromDiscord: true,
      isSupport: true,
      attachments: attachments // Now using array
    };
  }

  // Fallback format
  return {
    id: msg.id,
    sender: 'CCD Support',
    content: msg.content,
    avatar: '/images/cryptowebservice.png',
    timestamp: msg.timestamp,
    fromDiscord: true,
    attachments: attachments // Now using array
  };
}
  async getChannelHistory(channelId) {
    try {
      const cleanChannelId = channelId.replace('ticket-', '');
      console.log('Getting history for channel:', cleanChannelId);
      if (!this.channels.has(cleanChannelId)) {
        throw new Error('Channel not found');
      }

      const response = await fetch('/.netlify/functions/discord-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          channelId: cleanChannelId,
          isInitialLoad: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      if (data.messages && data.messages.length > 0) {
        this.lastMessageIds.set(cleanChannelId, data.messages[data.messages.length - 1].id);
        return data.messages.map(msg => this.formatMessage(msg));
      }
      return [];
    } catch (error) {
      console.error('Error fetching message history:', error);
      return [];
    }
  }

  startPolling(channelId) {
    if (this.pollingIntervals.has(channelId)) return;

    const pollMessages = async () => {
      try {
        const response = await fetch('/.netlify/functions/discord-messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            channelId,
            after: this.lastMessageIds.get(channelId),
            isInitialLoad: false
          })
        });

        if (!response.ok) {
          console.error('Polling response not ok:', response.status);
          return;
        }

        const data = await response.json();
        if (data.messages && data.messages.length > 0) {
          console.log('New messages received:', data.messages);
          
          const newMessages = data.messages.filter(msg => {
  // Create message key based on whether it has an attachment
  const messageKey = msg.attachments?.[0]
    ? `${msg.id}-${msg.attachments[0].url}`
    : `${msg.id}-${msg.content}`;
    
  // Check if we've seen this message before
  if (this.seenMessages.has(messageKey)) return false;
  
  // Add to seen messages
  this.seenMessages.add(messageKey);
  
  // If it's from website, also track temp key
  if (msg.fromWebsite) {
    const tempKey = msg.attachments?.[0]
      ? `temp-${msg.attachments[0].url}`
      : `temp-${msg.content}`;
    this.seenMessages.add(tempKey);
  }
  
  return true;
});

          if (newMessages.length > 0) {
            this.lastMessageIds.set(channelId, newMessages[newMessages.length - 1].id);
            const callback = this.messageCallbacks.get(channelId);
            if (callback) {
              newMessages.forEach(msg => callback(this.formatMessage(msg)));
            }
          }
        }
      } catch (error) {
        console.error('Error polling messages:', error);
      }
    };

    pollMessages();
    const pollInterval = setInterval(pollMessages, 1000);
    this.pollingIntervals.set(channelId, pollInterval);
  }

  async sendChannelMessage(channelId, content, file = null) {
  try {
    const cleanChannelId = channelId.replace('ticket-', '');
    console.log('Sending message to channel:', cleanChannelId);
    
    if (!this.channels.has(cleanChannelId)) {
      throw new Error('Channel not found');
    }

    if (typeof content === 'object' && content.type === 'sell-buttons') {
      console.log('Handling sell-buttons message');
      return {
        success: true,
        message: {
          id: `pkg-${Date.now()}`,
          type: 'sell-buttons',
          content: content.content,
          timestamp: new Date().toISOString(),
          fromWebsite: true,
          isYou: true
        }
      };
    }

    if (file) {
      console.log('Uploading file:', file);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('channelId', cleanChannelId);
      formData.append('content', content);

      const response = await fetch('/.netlify/functions/discord-upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const result = await response.json();
      console.log('Upload response:', result);

      // Handle the upload response - it contains the Discord message with attachments
      return {
        success: true,
        message: this.formatMessage({
          id: result.messages[0].id,
          content: content,
          timestamp: new Date().toISOString(),
          fromWebsite: true,
          isYou: true,
          attachments: result.messages[0].attachments.map(attachment => ({
            id: attachment.id,
            url: attachment.url,
            filename: attachment.filename,
            contentType: attachment.content_type || 'application/octet-stream',
            size: attachment.size,
            isImage: attachment.content_type?.startsWith('image/')
          }))
        })
      };
    }

      // Track temporary message
      const tempKey = `temp-${content}`;
      this.seenMessages.add(tempKey);

      const response = await fetch('/.netlify/functions/discord-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: cleanChannelId,
          content,
          userName: 'You'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      const result = await response.json();
      
      // Track the actual message ID
      if (result.message?.id) {
        this.seenMessages.add(`${result.message.id}-${content}`);
      }

      return {
        success: true,
        message: this.formatMessage({
          ...result.message,
          fromWebsite: true,
          isYou: true
        })
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  subscribeToChannel(channelId, callback) {
    const cleanChannelId = channelId.replace('ticket-', '');
    console.log('Subscribing to channel:', cleanChannelId);
    
    if (this.channels.has(cleanChannelId)) {
      this.messageCallbacks.set(cleanChannelId, callback);
      this.startPolling(cleanChannelId);
      return true;
    }
    return false;
  }

  unsubscribeFromChannel(channelId) {
    const cleanChannelId = channelId.replace('ticket-', '');
    this.stopPolling(cleanChannelId);
    if (this.channels.has(cleanChannelId)) {
      this.messageCallbacks.delete(cleanChannelId);
      return true;
    }
    return false;
  }

  stopPolling(channelId) {
    const interval = this.pollingIntervals.get(channelId);
    if (interval) {
      clearInterval(interval);
      this.pollingIntervals.delete(channelId);
    }
  }
}

const chatClient = new DiscordChatClient();

export const initializeChat = async () => {
  return chatClient;
};

export { chatClient };
