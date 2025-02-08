const fetch = require('node-fetch');

const DISCORD_CONFIG = {
  CATEGORY_ID: '1336065020907229184',
  GUILD_ID: '1129935594986942464',
};

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
    const { channelId } = JSON.parse(event.body);
    const botToken = process.env.DISCORD_BOT_TOKEN;

    if (!botToken) {
      throw new Error('Discord bot token not configured');
    }

    // Verify channel exists
    const channelResponse = await fetch(
      `https://discord.com/api/v10/channels/${channelId}`,
      {
        headers: {
          'Authorization': `Bot ${botToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!channelResponse.ok) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          valid: false,
          error: 'Channel not found'
        })
      };
    }

    const channel = await channelResponse.json();

    // Verify category
    if (channel.parent_id !== DISCORD_CONFIG.CATEGORY_ID) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          valid: false,
          error: 'Invalid channel'
        })
      };
    }

    // Get messages
    let messages = [];
    try {
      const messagesResponse = await fetch(
        `https://discord.com/api/v10/channels/${channelId}/messages?limit=100`,
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
    .map(msg => {
      // Process all attachments as an array
      const attachments = msg.attachments?.map(attachment => ({
        id: attachment.id,
        url: attachment.url,
        filename: attachment.filename,
        contentType: attachment.content_type || 'application/octet-stream',
        size: attachment.size,
        isImage: attachment.content_type?.startsWith('image/')
      })) || [];

      const embeds = msg.embeds || [];

      // Base message properties
      const baseMessage = {
        id: msg.id,
        content: msg.content,
        timestamp: msg.timestamp,
        attachments,
        embeds  // Add embeds to all messages
      };


    // If it's a bot message (your website user)
    if (msg.author.id === BOT_USER_ID) {
        return {
          ...baseMessage,
          sender: 'You',
          fromWebsite: true,
          isYou: true
        };
      }
    // Discord user message
    return {
      id: msg.id,
      sender: msg.author.username,
      content: msg.content,
      avatar: '/images/cryptowebservice.png',
      timestamp: msg.timestamp,
      fromDiscord: true,
      attachments  // Now using array instead of single attachment
    };
  })
          .reverse();
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      messages = [];
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        valid: true,
        channelId: channel.id,
        messages
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
