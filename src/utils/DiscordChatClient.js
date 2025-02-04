// DiscordChatClient.js

const BOT_TOKEN = process.env.REACT_APP_DISCORD_BOT_TOKEN;

class DiscordChatClient {
  constructor() {
    this.ws = null;
    this.heartbeatInterval = null;
    this.messageCallbacks = new Map();
    this.threadConnections = new Map();
    this.ticketChannels = new Map();
    this.connectionAttempts = 0;
    this.maxRetries = 5;
    console.log('DiscordChatClient initialized');
  }

  // ... (keep existing connect, identify, handlePayload methods)

  async createTicketChannel(orderInfo) {
    const CATEGORY_ID = process.env.REACT_APP_DISCORD_CATEGORY_ID; // Add this to your .env
    const GUILD_ID = process.env.REACT_APP_DISCORD_GUILD_ID; // Add this to your .env
    const channelName = `ticket-${orderInfo.orderNumber.toLowerCase()}`;

    try {
      // Create the ticket channel in the specified category
      const response = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/channels`, {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: channelName,
          type: 0, // Text channel
          parent_id: CATEGORY_ID,
          topic: `Order ticket for ${orderInfo.projectName}`,
          permission_overwrites: [
            {
              id: GUILD_ID, // @everyone role
              type: 0,
              deny: "1024" // View Channel permission
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Channel creation error:', errorData);
        throw new Error(`Failed to create ticket: ${response.status}`);
      }

      const channelData = await response.json();
      
      // Store the channel info
      this.ticketChannels.set(orderInfo.orderNumber, channelData.id);

      // Set up channel permissions for the ticket
      await this.setupTicketPermissions(channelData.id, orderInfo);

      // Send initial ticket information
      await this.sendTicketEmbed(channelData.id, orderInfo);

      return {
        success: true,
        channelId: channelData.id,
        orderNumber: orderInfo.orderNumber
      };
    } catch (error) {
      console.error('Error creating ticket channel:', error);
      throw error;
    }
  }

  async setupTicketPermissions(channelId, orderInfo) {
    try {
      // You can add specific permission overwrites here
      // For example, allowing specific roles to view the ticket
      const SUPPORT_ROLE_ID = process.env.REACT_APP_DISCORD_SUPPORT_ROLE_ID;
      
      await fetch(`https://discord.com/api/v10/channels/${channelId}/permissions/${SUPPORT_ROLE_ID}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bot ${BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 0,
          allow: "1024" // View Channel permission
        })
      });
    } catch (error) {
      console.error('Error setting up ticket permissions:', error);
    }
  }

  async sendTicketEmbed(channelId, orderInfo) {
    try {
      const embed = {
        title: `New Order Ticket - ${orderInfo.type}`,
        color: 0x00ff00,
        fields: [
          {
            name: "Order Number",
            value: orderInfo.orderNumber,
            inline: true
          },
          {
            name: "Project Name",
            value: orderInfo.projectName,
            inline: true
          },
          {
            name: "Contact Email",
            value: orderInfo.email,
            inline: true
          },
          {
            name: "Details",
            value: orderInfo.details || "Not provided",
            inline: false
          }
        ],
        footer: {
          text: "CryptoCraft.Dev Support Ticket"
        },
        timestamp: new Date().toISOString()
      };

      // Add social links if provided
      if (orderInfo.socialLinks) {
        const socialLinksField = {
          name: "Social Links",
          value: Object.entries(orderInfo.socialLinks)
            .filter(([, value]) => value)
            .map(([platform, value]) => `${platform}: ${value}`)
            .join('\n') || "None provided",
          inline: false
        };
        embed.fields.push(socialLinksField);
      }

      await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ embeds: [embed] })
      });
    } catch (error) {
      console.error('Error sending ticket embed:', error);
    }
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