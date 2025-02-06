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
    
    // Debug log to see what messages we're receiving
    console.log('Raw messages from Discord:', messages);

    const transformedMessages = messages
      .filter(msg => {
        // Always include messages on initial load
        if (isInitialLoad) return true;
        
        // Always include your Discord messages and bot messages
        if (msg.author.id === YOUR_DISCORD_ID || msg.author.id === BOT_USER_ID) return true;
        
        // Include messages that mention or reply to the bot
        if (msg.mentions?.some(mention => mention.id === BOT_USER_ID)) return true;
        if (msg.referenced_message?.author.id === BOT_USER_ID) return true;
        
        return false;
      })
      .map(msg => {
        // Debug log for each message being processed
        console.log('Processing message:', msg);

        // Process attachments if present
        const attachments = msg.attachments?.map(attachment => ({
          id: attachment.id,
          url: attachment.url,
          filename: attachment.filename,
          contentType: attachment.content_type || 'application/octet-stream',
          size: attachment.size,
          isImage: attachment.content_type?.startsWith('image/')
        })) || [];

        // Bot messages (website user)
        if (msg.author.id === BOT_USER_ID) {
          return {
            id: msg.id,
            sender: 'You',
            content: msg.content,
            timestamp: msg.timestamp,
            fromWebsite: true,
            isYou: true,
            attachments
          };
        }

        // Your Discord messages
        if (msg.author.id === YOUR_DISCORD_ID) {
          return {
            id: msg.id,
            sender: 'CCD Support',
            content: msg.content,
            avatar: '/images/cryptowebservice.png',
            timestamp: msg.timestamp,
            fromDiscord: true,
            isAdmin: true,
            attachments
          };
        }

        // Other Discord user messages
        return {
          id: msg.id,
          sender: msg.author.username,
          content: msg.content,
          avatar: '/images/cryptowebservice.png',
          timestamp: msg.timestamp,
          fromDiscord: true,
          attachments
        };
      })
      .reverse();

    // Debug log for transformed messages
    console.log('Transformed messages:', transformedMessages);

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
