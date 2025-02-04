const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('Received request body:', event.body);
    
    const { orderInfo } = JSON.parse(event.body);
    const botToken = process.env.DISCORD_BOT_TOKEN;

    if (!botToken) {
      console.error('Bot token not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Discord bot token not configured',
          details: 'Please configure DISCORD_BOT_TOKEN in Netlify environment variables'
        })
      };
    }

    console.log('Creating channel with info:', {
      guildId: orderInfo.guildId,
      categoryId: orderInfo.categoryId,
      channelName: orderInfo.channelName
    });

    // Create channel
    const channelResponse = await fetch(`https://discord.com/api/v10/guilds/${orderInfo.guildId}/channels`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${botToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: orderInfo.channelName,
        type: 0,
        parent_id: orderInfo.categoryId,
        topic: `Order ticket for ${orderInfo.projectName}`,
        permission_overwrites: [
          {
            id: orderInfo.guildId,
            type: 0,
            deny: "1024"
          },
          {
            id: orderInfo.supportRoleId,
            type: 0,
            allow: "1024"
          }
        ]
      })
    });

    const channelData = await channelResponse.text();
    console.log('Discord API response:', channelData);

    if (!channelResponse.ok) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Discord API error',
          details: channelData
        })
      };
    }

    const channel = JSON.parse(channelData);

    // Send initial message
    const embedData = {
      embeds: [{
        title: `New Order - ${orderInfo.type}`,
        color: 0x00ff00,
        fields: [
          {
            name: "Order Number",
            value: orderInfo.orderNumber,
            inline: true
          },
          {
            name: "Project Name",
            value: orderInfo.projectName,
            inline: true
          },
          {
            name: "Contact Email",
            value: orderInfo.email,
            inline: true
          },
          {
            name: "Details",
            value: orderInfo.details || "Not provided",
            inline: false
          }
        ],
        timestamp: new Date().toISOString()
      }]
    };

    console.log('Sending embed:', embedData);

    const messageResponse = await fetch(`https://discord.com/api/v10/channels/${channel.id}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${botToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(embedData)
    });

    if (!messageResponse.ok) {
      console.error('Error sending message:', await messageResponse.text());
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        channelId: channel.id,
        orderNumber: orderInfo.orderNumber
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
