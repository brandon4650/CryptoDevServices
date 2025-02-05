class DiscordChatClient {
  constructor() {
    this.channels = new Map();
    this.messageCallbacks = new Map();
    console.log('DiscordChatClient initialized');
  }

  async validateChannel(channelId) {
    try {
      // Remove any 'ticket-' prefix if present
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
        // Store channel info for future use
        this.channels.set(cleanChannelId, data.channelId);
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
      return true;
    }
    return false;
  }

  unsubscribeFromChannel(channelId) {
    const cleanChannelId = channelId.replace('ticket-', '');
    if (this.channels.has(cleanChannelId)) {
      this.messageCallbacks.delete(cleanChannelId);
      return true;
    }
    return false;
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
