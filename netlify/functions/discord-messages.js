const fetch = require('node-fetch');
const BOT_USER_ID = '1283568907982209105';
const YOUR_DISCORD_ID = '643915314329026561';

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
    
    const transformedMessages = messages
      .filter(msg => {
        // Filter logic remains the same
        if (isInitialLoad) return true;
        if (msg.author.id === YOUR_DISCORD_ID) return true;
        if (msg.author.id === BOT_USER_ID) return true;
        if (msg.mentions?.some(mention => mention.id === BOT_USER_ID)) return true;
        if (msg.referenced_message?.author.id === BOT_USER_ID) return true;
        return false;
      })
      .map(msg => {
        // Process attachments
        const attachments = msg.attachments?.map(attachment => ({
          id: attachment.id,
          url: attachment.url,
          name: attachment.filename,
          contentType: attachment.content_type || 'application/octet-stream',
          size: attachment.size,
          width: attachment.width,
          height: attachment.height,
          isImage: attachment.content_type?.startsWith('image/') || false
        })) || [];

        // Base message structure
        const baseMessage = {
          id: msg.id,
          content: msg.content || '',
          timestamp: msg.timestamp,
          attachments: attachments,
          hasAttachments: attachments.length > 0
        };

        // Bot messages (website user)
        if (msg.author.id === BOT_USER_ID) {
          return {
            ...baseMessage,
            sender: 'You',
            fromWebsite: true,
            isYou: true
          };
        }

        // Your Discord messages
        if (msg.author.id === YOUR_DISCORD_ID) {
          return {
            ...baseMessage,
            sender: msg.author.username,
            avatar: msg.author.avatar 
              ? `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png`
              : null,
            fromDiscord: true,
            isAdmin: true
          };
        }

        // Other Discord user messages
        return {
          ...baseMessage,
          sender: msg.author.username,
          avatar: msg.author.avatar 
            ? `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png`
            : null,
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
