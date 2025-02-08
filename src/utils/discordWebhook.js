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
          projectName: formData.projectName,
          email: formData.email,
          details: formData.details,
          twitterLink: formData.twitterLink,
          telegramLink: formData.telegramLink,
          additionalInfo: formData.additionalInfo,
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
