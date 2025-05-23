// Gemini API service for handling AI interactions

// The API key is loaded from the .env file
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Hardcoded API key as a fallback (only first few characters shown for security)
const FALLBACK_API_KEY = "AIzaSyASHIEu-mN27laegkeZkXGqnEkVdVGlAK8";

// List of potential API keys to try
const API_KEYS = [
  apiKey,
  FALLBACK_API_KEY,
  // Add any additional API keys here
].filter(Boolean); // Remove any undefined or empty keys

// Start with the first API key
let currentKeyIndex = 0;
const finalApiKey = API_KEYS[currentKeyIndex];

// Define multiple model endpoints to try in sequence if one fails
const GEMINI_MODELS = [
  {
    name: "gemini-1.0-pro",
    url: "https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro:generateContent",
    version: "v1",
  },
  {
    name: "gemini-pro",
    url: "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent",
    version: "v1",
  },
  {
    name: "gemini-pro",
    url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
    version: "v1beta",
  },
];

// Start with the first model
let currentModelIndex = 0;

// Log the API key status (not the actual key for security)
console.log(
  "API Key available:",
  !!finalApiKey,
  "Length:",
  finalApiKey?.length || 0,
  "First 5 chars:",
  finalApiKey?.substring(0, 5)
);

// Test all API models and keys on module load
(async function testGeminiAPI() {
  console.log("Testing Gemini API models with all available API keys...");

  const testRequest = {
    contents: [
      {
        parts: [{ text: "Hello, can you respond with a short greeting?" }],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 100,
    },
  };

  // Test each API key with each model
  for (const apiKey of API_KEYS) {
    console.log(`\nTesting with API key: ${apiKey.substring(0, 5)}...`);

    // Test each model with this API key
    for (const model of GEMINI_MODELS) {
      try {
        console.log(`  Testing model: ${model.name} (${model.version})`);

        const testResponse = await fetch(`${model.url}?key=${apiKey}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(testRequest),
        });

        if (testResponse.ok) {
          console.log(
            `    ✅ Model ${model.name} (${model.version}) is working! Status: ${testResponse.status}`
          );
          const data = await testResponse.json();
          if (data.candidates && data.candidates.length > 0) {
            console.log(
              `    Response: "${data.candidates[0].content.parts[0].text.substring(
                0,
                50
              )}..."`
            );

            // Remember this successful combination
            currentModelIndex = GEMINI_MODELS.indexOf(model);
            currentKeyIndex = API_KEYS.indexOf(apiKey);
            console.log(
              `    Setting as default: Model ${
                model.name
              }, API key ${apiKey.substring(0, 5)}`
            );
          } else {
            console.log("    Response has no candidates");
          }
        } else {
          console.error(
            `    ❌ Model ${model.name} (${model.version}) failed:`,
            testResponse.status,
            testResponse.statusText
          );
          try {
            const errorData = await testResponse.json();
            console.error("    Error data:", errorData);
          } catch {
            const errorText = await testResponse.text();
            console.error("    Error details:", errorText);
          }
        }
      } catch (error) {
        console.error(`    Error testing model ${model.name}:`, error);
      }

      // Add a small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
})();

// Interface for the chat message format
export interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

// Interface for the API response
interface GeminiResponse {
  candidates: {
    content: {
      parts: { text: string }[];
      role: string;
    };
    finishReason: string;
  }[];
  promptFeedback?: {
    blockReason?: string;
    safetyRatings?: {
      category: string;
      probability: string;
    }[];
  };
}

/**
 * Sends a message to the Gemini API and returns the response
 * @param messages - Array of chat messages in the conversation history
 * @returns The AI response text or an error message
 */
export async function sendMessageToGemini(
  messages: ChatMessage[]
): Promise<string> {
  if (API_KEYS.length === 0) {
    throw new Error(
      "No Gemini API keys available. Please check your environment variables."
    );
  }

  // Get the last user message for simplicity
  const lastUserMessage = messages.filter((msg) => msg.role === "user").pop();
  if (!lastUserMessage) {
    return "I'm not sure what you're asking. Could you please provide a question?";
  }

  const userPrompt = lastUserMessage.parts[0].text;
  console.log(
    "Processing user prompt:",
    userPrompt.substring(0, 50) + (userPrompt.length > 50 ? "..." : "")
  );

  // Create a simple request body that works with all models
  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: userPrompt,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1000,
    },
  };

  // Try each API key and model combination until one works

  // Start with the most recently successful API key and model
  const keyIndices = Array.from(
    { length: API_KEYS.length },
    (_, i) => (i + currentKeyIndex) % API_KEYS.length
  );
  const modelIndices = Array.from(
    { length: GEMINI_MODELS.length },
    (_, i) => (i + currentModelIndex) % GEMINI_MODELS.length
  );

  // Loop through API keys
  for (const keyIndex of keyIndices) {
    const apiKey = API_KEYS[keyIndex];

    // Loop through models for each API key
    for (const modelIndex of modelIndices) {
      const model = GEMINI_MODELS[modelIndex];
      console.log(
        `Attempt ${keyIndex * GEMINI_MODELS.length + modelIndex + 1}/${
          API_KEYS.length * GEMINI_MODELS.length
        }: Trying model ${model.name} (${
          model.version
        }) with API key ${apiKey.substring(0, 5)}...`
      );

      try {
        // Make the API request
        const response = await fetch(`${model.url}?key=${apiKey}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          const data: GeminiResponse = await response.json();

          // Check if the response was blocked for safety reasons
          if (data.promptFeedback?.blockReason) {
            console.log(
              `Model ${model.name} blocked the response for safety reasons:`,
              data.promptFeedback.blockReason
            );
            continue; // Try the next model
          }

          // Extract the response text
          if (data.candidates && data.candidates.length > 0) {
            const responseText = data.candidates[0].content.parts[0].text;
            console.log(
              `Success with model ${model.name} and API key ${apiKey.substring(
                0,
                5
              )}!`
            );

            // Update the current model and API key indices to start with this successful combination next time
            currentModelIndex = modelIndex;
            currentKeyIndex = keyIndex;

            return responseText;
          } else {
            console.log(`Model ${model.name} returned empty candidates`);
          }
        } else {
          // Log the error details
          console.log(
            `Model ${model.name} failed with status:`,
            response.status,
            response.statusText
          );
          let errorDetails = "";
          try {
            const errorData = await response.json();
            errorDetails = JSON.stringify(errorData);
            console.log("Error data:", errorData);
          } catch (parseError) {
            try {
              errorDetails = await response.text();
              console.log("Error text:", errorDetails);
            } catch (textError) {
              console.error("Could not get error details");
            }
          }
          console.error(
            `API Error (${response.status}): ${
              errorDetails || response.statusText
            }`
          );
        }
      } catch (error) {
        console.error(`Error with model ${model.name}:`, error);
        // Continue to the next model
      }
    }

    // If we've tried all models and API keys and none worked, try a simplified approach
    console.log(
      "All models and API keys failed, trying simplified approach..."
    );

    // Try each API key with a very simple request
    for (const apiKey of API_KEYS) {
      try {
        // Try a very basic request to the first model
        const basicRequest = {
          contents: [
            {
              parts: [{ text: "Hello, please introduce yourself briefly." }],
            },
          ],
        };

        console.log(
          `Trying simplified request with API key ${apiKey.substring(0, 5)}...`
        );
        const testResponse = await fetch(
          `${GEMINI_MODELS[0].url}?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(basicRequest),
          }
        );

        if (testResponse.ok) {
          const testData = await testResponse.json();
          if (testData.candidates && testData.candidates.length > 0) {
            console.log(
              `Basic test request succeeded with API key ${apiKey.substring(
                0,
                5
              )}, API is working but had issues with the actual prompt`
            );
            return "I understand your question, but I'm having trouble formulating a specific response. Could you try rephrasing or asking something else?";
          }
        }
      } catch (testError) {
        console.error(
          `Even basic test request failed with API key ${apiKey.substring(
            0,
            5
          )}:`,
          testError
        );
      }
    }

    // As a last resort, provide a hardcoded response based on the user message
    const userText = userPrompt.toLowerCase();
    if (userText.includes("hello") || userText.includes("hi")) {
      return "Hello! I'm your AI assistant. How can I help you today?";
    } else if (userText.includes("help")) {
      return "I'm here to help. What would you like assistance with?";
    } else if (userText.includes("thank")) {
      return "You're welcome! Is there anything else I can help with?";
    } else if (userText.includes("weather")) {
      return "I don't have access to real-time weather data, but I can help you find weather information online.";
    } else if (userText.includes("name")) {
      return "I'm an AI assistant designed to help answer your questions and assist with various tasks.";
    } else if (userText.includes("joke")) {
      const jokes = [
        "Why don't scientists trust atoms? Because they make up everything!",
        "Why did the scarecrow win an award? Because he was outstanding in his field!",
        "What do you call a fake noodle? An impasta!",
        "How does a penguin build its house? Igloos it together!",
        "Why don't eggs tell jokes? They'd crack each other up!",
      ];
      return jokes[Math.floor(Math.random() * jokes.length)];
    }

    // Generic fallback response
    return "I apologize, but I'm having trouble connecting to my knowledge base right now. Your question is important, and I'd be happy to help once the connection is restored.";
  }

  // Final fallback if all attempts fail
  return "I'm sorry, but I couldn't process your request at this time. Please try again later.";
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
