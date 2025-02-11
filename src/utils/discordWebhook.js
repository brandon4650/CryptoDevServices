export const sendToDiscord = async (formData, type) => {
  try {
    const orderNumber = `${type.charAt(0)}${Date.now()}`;
    const planType = type === 'quote' ? 'Custom Quote' : type;
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
          // Basic Info
          projectName: formData.projectName,
          email: formData.email,
          details: formData.details,
          
          // Social Links
          twitterLink: formData.twitterLink,
          telegramLink: formData.telegramLink,
          
          // Token Details
          tokenName: formData.tokenName,
          tokenSymbol: formData.tokenSymbol,
          chain: formData.chain,
          contractAddress: formData.contractAddress,
          
          // Timeline
          launchDate: formData.launchDate,
          deadline: formData.deadline,
          
          // Technical Requirements
          technicalRequirements: {
            priceTracking: formData.technicalRequirements.priceTracking,
            chart: formData.technicalRequirements.chart,
            swapInterface: formData.technicalRequirements.swapInterface,
            customFeatures: formData.technicalRequirements.customFeatures
          },
          
          // Integrations
          desiredIntegrations: {
            coinGecko: formData.desiredIntegrations.coinGecko,
            dexTools: formData.desiredIntegrations.dexTools,
            other: formData.desiredIntegrations.other
          },
          
          // Additional Info
          budgetRange: formData.budgetRange,
          referenceSites: formData.referenceSites,
          hostingPreference: formData.hostingPreference,
          additionalInfo: formData.additionalInfo,
          
          // Discord Channel Info
          categoryId: '1336065020907229184',
          guildId: '1129935594986942464',
          supportRoleId: '1129935594999529715',
          channelName: `ticket-${orderNumber.toLowerCase()}`
        }
      })
    });
    
    const data = await response.json();
    if (!response.ok) {
      console.error('Server error:', data);
      throw new Error(data.error || 'Server error occurred');
    }
    if (!data.success) {
      console.error('Operation failed:', data);
      throw new Error(data.error || 'Operation failed');
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
