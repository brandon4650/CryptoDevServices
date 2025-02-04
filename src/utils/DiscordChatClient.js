// DiscordChatClient.js
const DISCORD_CONFIG = {
  CATEGORY_ID: '1336065020907229184',
  GUILD_ID: '1129935594986942464',
  SUPPORT_ROLE_ID: '1129935594999529715'
};

class DiscordChatClient {
  constructor() {
    this.ws = null;
    this.heartbeatInterval = null;
    this.messageCallbacks = new Map();
    this.ticketChannels = new Map();
    this.connectionAttempts = 0;
    this.maxRetries = 5;
    console.log('DiscordChatClient initialized');
  }

  async connect() {
    try {
      console.log('Connecting to Discord gateway...');
      
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
    if (this.ws.readyState !== WebSocket.OPEN) return;

    const payload = {
      op: 2,
      d: {
        token: process.env.REACT_APP_DISCORD_BOT_TOKEN,
        intents: 513, // Add necessary intents
        properties: {
          $os: 'browser',
          $browser: 'cryptoweb',
          $device: 'cryptoweb'
        }
      }
    };

    this.ws.send(JSON.stringify(payload));
  }

  handlePayload(payload) {
    switch (payload.op) {
      case 10: // Hello
        this.startHeartbeat(payload.d.heartbeat_interval);
        break;
      case 0: // Dispatch
        if (payload.t === 'MESSAGE_CREATE') {
          this.handleMessage(payload.d);
        }
        break;
      case 11: // Heartbeat ACK
        break;
    }
  }

  startHeartbeat(interval) {
    clearInterval(this.heartbeatInterval);
    
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ op: 1, d: null }));
      } else {
        clearInterval(this.heartbeatInterval);
      }
    }, interval);
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

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create ticket');
      }

      this.ticketChannels.set(orderInfo.orderNumber, data.channelId);
      return data;
    } catch (error) {
      console.error('Error creating ticket channel:', error);
      throw error;
    }
  }

  // Handle incoming Discord messages
  handleMessage(message) {
    // Find the corresponding callback for this channel
    const callback = this.messageCallbacks.get(message.channel_id);
    if (callback) {
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

  // Get message history for a ticket
  async getTicketHistory(ticketId) {
    const channelId = this.ticketChannels.get(ticketId);
    if (!channelId) {
      throw new Error('Ticket not found');
    }

    try {
      const response = await fetch('/api/discord/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channelId,
          limit: 100 // Adjust as needed
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch messages');
      }

      return data.messages.map(msg => ({
        id: msg.id,
        sender: msg.author.username,
        content: msg.content,
        avatar: msg.author.avatar 
          ? `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png`
          : null,
        timestamp: new Date(msg.timestamp)
      }));
    } catch (error) {
      console.error('Error fetching message history:', error);
      throw error;
    }
  }

  // Subscribe to messages for a specific ticket
  subscribeToTicket(ticketId, callback) {
    const channelId = this.ticketChannels.get(ticketId);
    if (channelId) {
      this.messageCallbacks.set(channelId, callback);
      return true;
    }
    return false;
  }

  // Unsubscribe from messages
  unsubscribeFromTicket(ticketId) {
    const channelId = this.ticketChannels.get(ticketId);
    if (channelId) {
      this.messageCallbacks.delete(channelId);
      return true;
    }
    return false;
  }

  // Send a message to a ticket channel
  async sendTicketMessage(ticketId, content) {
    const channelId = this.ticketChannels.get(ticketId);
    if (!channelId) {
      throw new Error('Ticket channel not found');
    }

    try {
      const response = await fetch('/api/discord/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channelId,
          content
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
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
