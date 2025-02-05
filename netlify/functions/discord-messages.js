const fetch = require('node-fetch');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { channelId, after } = JSON.parse(event.body);
    const botToken = process.env.DISCORD_BOT_TOKEN;

    if (!botToken) {
      throw new Error('Discord bot token not configured');
    }

    let url = `https://discord.com/api/v10/channels/${channelId}/messages?limit=100`;
    if (after) {
      url += `&after=${after}`;
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bot ${botToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Discord API Error:', errorText);
      throw new Error('Failed to fetch messages');
    }

    const messages = await response.json();

    // Transform messages and remove duplicates
    let seenMessages = new Set(); // Track unique message contents
    const transformedMessages = messages
      .map(msg => {
        // For Discord user messages (not bot)
        if (!msg.author.bot) {
          return {
            id: msg.id,
            sender: msg.author.username,
            content: msg.content,
            avatar: msg.author.avatar 
              ? `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png`
              : null,
            timestamp: msg.timestamp,
            fromDiscord: true
          };
        }
        // Skip bot messages that are echoing website messages
        return null;
      })
      .filter(msg => {
        if (!msg) return false;
        const messageKey = \`\${msg.content}\${msg.timestamp}\`;
        if (seenMessages.has(messageKey)) return false;
        seenMessages.add(messageKey);
        return true;
      })
      .reverse();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        messages: transformedMessages
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
