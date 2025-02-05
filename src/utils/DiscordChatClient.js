// DiscordChatClient.js
class DiscordChatClient {
  constructor() {
    this.channels = new Map();
    this.messageCallbacks = new Map();
    console.log('DiscordChatClient initialized');
  }

  async validateChannel(channelId) {
    try {
      console.log('Validating channel:', channelId);
      
      const response = await fetch('/.netlify/functions/discord-validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ channelId })
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
        this.channels.set(channelId, data.channelId);
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
    console.log('Subscribing to channel:', channelId);
    if (this.channels.has(channelId)) {
      this.messageCallbacks.set(channelId, callback);
      return true;
    }
    return false;
  }

  unsubscribeFromChannel(channelId) {
    if (this.channels.has(channelId)) {
      this.messageCallbacks.delete(channelId);
      return true;
    }
    return false;
  }

  async getChannelHistory(channelId) {
    try {
      console.log('Getting history for channel:', channelId);
      if (!this.channels.has(channelId)) {
        throw new Error('Channel not found');
      }

      const response = await fetch('/.netlify/functions/discord-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ channelId })
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
      console.log('Sending message to channel:', channelId);
      if (!this.channels.has(channelId)) {
        throw new Error('Channel not found');
      }

      const response = await fetch('/.netlify/functions/discord-send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channelId,
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
