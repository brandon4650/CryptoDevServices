class DiscordChatClient {
  constructor() {
    this.channels = new Map();
    this.messageCallbacks = new Map();
    this.pollingIntervals = new Map();
    this.lastMessageIds = new Map();
    this.seenMessages = new Set(); // Track seen messages to prevent duplicates
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
        body: JSON.stringify({ 
          channelId: cleanChannelId
        })
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
          // Add initial messages to seen set
          data.messages.forEach(msg => {
            this.seenMessages.add(`${msg.id}-${msg.content}`);
          });
        }
        return {
          valid: true,
          channelId: data.channelId,
          messages: data.messages || []
        };
      }

      return { valid: false };
    } catch (error) {
      console.error('Error validating channel:', error);
      throw error;
    }
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          channelId: cleanChannelId,
          isInitialLoad: true // This is initial load, so include bot messages
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      if (data.messages && data.messages.length > 0) {
        this.lastMessageIds.set(cleanChannelId, data.messages[data.messages.length - 1].id);
      }
      return data.messages || [];
    } catch (error) {
      console.error('Error fetching message history:', error);
      return [];
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

  startPolling(channelId) {
    if (this.pollingIntervals.has(channelId)) {
      return; // Already polling
    }

    const pollMessages = async () => {
      try {
        const response = await fetch('/.netlify/functions/discord-messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
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
          // Log new messages for debugging
          console.log('New messages received:', data.messages);
          
          // Filter out messages we've already seen
          const newMessages = data.messages.filter(msg => {
            const messageKey = `${msg.id}-${msg.content}`;
            if (this.seenMessages.has(messageKey)) return false;
            this.seenMessages.add(messageKey);
            return true;
          });

          if (newMessages.length > 0) {
            this.lastMessageIds.set(channelId, newMessages[newMessages.length - 1].id);
            const callback = this.messageCallbacks.get(channelId);
            if (callback) {
              newMessages.forEach(msg => callback(msg));
            }
          }
        }
      } catch (error) {
        console.error('Error polling messages:', error);
      }
    };

    // Initial poll
    pollMessages();
    
    // Poll more frequently for better responsiveness
    const pollInterval = setInterval(pollMessages, 1000); // Poll every second
    this.pollingIntervals.set(channelId, pollInterval);
  }

  stopPolling(channelId) {
    const interval = this.pollingIntervals.get(channelId);
    if (interval) {
      clearInterval(interval);
      this.pollingIntervals.delete(channelId);
    }
  }

  async sendChannelMessage(channelId, content) {
    try {
      const cleanChannelId = channelId.replace('ticket-', '');
      console.log('Sending message to channel:', cleanChannelId);
      if (!this.channels.has(cleanChannelId)) {
        throw new Error('Channel not found');
      }

      const messageKey = `local-${Date.now()}-${content}`;
      this.seenMessages.add(messageKey); // Add to seen messages before sending

      const response = await fetch('/.netlify/functions/discord-send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
}

const chatClient = new DiscordChatClient();

export const initializeChat = async () => {
  return chatClient;
};

export { chatClient };
