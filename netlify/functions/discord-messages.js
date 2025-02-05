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
    console.log('Raw messages received:', messages); // Debug log

    // Transform messages
    const transformedMessages = messages
      .filter(msg => {
        // During initial load, include all messages
        if (isInitialLoad) {
          return true;
        }
        // During polling, include all non-bot messages
        return msg.author.id !== BOT_USER_ID;
      })
      .map(msg => {
        console.log('Processing message:', msg); // Debug log

        // If it's a bot message (website user)
        if (msg.author.id === BOT_USER_ID) {
          return {
            id: msg.id,
            sender: 'You',
            content: msg.content,
            timestamp: msg.timestamp,
            fromWebsite: true,
            isYou: true
          };
        }

        // Discord user message (handle both replies and standalone messages)
        return {
          id: msg.id,
          sender: msg.author.username,
          content: msg.content,
          avatar: msg.author.avatar 
            ? `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png`
            : null,
          timestamp: msg.timestamp,
          fromDiscord: true,
          // Include reference info if it's a reply
          referencedMessage: msg.referenced_message ? {
            id: msg.referenced_message.id,
            content: msg.referenced_message.content
          } : null
        };
      })
      .reverse();

    console.log('Transformed messages:', transformedMessages); // Debug log

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
