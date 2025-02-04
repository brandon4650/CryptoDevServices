// DiscordChatClient.js

const DISCORD_CONFIG = {
  CATEGORY_ID: '1336065020907229184',
  GUILD_ID: '1129935594986942464',
  SUPPORT_ROLE_ID: '1129935594999529715'
};

class DiscordChatClient {
  constructor() {
    this.ticketChannels = new Map();
    this.messageCallbacks = new Map();
    console.log('DiscordChatClient initialized');
  }

  async validateTicket(ticketId) {
    try {
      console.log('Validating ticket:', ticketId);
      
      const response = await fetch(`/.netlify/functions/discord-validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketId: ticketId.toLowerCase()
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Validation error:', error);
        throw new Error(error.error || 'Failed to validate ticket');
      }

      const data = await response.json();
      console.log('Validation response:', data);

      if (data.valid && data.channelId) {
        // Store channel info for future use
        this.ticketChannels.set(ticketId.toLowerCase(), data.channelId);
        return {
          valid: true,
          channelId: data.channelId,
          messages: data.messages || []
        };
      }

      return { valid: false };
    } catch (error) {
      console.error('Error validating ticket:', error);
      throw error;
    }
  }

  subscribeToTicket(ticketId, callback) {
    console.log('Subscribing to ticket:', ticketId);
    const channelId = this.ticketChannels.get(ticketId.toLowerCase());
    if (channelId) {
      this.messageCallbacks.set(channelId, callback);
      return true;
    }
    return false;
  }

  unsubscribeFromTicket(ticketId) {
    const channelId = this.ticketChannels.get(ticketId.toLowerCase());
    if (channelId) {
      this.messageCallbacks.delete(channelId);
      return true;
    }
    return false;
  }

  async getTicketHistory(ticketId) {
    try {
      console.log('Getting history for ticket:', ticketId);
      const channelId = this.ticketChannels.get(ticketId.toLowerCase());
      
      if (!channelId) {
        throw new Error('Channel not found');
      }

      const response = await fetch(`/.netlify/functions/discord-messages`, {
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

  async sendTicketMessage(ticketId, content) {
    try {
      console.log('Sending message to ticket:', ticketId);
      const channelId = this.ticketChannels.get(ticketId.toLowerCase());
      
      if (!channelId) {
        throw new Error('Ticket channel not found');
      }

      const response = await fetch(`/.netlify/functions/discord-send`, {
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
