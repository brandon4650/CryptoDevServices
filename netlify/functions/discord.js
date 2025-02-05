const fetch = require('node-fetch');

const DISCORD_CONFIG = {
  CATEGORY_ID: '1336065020907229184',
  GUILD_ID: '1129935594986942464',
  SUPPORT_ROLE_ID: '1129935594999529715'
};

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { orderInfo } = JSON.parse(event.body);
    const botToken = process.env.DISCORD_BOT_TOKEN;

    if (!botToken) {
      throw new Error('Discord bot token not configured');
    }

    // Create the channel
    const channelResponse = await fetch(
      `https://discord.com/api/v10/guilds/${DISCORD_CONFIG.GUILD_ID}/channels`, 
      {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${botToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: `ticket-${orderInfo.orderNumber.toLowerCase()}`,
          type: 0,
          parent_id: DISCORD_CONFIG.CATEGORY_ID,
          topic: `Order ticket for ${orderInfo.projectName}`
        })
      }
    );

    if (!channelResponse.ok) {
      throw new Error('Failed to create channel');
    }

    const channelData = await channelResponse.json();

    // Send initial message with channel ID
    const embedData = {
      embeds: [{
        title: `New Order - ${orderInfo.type}`,
        description: `**Support Channel ID:** ${channelData.id}\nPlease save this Channel ID to connect to support chat.`,
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
        footer: {
          text: "Use the Channel ID above to connect to live support"
        },
        timestamp: new Date().toISOString()
      }]
    };

    const messageResponse = await fetch(
      `https://discord.com/api/v10/channels/${channelData.id}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${botToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(embedData)
      }
    );

    if (!messageResponse.ok) {
      throw new Error('Failed to send initial message');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        channelId: channelData.id,
        orderNumber: orderInfo.orderNumber,
        message: `Your support Channel ID is: ${channelData.id}`
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
