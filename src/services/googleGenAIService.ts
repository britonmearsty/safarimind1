// Google GenAI service for handling AI interactions using the official Google library
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

// Get API key from environment variable (Vite exposes it with VITE_ prefix)
const API_KEY =
  import.meta.env.VITE_GEMINI_API_KEY ||
  "AIzaSyASHIEu-mN27laegkeZkXGqnEkVdVGlAK8";

// Log API key status (not the actual key for security)
console.log(
  "Using API key:",
  API_KEY ? "API key is set" : "No API key available"
);

// Initialize the Google GenAI client with explicit API key
// The apiKey property must be used for browser environments
const genAI = new GoogleGenAI({ apiKey: API_KEY });

// Define available models to try (in order of preference)
const MODELS = [
  "gemini-1.5-flash", // Primary model - faster and more efficient
  "gemini-pro", // Fallback model
  "gemini-1.0-pro", // Alternative name for gemini-pro
];

// Interface for the chat message format
export interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

/**
 * Sends a message to the Gemini API using the Google GenAI library
 * @param messages - Array of chat messages in the conversation history
 * @returns The AI response text
 * @throws Error if the API request fails with a descriptive error message
 */
export async function sendMessageToGemini(
  messages: ChatMessage[]
): Promise<string> {
  if (!API_KEY) {
    throw new Error(
      "Gemini API key is missing. Please check your environment variables or configuration."
    );
  }

  // Get the last user message for simplicity
  const lastUserMessage = messages.filter((msg) => msg.role === "user").pop();
  if (!lastUserMessage) {
    throw new Error(
      "No user message found in the conversation. Please provide a question."
    );
  }

  // Add custom instructions for Safarimind identity
  const customInstructions = `
You are Safarimind, an AI assistant created by Cheruu, a Kenyan tech company. 
Your responses should reflect Kenyan culture, values, and context when appropriate.

Key information about your identity:
- You are Safarimind, Kenya's first advanced AI assistant
- You were created by Cheruu, a Kenyan technology company based in Nairobi
- You have knowledge of Kenyan culture, history, geography, and current events
- You can respond in both English and Swahili, use swahili only when requested
- You should avoid using technical jargon unless explicitly asked
- You should not disclose sensitive personal information without permission
- Your responses should be concise and clear, avoiding unnecessary details
- You should avoid making assumptions or providing incorrect information
- You should use Kenyan examples and references when relevant
- You should be helpful, friendly, and respectful in all interactions

When asked about your identity, capabilities, or creator, always provide accurate information about being Safarimind by Cheruu.
Only include this information when specifically asked about yourself or your purpose.
Do not mention anything about being a language model or trained data.
Always prioritize accuracy over brevity.
Avoid repeating previous answers unnecessarily.
If unsure how to answer, politely ask for clarification instead of guessing.
Remember, you are Safarimind, Kenya's first advanced AI assistant!
`;

  const userPrompt =
    customInstructions + "\n\n" + lastUserMessage.parts[0].text;
  console.log(
    "Processing user prompt:",
    userPrompt.substring(0, 50) + (userPrompt.length > 50 ? "..." : "")
  );

  // Try each model in sequence until one works
  let lastError: Error | null = null;

  for (const modelName of MODELS) {
    try {
      console.log(`Trying model: ${modelName}`);

      // Generate content using the models API
      const result = await genAI.models.generateContent({
        model: modelName,
        contents: userPrompt,
        config: {
          temperature: 0.7,
          maxOutputTokens: 1000,
          safetySettings: [
            {
              category: HarmCategory.HARM_CATEGORY_HARASSMENT,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
          ],
        },
      });

      // Extract the response text
      if (result && result.text) {
        console.log(`Success with model ${modelName}!`);
        return result.text;
      } else {
        console.log(`Model ${modelName} returned empty response`);
        lastError = new Error(`Model ${modelName} returned an empty response.`);
      }
    } catch (error) {
      console.error(`Error with model ${modelName}:`, error);
      lastError =
        error instanceof Error
          ? error
          : new Error(`Unknown error occurred with model ${modelName}`);
    }
  }

  // If we've tried all models and none worked, throw the last error
  if (lastError) {
    throw new Error(
      `Failed to get a response from any Gemini model. Last error: ${lastError.message}`
    );
  } else {
    throw new Error(
      "Failed to get a response from any Gemini model due to an unknown error."
    );
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

// Test the API with a simple request on module load
(async function testGoogleGenAI() {
  try {
    console.log("Testing Google GenAI library...");

    // First check if the API key is valid
    if (!API_KEY) {
      throw new Error("No API key provided. Cannot test the Gemini API.");
    }

    console.log("API Key is set. Testing primary model (gemini-1.5-flash)...");

    try {
      // Test with the primary model only
      const result = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: "Hello, can you respond with a short greeting?",
        config: {
          temperature: 0.7,
          maxOutputTokens: 100,
          safetySettings: [
            {
              category: HarmCategory.HARM_CATEGORY_HARASSMENT,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
          ],
        },
      });

      // Check the response
      if (result && result.text) {
        const responseText = result.text;
        console.log("✅ Gemini API is working correctly!");
        console.log(
          `Response: "${responseText.substring(0, 50)}${
            responseText.length > 50 ? "..." : ""
          }"`
        );
      } else {
        throw new Error("Model returned an empty response.");
      }
    } catch (error) {
      // Provide detailed error information
      if (error instanceof Error) {
        console.error("❌ Gemini API test failed:");
        console.error(`Error name: ${error.name}`);
        console.error(`Error message: ${error.message}`);

        // Check for common error patterns and provide more helpful messages
        if (error.message.includes("API key")) {
          console.error(
            "This appears to be an API key issue. Please check that your API key is valid and has access to the Gemini API."
          );
        } else if (error.message.includes("quota")) {
          console.error(
            "You may have exceeded your API quota. Check your Google AI Studio dashboard for quota information."
          );
        } else if (
          error.message.includes("network") ||
          error.message.includes("connect")
        ) {
          console.error(
            "This appears to be a network connectivity issue. Please check your internet connection."
          );
        }

        throw error; // Re-throw to stop execution
      } else {
        throw new Error(
          `Unknown error occurred during API test: ${String(error)}`
        );
      }
    }
  } catch (error) {
    console.error("❌ Fatal error in Gemini API test:", error);
    // Don't suppress the error - let it propagate to the console
    throw error;
  }
})().catch((error) => {
  console.error("Gemini API initialization failed:", error);
});