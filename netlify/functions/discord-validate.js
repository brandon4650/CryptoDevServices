const fetch = require('node-fetch');

const DISCORD_CONFIG = {
  CATEGORY_ID: '1336065020907229184',
  GUILD_ID: '1129935594986942464',
  SUPPORT_ROLE_ID: '1129935594999529715'
};

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { ticketId } = JSON.parse(event.body);
    const botToken = process.env.DISCORD_BOT_TOKEN;

    if (!botToken) {
      throw new Error('Discord bot token not configured');
    }

    console.log('Looking for channel with ticket ID:', ticketId);

    const response = await fetch(
      `https://discord.com/api/v10/guilds/${DISCORD_CONFIG.GUILD_ID}/channels`,
      {
        headers: {
          'Authorization': `Bot ${botToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Discord API Error:', errorText);
      throw new Error('Failed to fetch channels');
    }

    const channels = await response.json();
    
    // Find the ticket channel
    const channelName = `ticket-${ticketId.toLowerCase()}`;
    const ticketChannel = channels.find(channel => 
      channel.parent_id === DISCORD_CONFIG.CATEGORY_ID && 
      channel.type === 0 && 
      channel.name === channelName
    );

    // If found, fetch last 100 messages
    let messages = [];
    if (ticketChannel) {
      const messagesResponse = await fetch(
        `https://discord.com/api/v10/channels/${ticketChannel.id}/messages?limit=100`,
        {
          headers: {
            'Authorization': `Bot ${botToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (messagesResponse.ok) {
        messages = await messagesResponse.json();
        messages = messages
          .filter(msg => !msg.content.includes('[INVISIBLE_MESSAGE]'))
          .map(msg => ({
            id: msg.id,
            sender: msg.author.bot ? 'System' : msg.author.username,
            content: msg.content,
            avatar: msg.author.avatar 
              ? `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png`
              : null,
            timestamp: msg.timestamp
          }))
          .reverse();
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        valid: !!ticketChannel,
        channelId: ticketChannel ? ticketChannel.id : null,
        messages: ticketChannel ? messages : []
      })
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
