const fetch = require('node-fetch');

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
    const { channelId, lastMessageId } = JSON.parse(event.body);
    const botToken = process.env.DISCORD_BOT_TOKEN;

    if (!botToken) {
      throw new Error('Discord bot token not configured');
    }

    let url = `https://discord.com/api/v10/channels/${channelId}/messages?limit=100`;
    if (lastMessageId) {
      url += `&after=${lastMessageId}`;
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

    // Transform and filter messages
    const transformedMessages = messages
      .filter(msg => !msg.content.includes('[INVISIBLE_MESSAGE]'))
      .map(msg => ({
        id: msg.id,
        sender: msg.author.bot ? 'System' : msg.author.username,
        content: msg.content,
        avatar: msg.author.avatar 
          ? `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png`
          : null,
        timestamp: msg.timestamp,
        attachments: msg.attachments?.map(att => ({
          id: att.id,
          url: att.url,
          filename: att.filename,
          contentType: att.content_type
        })) || []
      }))
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
