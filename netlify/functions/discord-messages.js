const fetch = require('node-fetch');
const BOT_USER_ID = '1283568907982209105';

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
    const { channelId, after, isInitialLoad } = JSON.parse(event.body);
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

    // Transform messages
    const transformedMessages = messages
      .filter(msg => {
        // If it's initial load (page refresh), include bot messages (website user)
        if (isInitialLoad) {
          return true;
        }
        // During polling, only include non-bot messages (Discord users)
        return msg.author.id !== BOT_USER_ID;
      })
      .map(msg => {
        // Check if it's a bot message (website user message)
        if (msg.author.id === BOT_USER_ID) {
          // Check if it's a system message or a user message
          if (msg.content.startsWith('[SYSTEM]')) {
            return {
              id: msg.id,
              sender: 'System',
              content: msg.content.replace('[SYSTEM]', '').trim(),
              timestamp: msg.timestamp,
              isSystem: true
            };
          }
          // Website user message
          return {
            id: msg.id,
            sender: 'You',
            content: msg.content,
            timestamp: msg.timestamp,
            fromWebsite: true
          };
        }
        // Discord user message
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
