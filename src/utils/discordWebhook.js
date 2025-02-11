export const sendToDiscord = async (formData, type) => {
  try {
    const orderNumber = `${type.charAt(0)}${Date.now()}`;
    const planType = type === 'quote' ? 'Custom Quote' : type;

    // Create a formatted message for Discord
    const formattedDetails = `
**Project Details**
${formData.details}

**Technical Requirements**
- Price Tracking: ${formData.technicalRequirements.priceTracking ? 'Yes' : 'No'}
- Trading Chart: ${formData.technicalRequirements.chart ? 'Yes' : 'No'}
- Swap Interface: ${formData.technicalRequirements.swapInterface ? 'Yes' : 'No'}
- Custom Features: ${formData.technicalRequirements.customFeatures}

**Token Information**
- Name: ${formData.tokenName || 'Not provided'}
- Symbol: ${formData.tokenSymbol || 'Not provided'}
- Chain: ${formData.chain || 'Not provided'}
- Contract: ${formData.contractAddress || 'Not provided'}

**Timeline**
- Launch Date: ${formData.launchDate || 'Not specified'}
- Website Deadline: ${formData.deadline || 'Not specified'}

**Integrations**
- CoinGecko: ${formData.desiredIntegrations.coinGecko ? 'Yes' : 'No'}
- DexTools: ${formData.desiredIntegrations.dexTools ? 'Yes' : 'No'}
- Other: ${formData.desiredIntegrations.other || 'None'}

**Additional Information**
${formData.additionalInfo || 'None provided'}

**Reference Sites**
${formData.referenceSites || 'None provided'}

**Hosting Preference**
${formData.hostingPreference || 'Not specified'}

**Social Links**
- Twitter: ${formData.twitterLink || 'Not provided'}
- Telegram: ${formData.telegramLink || 'Not provided'}
${type === 'quote' ? `\n**Budget Range**\n${formData.budgetRange || 'Not specified'}` : ''}`;

    const response = await fetch('/api/discord', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderInfo: {
          orderNumber,
          type,
          planType,
          projectName: formData.projectName,
          email: formData.email,
          details: formattedDetails, // Send the formatted details
          categoryId: '1336065020907229184',
          guildId: '1129935594986942464',
          supportRoleId: '1129935594999529715',
          channelName: `ticket-${orderNumber.toLowerCase()}`
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Server error occurred');
    }
    
    return {
      success: true,
      orderNumber: data.orderNumber,
      channelId: data.channelId
    };
  } catch (error) {
    console.error('Error sending to Discord:', error);
    return {
      success: false,
      error: error.message || 'An unknown error occurred'
    };
  }
};
