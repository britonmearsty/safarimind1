// Mock Gemini service for testing and fallback purposes
// This file provides a mock implementation when the real Gemini API is unavailable
import {
  isAskingAboutIdentity,
  getSafariMindIdentity,
} from "./safariMindIdentity";

// Interface for the chat message format (matching the real service)
export interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

/**
 * Mock implementation of sendMessageToGemini
 * Returns predefined responses based on user input patterns
 * @param messages - Array of chat messages in the conversation history
 * @returns A mock AI response text
 */
export async function sendMessageToGemini(
  messages: ChatMessage[]
): Promise<string> {
  console.log("Using mock Gemini service as fallback");

  // Get the last user message
  const lastUserMessage = messages.filter((msg) => msg.role === "user").pop();
  if (!lastUserMessage) {
    return "I'm not sure what you're asking. Could you please provide a question?";
  }

  const userPrompt = lastUserMessage.parts[0].text.toLowerCase();
  console.log(
    "Mock service processing prompt:",
    userPrompt.substring(0, 50) + (userPrompt.length > 50 ? "..." : "")
  );

  // Check if user is asking about the chatbot's identity
  if (isAskingAboutIdentity(lastUserMessage.parts[0].text)) {
    return getSafariMindIdentity();
  }

  // Add a small delay to simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Return different responses based on the content of the user's message
  if (userPrompt.includes("hello") || userPrompt.includes("hi")) {
    return "Hello! I'm SafariMind, your AI assistant from Cheruu, Kenya. How can I help you today?";
  } else if (userPrompt.includes("help")) {
    return "I'm SafariMind, here to help. What would you like assistance with?";
  } else if (userPrompt.includes("thank")) {
    return "You're welcome! Is there anything else I can help with?";
  } else if (userPrompt.includes("weather")) {
    return "I don't have access to real-time weather data, but I can help you find weather information online.";
  } else if (userPrompt.includes("who are you")) {
    return getSafariMindIdentity();
  } else if (userPrompt.includes("joke")) {
    const jokes = [
      "Why don't scientists trust atoms? Because they make up everything!",
      "Why did the scarecrow win an award? Because he was outstanding in his field!",
      "What do you call a fake noodle? An impasta!",
      "How does a penguin build its house? Igloos it together!",
      "Why don't eggs tell jokes? They'd crack each other up!",
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  } else if (userPrompt.includes("trip") || userPrompt.includes("travel")) {
    return "Planning a trip can be exciting! Kenya offers amazing destinations like the Maasai Mara for safaris, pristine beaches in Diani, and vibrant city experiences in Nairobi. Consider factors like your budget, interests, and the time of year.";
  } else if (
    userPrompt.includes("food") ||
    userPrompt.includes("cuisine") ||
    userPrompt.includes("recipe")
  ) {
    return "Kenyan cuisine is delicious and diverse! Try making Ugali (cornmeal porridge) with Sukuma Wiki (collard greens), or Nyama Choma (grilled meat) for authentic flavors. For beginners, I recommend starting with simple dishes like Pilau (spiced rice) or Chapati (flatbread).";
  } else if (
    userPrompt.includes("book") ||
    userPrompt.includes("literature") ||
    userPrompt.includes("read")
  ) {
    return "If you're interested in Kenyan literature, check out works by Ngũgĩ wa Thiong'o, Yvonne Adhiambo Owuor, or Meja Mwangi. 'Dust' by Yvonne Adhiambo Owuor and 'Petals of Blood' by Ngũgĩ wa Thiong'o are excellent starting points for exploring Kenyan storytelling.";
  } else if (userPrompt.includes("markdown") || userPrompt.includes("format")) {
    return `# Markdown Formatting Example

## Text Formatting

You can use **bold text** or *italic text* or even ***bold and italic*** text.

## Lists

Here's a bulleted list:
* Item 1
* Item 2
* Item 3

And a numbered list:
1. First item
2. Second item
3. Third item

## Code

Inline code: \`const greeting = "Hello World";\`

Code block:
\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
console.log(greet("Safari Traveler"));
\`\`\`

## Tables

| Country | Capital | Population |
|---------|---------|------------|
| Kenya   | Nairobi | 4.4 million |
| Tanzania | Dodoma | 0.4 million |
| Uganda  | Kampala | 1.7 million |

## Links and Images

[Visit Kenya Tourism Board](https://www.magicalkenya.com/)

## Blockquotes

> "The only man I envy is the man who has not yet been to Africa, for he has so much to look forward to." - Richard Mullin

Hope this helps you understand markdown formatting!`;
  }

  // Generic response for any other input
  return (
    'I understand your question about "' +
    userPrompt.substring(0, 30) +
    "\". As SafariMind, I'd be happy to explore this topic further or try a different question if you'd like."
  );
}

/**
 * Converts the application's message format to Gemini API format
 * @param messages - Array of application messages
 * @returns Array of messages formatted for Gemini API
 */
export function formatMessagesForGemini(
  messages: { content: string; isUser: boolean }[]
): ChatMessage[] {
  // Filter out any messages with empty content
  const validMessages = messages.filter(
    (msg) => msg.content && msg.content.trim() !== ""
  );

  // Make sure we have at least one user message
  if (validMessages.length === 0 || !validMessages.some((msg) => msg.isUser)) {
    // If no valid user messages, create a default one
    return [
      {
        role: "user",
        parts: [{ text: "Hello" }],
      },
    ];
  }

  // For simplicity, just return the last user message
  // This is more reliable than trying to maintain conversation history
  const lastUserMessage = [...validMessages]
    .reverse()
    .find((msg) => msg.isUser);

  if (lastUserMessage) {
    return [
      {
        role: "user",
        parts: [{ text: lastUserMessage.content }],
      },
    ];
  }

  // Fallback to original implementation if needed
  return validMessages.map((msg) => ({
    role: msg.isUser ? "user" : "model",
    parts: [{ text: msg.content }],
  }));
}
