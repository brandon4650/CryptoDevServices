// netlify/functions/discord/discord.js

const DISCORD_CONFIG = {
  CATEGORY_ID: '1336065020907229184',
  GUILD_ID: '1129935594986942464',
  SUPPORT_ROLE_ID: '1129935594986942464',
};

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { orderInfo } = JSON.parse(event.body);
    const channelName = `ticket-${orderInfo.orderNumber.toLowerCase()}`;

    // Create the ticket channel
    const channelResponse = await fetch(`https://discord.com/api/v10/guilds/${DISCORD_CONFIG.GUILD_ID}/channels`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: channelName,
        type: 0,
        parent_id: DISCORD_CONFIG.CATEGORY_ID,
        topic: `Order ticket for ${orderInfo.projectName}`,
        permission_overwrites: [
          {
            id: DISCORD_CONFIG.GUILD_ID,
            type: 0,
            deny: "1024"
          }
        ]
      })
    });

    if (!channelResponse.ok) {
      throw new Error(`Failed to create channel: ${await channelResponse.text()}`);
    }

    const channelData = await channelResponse.json();

    // Set up permissions
    await fetch(`https://discord.com/api/v10/channels/${channelData.id}/permissions/${DISCORD_CONFIG.SUPPORT_ROLE_ID}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 0,
        allow: "1024"
      })
    });

    // Send initial embed
    const embed = {
      title: `New Order Ticket - ${orderInfo.type}`,
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
        text: "CryptoCraft.Dev Support Ticket"
      },
      timestamp: new Date().toISOString()
    };

    // Add social links if provided
    if (orderInfo.twitterLink || orderInfo.telegramLink) {
      const socialLinks = [];
      if (orderInfo.twitterLink) socialLinks.push(`Twitter: ${orderInfo.twitterLink}`);
      if (orderInfo.telegramLink) socialLinks.push(`Telegram: ${orderInfo.telegramLink}`);
      
      embed.fields.push({
        name: "Social Links",
        value: socialLinks.join('\n'),
        inline: false
      });
    }

    await fetch(`https://discord.com/api/v10/channels/${channelData.id}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ embeds: [embed] })
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        orderNumber: orderInfo.orderNumber,
        channelId: channelData.id
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
