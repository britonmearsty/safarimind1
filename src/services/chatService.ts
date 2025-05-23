import { sendMessageToGemini as originalSendMessageToGemini, formatMessagesForGemini, ChatMessage } from './geminiService';
import { isAskingAboutIdentity, getSafariMindIdentity } from './safariMindIdentity';

/**
 * Enhanced chat service that incorporates SafariMind identity
 * @param messages - Array of chat messages in the conversation history
 * @returns The AI response text or an error message
 */
export async function sendMessage(
  messages: ChatMessage[]
): Promise<string> {
  // Get the last user message for identity checking
  const lastUserMessage = messages.filter((msg) => msg.role === "user").pop();
  if (!lastUserMessage) {
    return "I'm not sure what you're asking. Could you please provide a question?";
  }

  const userPrompt = lastUserMessage.parts[0].text;
  
  // Check if the user is asking about the chatbot's identity
  if (isAskingAboutIdentity(userPrompt)) {
    console.log("User is asking about identity, returning SafariMind response");
    return getSafariMindIdentity();
  }
  
  // Otherwise, use the original Gemini service
  try {
    return await originalSendMessageToGemini(messages);
  } catch (error) {
    console.error("Error in chat service:", error);
    return "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.";
  }
}

// Re-export the format function for convenience
export { formatMessagesForGemini };