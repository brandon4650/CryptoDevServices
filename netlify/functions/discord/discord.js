// netlify/functions/discord/discord.js

const DISCORD_CONFIG = {
  CATEGORY_ID: '1336065020907229184',
  GUILD_ID: '1129935594986942464',
  SUPPORT_ROLE_ID: '1129935594999529715',
};

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { orderInfo } = JSON.parse(event.body);
    const botToken = process.env.DISCORD_BOT_TOKEN;

    if (!botToken) {
      throw new Error('Discord bot token not configured');
    }

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

    if (!channelResponse.ok) {
      const errorText = await channelResponse.text();
      console.error('Discord API Error:', errorText);
      throw new Error(`Failed to create channel: ${channelResponse.status}`);
    }

    const channel = await channelResponse.json();

    // Send initial message
    const embedResponse = await fetch(`https://discord.com/api/v10/channels/${channel.id}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${botToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
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
      })
    });

    if (!embedResponse.ok) {
      console.error('Error sending initial message:', await embedResponse.text());
    }

    return {
      statusCode: 200,
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
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
