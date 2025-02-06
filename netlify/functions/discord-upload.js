const fetch = require('node-fetch');
const FormData = require('form-data');
const busboy = require('busboy');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    return new Promise((resolve, reject) => {
      const bb = busboy({ headers: event.headers });
      const files = [];
      let channelId = '';

      bb.on('file', (name, file, info) => {
        const chunks = [];
        file.on('data', data => chunks.push(data));
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

      bb.on('close', async () => {
        try {
          const botToken = process.env.DISCORD_BOT_TOKEN;
          if (!botToken) {
            throw new Error('Discord bot token not configured');
          }

          // Upload files to Discord
          const results = await Promise.all(files.map(async (file) => {
            const formData = new FormData();
            formData.append('files[0]', file.content, {
              filename: file.filename,
              contentType: file.mimeType
            });

            const response = await fetch(
              `https://discord.com/api/v10/channels/${channelId}/messages`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bot ${botToken}`,
                },
                body: formData
              }
            );

            if (!response.ok) {
              const error = await response.text();
              throw new Error(`Discord API error: ${error}`);
            }

            return response.json();
          }));

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

      bb.write(Buffer.from(event.body, 'base64'));
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
