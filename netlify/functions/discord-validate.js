const fetch = require('node-fetch');

const DISCORD_CONFIG = {
  CATEGORY_ID: '1336065020907229184',
  GUILD_ID: '1129935594986942464',
};

exports.handler = async (event) => {
  console.log('Starting validation function');
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    console.log('Received event body:', event.body);
    const { channelId } = JSON.parse(event.body);
    const botToken = process.env.DISCORD_BOT_TOKEN;

    if (!botToken) {
      console.error('Bot token not found');
      throw new Error('Discord bot token not configured');
    }

    // First, verify the channel exists
    const channelResponse = await fetch(
      `https://discord.com/api/v10/channels/${channelId}`,
      {
        headers: {
          'Authorization': `Bot ${botToken
