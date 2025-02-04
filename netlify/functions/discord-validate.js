const fetch = require('node-fetch');

const DISCORD_CONFIG = {
  CATEGORY_ID: '1336065020907229184',
  GUILD_ID: '1129935594986942464',
};

exports.handler = async (event) => {
  console.log('Starting validation function');
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    console.log('Received event body:', event.body);
    const { ticketId } = JSON.parse(event.body);
    const botToken = process.env.DISCORD_BOT_TOKEN;

    if (!botToken) {
      console.error('Bot token not found');
      throw new Error('Discord bot token not configured');
    }

    // Format channel name
    const channelName = `ticket-${ticketId.toLowerCase()}`;
    console.log('Looking for channel:', channelName);

    // Get all guild channels
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
      throw new Error(\`Discord API error: \${errorText}\`);
    }

    const channels = await response.json();
    
    // Find ticket channel
    const ticketChannel = channels.find(channel => 
      channel.parent_id === DISCORD_CONFIG.CATEGORY_ID && 
      channel.type === 0 && 
      channel.name === channelName
    );

    console.log('Found channel:', ticketChannel ? 'yes' : 'no');

    // If channel found, get messages
    let messages = [];
    if (ticketChannel) {
      try {
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
          const rawMessages = await messagesResponse.json();
          messages = rawMessages
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
      } catch (error) {
        console.error('Error fetching messages:', error);
        // Don't throw error, just return empty messages array
        messages = [];
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        valid: !!ticketChannel,
        channelId: ticketChannel ? ticketChannel.id : null,
        messages
      })
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message,
        stack: error.stack
      })
    };
  }
};
