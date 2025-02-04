// DiscordChatClient.js

// Discord configuration
const DISCORD_CONFIG = {
  CATEGORY_ID: '1336065020907229184', // Your tickets category ID
  GUILD_ID: '1129935594986942464',    // Your server ID
  SUPPORT_ROLE_ID: '1129935594986942464', // Your support role ID
};

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

  async connect() {
    try {
      console.log('Attempting to connect to Discord gateway...');
      
      return new Promise((resolve, reject) => {
        this.ws = new WebSocket('wss://gateway.discord.gg/?v=10&encoding=json');

        this.ws.onopen = () => {
          console.log('WebSocket connection opened');
          setTimeout(() => {
            this.identify();
            resolve();
          }, 1000);
        };

        this.ws.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            console.log('Received message:', payload);
            this.handlePayload(payload);
          } catch (error) {
            console.error('Error processing message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket connection closed');
          clearInterval(this.heartbeatInterval);
          
          if (this.connectionAttempts < this.maxRetries) {
            this.connectionAttempts++;
            console.log(`Reconnection attempt ${this.connectionAttempts}/${this.maxRetries}`);
            setTimeout(() => this.connect(), 5000);
          }
        };
      });
    } catch (error) {
      console.error('Connection error:', error);
      throw error;
    }
  }

  identify() {
    if (this.ws.readyState !== WebSocket.OPEN) {
      console.log('WebSocket not ready for identify, current state:', this.ws.readyState);
      return;
    }

    console.log('Sending identify payload');
    const payload = {
      op: 2,
      d: {
        token: process.env.REACT_APP_DISCORD_BOT_TOKEN,
        intents: 513,
        properties: {
          $os: 'browser',
          $browser: 'cryptoweb',
          $device: 'cryptoweb'
        },
        presence: {
          status: 'online',
          afk: false
        }
      }
    };

    try {
      this.ws.send(JSON.stringify(payload));
      console.log('Identify payload sent successfully');
    } catch (error) {
      console.error('Error sending identify payload:', error);
    }
  }

  handlePayload(payload) {
    console.log('Handling payload:', payload.op);
    switch (payload.op) {
      case 10: // Hello
        console.log('Received Hello, starting heartbeat');
        this.startHeartbeat(payload.d.heartbeat_interval);
        break;
      case 0: // Dispatch
        switch (payload.t) {
          case 'MESSAGE_CREATE':
            console.log('Received new message');
            this.handleMessage(payload.d);
            break;
          case 'CHANNEL_CREATE':
            console.log('New channel created');
            this.handleChannelCreate(payload.d);
            break;
          case 'CHANNEL_DELETE':
            console.log('Channel deleted');
            this.handleChannelDelete(payload.d);
            break;
          case 'THREAD_CREATE':
            console.log('New thread created');
            this.handleThreadCreate(payload.d);
            break;
        }
        break;
      case 11: // Heartbeat ACK
        console.log('Heartbeat acknowledged');
        break;
    }
  }

  handleChannelCreate(channel) {
    if (channel.name.startsWith('ticket-')) {
      this.ticketChannels.set(channel.name.replace('ticket-', ''), channel.id);
    }
  }

  handleChannelDelete(channel) {
    if (channel.name.startsWith('ticket-')) {
      this.ticketChannels.delete(channel.name.replace('ticket-', ''));
    }
  }

  startHeartbeat(interval) {
    console.log('Starting heartbeat with interval:', interval);
    clearInterval(this.heartbeatInterval);
    
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        console.log('Sending heartbeat');
        try {
          this.ws.send(JSON.stringify({ op: 1, d: null }));
        } catch (error) {
          console.error('Error sending heartbeat:', error);
        }
      } else {
        console.log('Cannot send heartbeat - connection not ready');
        clearInterval(this.heartbeatInterval);
      }
    }, interval);
  }

  handleMessage(message) {
    console.log('Processing message:', message);
    if (message.channel_id && this.messageCallbacks.has(message.channel_id)) {
      const callback = this.messageCallbacks.get(message.channel_id);
      callback({
        id: message.id,
        sender: message.author.username,
        content: message.content,
        avatar: message.author.avatar 
          ? `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`
          : null,
        timestamp: new Date(message.timestamp)
      });
    }
  }

  async createTicketChannel(orderInfo) {
    const channelName = `ticket-${orderInfo.orderNumber.toLowerCase()}`;

    try {
      // Create the ticket channel in the specified category
      const response = await fetch(`https://discord.com/api/v10/guilds/${DISCORD_CONFIG.GUILD_ID}/channels`, {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${process.env.REACT_APP_DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: channelName,
          type: 0, // Text channel
          parent_id: DISCORD_CONFIG.CATEGORY_ID,
          topic: `Order ticket for ${orderInfo.projectName}`,
          permission_overwrites: [
            {
              id: DISCORD_CONFIG.GUILD_ID,
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
      await fetch(`https://discord.com/api/v10/channels/${channelId}/permissions/${DISCORD_CONFIG.SUPPORT_ROLE_ID}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bot ${process.env.REACT_APP_DISCORD_BOT_TOKEN}`,
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
      const socialLinks = [];
      if (orderInfo.twitterLink) socialLinks.push(`Twitter: ${orderInfo.twitterLink}`);
      if (orderInfo.telegramLink) socialLinks.push(`Telegram: ${orderInfo.telegramLink}`);
      
      if (socialLinks.length > 0) {
        embed.fields.push({
          name: "Social Links",
          value: socialLinks.join('\n'),
          inline: false
        });
      }

      // Add additional info if provided
      if (orderInfo.additionalInfo) {
        embed.fields.push({
          name: "Additional Information",
          value: orderInfo.additionalInfo,
          inline: false
        });
      }

      await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${process.env.REACT_APP_DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ embeds: [embed] })
      });

      // Send a follow-up message with instructions
      const instructionEmbed = {
        title: "Ticket Created Successfully",
        description: "Our support team will review your order and respond shortly. Please keep this ticket open for communication.",
        color: 0x3498db,
        fields: [
          {
            name: "Response Time",
            value: "We typically respond within 24 hours during business days.",
            inline: false
          }
        ]
      };

      await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${process.env.REACT_APP_DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ embeds: [instructionEmbed] })
      });

    } catch (error) {
      console.error('Error sending ticket embed:', error);
    }
  }

  // Subscribe to a ticket channel
  subscribeToTicket(ticketId, callback) {
    console.log('Subscribing to ticket:', ticketId);
    const channelId = this.ticketChannels.get(ticketId);
    if (channelId) {
      this.messageCallbacks.set(channelId, callback);
      return true;
    }
    return false;
  }

  // Unsubscribe from a ticket channel
  unsubscribeFromTicket(ticketId) {
    console.log('Unsubscribing from ticket:', ticketId);
    const channelId = this.ticketChannels.get(ticketId);
    if (channelId) {
      this.messageCallbacks.delete(channelId);
      return true;
    }
    return false;
  }

  // Send a message to a ticket channel
  async sendTicketMessage(ticketId, content) {
    console.log('Sending message to ticket:', ticketId);
    const channelId = this.ticketChannels.get(ticketId);
    if (!channelId) {
      throw new Error('Ticket channel not found');
    }

    try {
      const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${process.env.REACT_APP_DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Discord API Error:', errorData);
        throw new Error(`Failed to send message: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Get information about a ticket
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
