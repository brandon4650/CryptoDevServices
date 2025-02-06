// netlify/functions/discord-upload.js
const fetch = require('node-fetch');
const FormData = require('form-data');
const busboy = require('busboy');

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
    return new Promise((resolve, reject) => {
      const bb = busboy({ headers: event.headers });
      const files = [];
      let channelId = '';

      bb.on('file', (name, file, info) => {
        const chunks = [];
        file.on('data', (data) => chunks.push(data));
        file.on('end', () => {
          files.push({
            content: Buffer.concat(chunks),
            filename: info.filename,
            encoding: info.encoding,
            mimeType: info.mimeType
          });
        });
      });

      bb.on('field', (name, val) => {
        if (name === 'channelId') channelId = val;
      });

      bb.on('finish', async () => {
        try {
          const botToken = process.env.DISCORD_BOT_TOKEN;
          
          if (!botToken) {
            throw new Error('Discord bot token not configured');
          }

          // Upload each file to Discord
          const uploadPromises = files.map(async (file) => {
            const form = new FormData();
            form.append('file', file.content, {
              filename: file.filename,
              contentType: file.mimeType
            });

            const response = await fetch(
              `https://discord.com/api/v10/channels/${channelId}/messages`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bot ${botToken}`
                },
                body: form
              }
            );

            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Discord API error: ${errorText}`);
            }

            return response.json();
          });

          const results = await Promise.all(uploadPromises);

          resolve({
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              messages: results
            })
          });
        } catch (error) {
          console.error('Upload error:', error);
          resolve({
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
          });
        }
      });

      // Handle the raw body
      const buffer = Buffer.from(event.body, 'base64');
      bb.end(buffer);
    });
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
