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
        if (isInitialLoad) return true;
        if (msg.author.id === YOUR_DISCORD_ID) return true;
        if (msg.author.id === BOT_USER_ID) return true;
        if (msg.mentions?.some(mention => mention.id === BOT_USER_ID)) return true;
        if (msg.referenced_message?.author.id === BOT_USER_ID) return true;
        return false;
      })
      .map(msg => {
        // Process attachments
        const attachment = msg.attachments?.[0] ? {
          id: msg.attachments[0].id,
          url: msg.attachments[0].url,
          filename: msg.attachments[0].filename,
          contentType: msg.attachments[0].content_type || 'application/octet-stream',
          isImage: msg.attachments[0].content_type?.startsWith('image/') || false
        } : null;

        // Bot messages (website user)
        if (msg.author.id === BOT_USER_ID) {
          return {
            id: msg.id,
            sender: 'You',
            content: msg.content,
            timestamp: msg.timestamp,
            fromWebsite: true,
            isYou: true,
            attachment
          };
        }

        // Your Discord messages
        if (msg.author.id === YOUR_DISCORD_ID) {
          return {
            id: msg.id,
            sender: msg.author.username,
            content: msg.content,
            avatar: '/images/cryptowebservice.png',
            fromDiscord: true,
            isAdmin: true,
            attachment
          };
        }

        // Other Discord user messages
        return {
          id: msg.id,
          sender: msg.author.username,
          content: msg.content,
          avatar: '/images/cryptowebservice.png',
          fromDiscord: true,
          attachment
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
