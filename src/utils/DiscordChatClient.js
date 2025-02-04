// DiscordChatClient.js

const DISCORD_CONFIG = {
  CATEGORY_ID: '1336065020907229184',
  GUILD_ID: '1129935594986942464',
  SUPPORT_ROLE_ID: '1129935594999529715',
};

class DiscordChatClient {
  constructor() {
    this.ticketChannels = new Map();
    console.log('DiscordChatClient initialized');
  }

  async connect() {
    console.log('Discord client ready');
    return Promise.resolve();
  }

  async createTicketChannel(orderInfo) {
    console.log('Creating ticket channel for order:', orderInfo);
    const channelName = `ticket-${orderInfo.orderNumber.toLowerCase()}`;

    try {
      const response = await fetch('/api/discord', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderInfo: {
            ...orderInfo,
            channelName,
            categoryId: DISCORD_CONFIG.CATEGORY_ID,
            guildId: DISCORD_CONFIG.GUILD_ID,
            supportRoleId: DISCORD_CONFIG.SUPPORT_ROLE_ID
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create ticket');
      }

      const result = await response.json();
      
      // Store the channel info
      if (result.success) {
        this.ticketChannels.set(orderInfo.orderNumber, result.channelId);
      }

      return result;
    } catch (error) {
      console.error('Error creating ticket channel:', error);
      throw error;
    }
  }

  getTicketInfo(ticketId) {
    return this.ticketChannels.get(ticketId);
  }
}

const chatClient = new DiscordChatClient();

export const initializeChat = async () => {
  await chatClient.connect();
  return chatClient;
};

export { chatClient };

export const getChatClient = () => {
  return chatClient;
};
