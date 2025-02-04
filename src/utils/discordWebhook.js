import { chatClient } from './DiscordChatClient';

export const sendToDiscord = async (formData, type) => {
  try {
    const orderNumber = `${type.charAt(0)}${Date.now()}`;

    // Create channel using Discord client
    const result = await chatClient.createTicketChannel({
      orderNumber,
      type,
      projectName: formData.projectName,
      email: formData.email,
      details: formData.details,
      twitterLink: formData.twitterLink,
      telegramLink: formData.telegramLink,
      additionalInfo: formData.additionalInfo
    });

    return {
      success: true,
      orderNumber: result.orderNumber,
      channelId: result.channelId
    };

  } catch (error) {
    console.error('Error sending to Discord:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
