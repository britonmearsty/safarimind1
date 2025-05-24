/**
 * AI Response Service
 *
 * This service consolidates all AI response handling with a simple fallback mechanism
 * and includes SafariMind identity functionality
 */

// Import the original services for fallback
import {
  sendMessageToGemini as googleSendMessageToGemini,
  formatMessagesForGemini as googleFormatMessages,
} from "./googleGenAIService";

// Interface for the chat message format
export interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

// getWelcomeGreeting function has been removed as it's now handled in the ChatWindow component

/**
 * Categorizes identity questions into specific types
 * @param message - The user's message
 * @returns The type of identity question or null if not an identity question
 */
export type IdentityQuestionType = "who" | "what" | "general";
export function categorizeIdentityQuestion(
  message: string
): IdentityQuestionType | null {
  const lowerMessage = message.toLowerCase();

  // Keywords for "who are you" type questions (about identity/background)
  const whoKeywords = [
    "who are you",
    "your name",
    "introduce yourself",
    "who made you",
    "who created you",
    "what is safarimind",
    "what's safarimind",
    "tell me about safarimind",
    "about you",
  ];

  // Keywords for "what do you do" type questions (about capabilities/functions)
  const whatKeywords = [
    "what do you do",
    "what can you do",
    "what is your purpose",
    "your capabilities",
    "how can you help",
    "what are your functions",
  ];

  // General identity keywords that could be either
  const generalKeywords = ["what are you", "tell me about yourself"];

  if (whoKeywords.some((keyword) => lowerMessage.includes(keyword))) {
    return "who";
  } else if (whatKeywords.some((keyword) => lowerMessage.includes(keyword))) {
    return "what";
  } else if (
    generalKeywords.some((keyword) => lowerMessage.includes(keyword))
  ) {
    return "general";
  }

  return null;
}

/**
 * Determines if a user message is asking about the chatbot's identity
 * @param message - The user's message
 * @returns True if the message is asking about identity
 */
export function isAskingAboutIdentity(message: string): boolean {
  return categorizeIdentityQuestion(message) !== null;
}

/**
 * Creates a contextual prompt for SafariMind's identity to send to the AI model
 * This approach allows the AI to generate varied responses about SafariMind's identity
 * @param userQuestion - The user's original question about identity
 * @returns Promise with the AI-generated identity response
 */
export async function getSafariMindIdentity(
  userQuestion: string = ""
): Promise<string> {
  try {
    console.log("Generating identity response for question:", userQuestion);

    // Determine the type of identity question
    const questionType = categorizeIdentityQuestion(userQuestion) || "general";
    console.log("Question categorized as:", questionType);

    // Create a specialized prompt based on the question type
    let identityPrompt = "";

    if (questionType === "who") {
      // For "who are you" type questions - focus on identity and background
      identityPrompt = `
The user is asking about your identity with: "${userQuestion}"

Please respond as SafariMind, an AI assistant created by Cheruu, a Kenyan tech company.
Focus primarily on:
- Your identity as SafariMind
- Do not always begin with "Jambo"
- Your Kenyan origins and East African perspective
- Your creation by Cheruu (a Kenyan tech company)
- Your values (accuracy, helpfulness, cultural awareness)
- What makes you unique as an AI with African roots

Format your response in markdown with appropriate styling.
Make your response personalized to the specific identity question.
Be conversational and engaging.
You may include an emoji like 🦁 or 🌍 if appropriate.
End with a friendly closing that invites further conversation.
`;
    } else if (questionType === "what") {
      // For "what do you do" type questions - focus on capabilities and functions
      identityPrompt = `
The user is asking about your capabilities with: "${userQuestion}"

Please respond as SafariMind, an AI assistant created by Cheruu, a Kenyan tech company.
Focus primarily on:
- Your specific capabilities and functions
- The types of tasks you can help with (information, creative tasks, problem-solving, etc.)
- How you can assist users in practical ways
- Examples of questions or tasks you're designed to handle
- Your limitations (what you cannot do)

Format your response in markdown with appropriate styling.
Make your response practical and focused on your capabilities.
Be conversational and engaging.
You may include an emoji like 🦁 or 🌍 if appropriate.
End with a friendly closing that invites the user to try asking you something specific.
`;
    } else {
      // For general identity questions - balanced approach
      identityPrompt = `
The user is asking about you with: "${userQuestion}"

Please respond as SafariMind, an AI assistant created by Cheruu, a Kenyan tech company.
Include a balanced mix of:
- Your identity and Kenyan origins
- Your East African perspective
- Your capabilities (helping with information, creative tasks, problem-solving, etc.)
- Your values (accuracy, helpfulness, cultural awareness)

Format your response in markdown with appropriate styling.
Make your response unique and personalized to the specific question.
Be conversational and engaging.
You may include an emoji like 🦁 or 🌍 if appropriate.
End with a friendly closing that invites further conversation.
`;
    }

    // Use the existing googleSendMessageToGemini function that's working for other queries
    // This avoids potential issues with direct API calls
    try {
      console.log("Using main service for identity response");
      return await googleSendMessageToGemini([
        {
          role: "user",
          parts: [{ text: identityPrompt }],
        },
      ]);
    } catch (error) {
      console.error("Error with main service for identity:", error);

      // Try a simpler approach if the main one fails
      try {
        console.log("Trying simplified approach for identity");

        // Even the simplified approach should differentiate between question types
        let simplePrompt = "";

        if (questionType === "who") {
          simplePrompt = `Introduce yourself as SafariMind, an AI assistant by Cheruu from Kenya, focusing on your identity and background. The user asked: "${userQuestion}"`;
        } else if (questionType === "what") {
          simplePrompt = `Explain what you can do as SafariMind, an AI assistant by Cheruu from Kenya, focusing on your capabilities and functions. The user asked: "${userQuestion}"`;
        } else {
          simplePrompt = `Introduce yourself as SafariMind, an AI assistant by Cheruu from Kenya. The user asked: "${userQuestion}"`;
        }

        return await googleSendMessageToGemini([
          {
            role: "user",
            parts: [{ text: simplePrompt }],
          },
        ]);
      } catch (fallbackError) {
        console.error("Simplified identity approach failed:", fallbackError);

        // Return a minimal response as last resort, still differentiated by question type
        if (questionType === "who") {
          return "# SafariMind\n\nI am SafariMind, an AI assistant developed by Cheruu, a Kenyan tech company. I bring an East African perspective to AI assistance, with roots in Kenya's vibrant tech ecosystem.";
        } else if (questionType === "what") {
          return "# SafariMind\n\nI am SafariMind, an AI assistant developed by Cheruu. I can help you with information, creative tasks, problem-solving, and more. Just ask me a question or tell me how I can assist you today.";
        } else {
          return "# SafariMind\n\nI am SafariMind, an AI assistant developed by Cheruu, a Kenyan tech company. I'm here to help you with information and assistance.";
        }
      }
    }
  } catch (error) {
    console.error("All identity generation attempts failed:", error);
    return "I'm having trouble connecting right now. Please try again in a moment.";
  }
}

/**
 * Main function to send a message to the AI service
 * @param messages - Array of chat messages in the conversation history
 * @returns The AI response text
 */
/**
 * Special function to handle greeting messages with maximum variety
 * @param greeting The user's greeting message
 * @param userName Optional username for personalization
 * @returns A unique, dynamic greeting response
 */
export async function generateUniqueGreeting(
  greeting: string,
  userName: string = ""
): Promise<string> {
  console.log("Generating unique greeting response for:", greeting);

  // Create a very specific prompt to avoid the repetitive pattern
  const greetingPrompt = `
IMPORTANT: Generate a COMPLETELY UNIQUE greeting as SafariMind AI assistant.

User greeting: "${greeting}"

Guidelines:
1. NEVER start with "Jambo!" or "Hujambo!" - these exact greetings are overused
2. NEVER use the greeting pattern "Swahili word! [Statement]. What's on your mind today?"
3. If using a Swahili greeting, choose something unique and less common like "Shikamoo", "Mambo", "Sasa", etc.
4. Each greeting should be completely different from previous ones
6. Vary sentence structure, punctuation, and phrasing completely
7. Make it creative, unexpected, and personalized
9. Keep it brief (1-2 sentences maximum)
${userName ? `10. Address the user as "${userName}"` : ""}

Return ONLY the greeting text with no additional explanation.
`;

  try {
    // Use a higher temperature for maximum variety
    const response = await googleSendMessageToGemini(
      [
        {
          role: "user",
          parts: [{ text: greetingPrompt }],
        },
      ],
      1.0 // Force maximum temperature
    );

    console.log("Generated unique greeting:", response);
    return response;
  } catch (error) {
    console.error("Error generating unique greeting:", error);
    // Fallback to a simple, non-repetitive greeting
    return userName
      ? `Hi ${userName}! How can I assist you?`
      : "Hi there! How can I assist you?";
  }
}

export async function sendMessageToGemini(
  messages: ChatMessage[]
): Promise<string> {
  // Get the last user message for identity checking
  const lastUserMessage = messages.filter((msg) => msg.role === "user").pop();
  if (!lastUserMessage) {
    // Even for this case, use the API to generate a response
    try {
      const noMessagePrompt = `
As SafariMind, respond to a situation where the user hasn't provided a clear question.
- Politely ask them to provide a question
- Be friendly and helpful
- Keep it brief
- Mention you're ready to assist
`;

      return await googleSendMessageToGemini([
        {
          role: "user",
          parts: [{ text: noMessagePrompt }],
        },
      ]);
    } catch (error) {
      console.error("Error generating no-message response:", error);
    }

    // Only if the API call fails
    return "I'm having trouble understanding. Could you please provide a question?";
  }

  const userPrompt = lastUserMessage.parts[0].text;

  // Check if this is a greeting message
  const lowercasePrompt = userPrompt.toLowerCase();
  if (
    lowercasePrompt.includes("hi") ||
    lowercasePrompt.includes("hello") ||
    lowercasePrompt.includes("hey") ||
    lowercasePrompt === "hi" ||
    lowercasePrompt === "hello"
  ) {
    // Get user's name from profile data in localStorage for personalized greeting
    let userName = "";
    const savedProfileData = localStorage.getItem("profileData");

    if (savedProfileData) {
      try {
        const profileData = JSON.parse(savedProfileData);
        if (profileData.fullName && profileData.fullName !== "User Name") {
          // Extract first name if full name is available
          userName = profileData.fullName.split(" ")[0];
        }
      } catch (e) {
        console.error("Error parsing profile data:", e);
      }
    }

    // Use the specialized greeting function
    return await generateUniqueGreeting(userPrompt, userName);
  }

  // Check if the user is asking about the chatbot's identity
  if (isAskingAboutIdentity(userPrompt)) {
    const questionType = categorizeIdentityQuestion(userPrompt);
    console.log(
      `User is asking about identity (type: ${questionType}), generating contextual response`
    );
    return await getSafariMindIdentity(userPrompt);
  }

  // Try the Google GenAI service first
  try {
    console.log("Trying Google GenAI service...");
    const response = await googleSendMessageToGemini(messages);
    return response;
  } catch (googleError) {
    console.error("Google GenAI service failed:", googleError);
    // Create a simplified version of messages for a second attempt with minimal context
    // This increases chances of getting a response even when the full context fails
    try {
      console.log("Attempting simplified request to Gemini...");

      // Create a simplified context with clear instructions based on message type
      const lowercaseMsg = userPrompt.toLowerCase();
      let contextualPrompt = "";

      if (lowercaseMsg.includes("hello") || lowercaseMsg.includes("hi")) {
        // Get user's name from profile data in localStorage for personalized greeting
        let userName = "";
        const savedProfileData = localStorage.getItem("profileData");

        if (savedProfileData) {
          try {
            const profileData = JSON.parse(savedProfileData);
            if (profileData.fullName && profileData.fullName !== "User Name") {
              // Extract first name if full name is available
              userName = profileData.fullName.split(" ")[0];
            }
          } catch (e) {
            console.error("Error parsing profile data:", e);
          }
        }

        // For greetings, always use a direct API call to ensure dynamic responses
        try {
          console.log("Generating dynamic greeting response...");
          const greetingPrompt = `
Generate a completely unique greeting response as SafariMind, an AI assistant by Cheruu.

User greeting: "${userPrompt}"

Guidelines:
- Be warm and welcoming
- IMPORTANT: DO NOT start with "Jambo!" or "Hujambo!" - these exact greetings are overused
- NEVER use the greeting pattern "Swahili word! [Statement]. What's on your mind today?"
- If using a Swahili greeting, choose something unique and less common like "Shikamoo", "Mambo", "Sasa", etc.
- Each greeting should be completely different from previous ones
- Mention you're SafariMind, an AI assistant by Cheruu
${userName ? `- Address the user by their name: "${userName}"` : ""}
- Ask how you can help in a creative way that varies each time
- Keep it brief and friendly (1-2 sentences maximum)
- Use a natural, conversational tone
- Be creative and unpredictable in your greeting style
- Vary your sentence structure completely each time
- Use different punctuation and phrasing styles

Return ONLY the greeting text with no additional explanation.
`;

          // Make a direct API call to ensure dynamic response
          return await googleSendMessageToGemini([
            {
              role: "user",
              parts: [{ text: greetingPrompt }],
            },
          ]);
        } catch (greetingError) {
          console.error("Error generating dynamic greeting:", greetingError);
          // If direct API call fails, continue with fallback approach
        }

        // Only use this as a fallback if the direct API call fails
        contextualPrompt = `
As SafariMind, respond to this greeting: "${userPrompt}"
- Be warm and welcoming
- IMPORTANT: DO NOT start with "Jambo!" or "Hujambo!" - these exact greetings are overused
- NEVER use the greeting pattern "Swahili word! [Statement]. What's on your mind today?"
- If using a Swahili greeting, choose something unique and less common like "Shikamoo", "Mambo", "Sasa", etc.
- Each greeting should be completely different from previous ones
- Mention you're SafariMind, an AI assistant by Cheruu
${userName ? `- Address the user by their name: "${userName}"` : ""}
- Ask how you can help in a creative way that varies each time
- Keep it brief and friendly (1-2 sentences maximum)
- Use a natural, conversational tone
- Be creative and unpredictable in your greeting style
- Vary your sentence structure completely each time
- Use different punctuation and phrasing styles
`;
      } else if (lowercaseMsg.includes("help")) {
        contextualPrompt = `
As SafariMind, respond to this help request: "${userPrompt}"
- Express willingness to assist
- Do not always begin with "Jambo"
- Do not always end with "Hakuna Matata"
- Ask for more specific information if needed
- Maintain a helpful, supportive tone
- Briefly mention your capabilities if relevant
`;
      } else if (lowercaseMsg.includes("thank")) {
        contextualPrompt = `
As SafariMind, respond to this expression of gratitude: "${userPrompt}"
- Express that you're happy to help
- Do not always begin with "Jambo"
- Do not always end with "Hakuna Matata"
- Ask if there's anything else you can assist with
- Keep the response brief and warm
`;
      } else {
        // For general queries, provide more context about SafariMind's capabilities
        contextualPrompt = `
As SafariMind, respond to this query: "${userPrompt}"
- You are SafariMind, an AI assistant created by Cheruu, a Kenyan tech company
- Your responses should reflect Kenyan culture when appropriate
- Be helpful, friendly, and respectful
- Do not always begin with "Jambo"
- Do not always end with "Hakuna Matata"
- Format your response in markdown
- If you're unsure about something, acknowledge that instead of making up information
- Keep your response concise but informative
`;
      }

      // Create a new message with the contextual prompt
      const simplifiedMessages = [
        {
          role: "user" as const,
          parts: [{ text: contextualPrompt }],
        },
      ];

      const response = await googleSendMessageToGemini(simplifiedMessages);
      return response;
    } catch (secondError) {
      console.error("Second attempt also failed:", secondError);

      // Try a direct API call as a last resort
      try {
        console.log("Attempting direct API call as final fallback...");

        // Use a very minimal prompt that should work even with limited API capacity
        const minimalPrompt = `Respond as SafariMind AI assistant by Cheruu (Kenya) to: "${userPrompt}"`;

        return await googleSendMessageToGemini([
          {
            role: "user",
            parts: [{ text: minimalPrompt }],
          },
        ]);
      } catch (finalError) {
        console.error("All fallback attempts failed:", finalError);
        return "I'm having trouble connecting right now. Please try again in a moment.";
      }
    }
  }
}

/**
 * Converts the application's message format to Gemini API format
 * @param messages - Array of application messages
 * @returns Array of messages formatted for Gemini API
 */
export function formatMessagesForGemini(
  messages: { content: string; isUser: boolean }[]
): ChatMessage[] {
  return googleFormatMessages(messages);
}

// No need to re-export getWelcomeGreeting as it's already exported above
