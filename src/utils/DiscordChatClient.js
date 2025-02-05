class DiscordChatClient {
  constructor() {
    this.channels = new Map();
    this.messageCallbacks = new Map();
    this.pollingIntervals = new Map();
    this.lastMessageIds = new Map();
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
        // Store the last message ID if messages exist
        if (data.messages && data.messages.length > 0) {
          this.lastMessageIds.set(cleanChannelId, data.messages[data.messages.length - 1].id);
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

  subscribeToChannel(channelId, callback) {
    const cleanChannelId = channelId.replace('ticket-', '');
    console.log('Subscribing to channel:', cleanChannelId);
    
    if (this.channels.has(cleanChannelId)) {
      this.messageCallbacks.set(cleanChannelId, callback);
      // Start polling for this channel
      this.startPolling(cleanChannelId);
      return true;
    }
    return false;
  }

  unsubscribeFromChannel(channelId) {
    const cleanChannelId = channelId.replace('ticket-', '');
    if (this.channels.has(cleanChannelId)) {
      this.messageCallbacks.delete(cleanChannelId);
      // Stop polling for this channel
      this.stopPolling(cleanChannelId);
      return true;
    }
    return false;
  }

  startPolling(channelId) {
    if (this.pollingIntervals.has(channelId)) {
      return; // Already polling
    }

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch('/.netlify/functions/discord-messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            channelId,
            after: this.lastMessageIds.get(channelId)
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }

        const data = await response.json();
        if (data.messages && data.messages.length > 0) {
          // Update last message ID
          this.lastMessageIds.set(channelId, data.messages[data.messages.length - 1].id);
          
          // Call callback with new messages
          const callback = this.messageCallbacks.get(channelId);
          if (callback) {
            data.messages.forEach(msg => callback(msg));
          }
        }
      } catch (error) {
        console.error('Error polling messages:', error);
      }
    }, 3000); // Poll every 3 seconds

    this.pollingIntervals.set(channelId, pollInterval);
  }

  stopPolling(channelId) {
    const interval = this.pollingIntervals.get(channelId);
    if (interval) {
      clearInterval(interval);
      this.pollingIntervals.delete(channelId);
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
        body: JSON.stringify({ channelId: cleanChannelId })
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

  async sendChannelMessage(channelId, content) {
    try {
      const cleanChannelId = channelId.replace('ticket-', '');
      console.log('Sending message to channel:', cleanChannelId);
      if (!this.channels.has(cleanChannelId)) {
        throw new Error('Channel not found');
      }

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
