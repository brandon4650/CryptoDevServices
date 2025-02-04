export const sendToDiscord = async (formData, type) => {
  try {
    const orderNumber = `${type.charAt(0)}${Date.now()}`;

    const response = await fetch('/api/discord', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderInfo: {
          orderNumber,
          type,
          projectName: formData.projectName,
          email: formData.email,
          details: formData.details,
          twitterLink: formData.twitterLink,
          telegramLink: formData.telegramLink,
          additionalInfo: formData.additionalInfo
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create ticket');
    }

    const result = await response.json();
    return result;

  } catch (error) {
    console.error('Error sending to Discord:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
