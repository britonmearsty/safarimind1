import { useState, useEffect, useCallback } from "react";
import Header from "./components/Header";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";
import Settings from "./components/Settings";
import ChatHistory from "./components/ChatHistory";
import LoadingScreen from "./components/LoadingScreen";
import { ToastProvider } from "./contexts/ToastContext";
import FeedbackDialog from "./components/FeedbackDialog";
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

// Import the consolidated AI response service
import {
  sendMessageToGemini,
  formatMessagesForGemini,
  generateUniqueGreeting,
} from "./services/aiResponseService";
import { useToast } from "./contexts/ToastContext";

// Function to generate AI responses using our consolidated AI service
const generateAIResponse = async (
  userMessage: string,
  messageHistory: Message[] = [],
): Promise<{ content: string; error?: boolean }> => {
  // Check if this is a greeting message
  const lowercaseMsg = userMessage.toLowerCase();
  if (
    lowercaseMsg.includes("hi") ||
    lowercaseMsg.includes("hello") ||
    lowercaseMsg.includes("hey") ||
    lowercaseMsg === "hi" ||
    lowercaseMsg === "hello"
  ) {
    console.log(
      "Detected greeting message, using specialized greeting function",
    );

    try {
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
      const greetingResponse = await generateUniqueGreeting(
        userMessage,
        userName,
      );
      return { content: greetingResponse };
    } catch (error) {
      console.error("Error generating unique greeting:", error);
      // Continue with normal flow if specialized greeting fails
    }
  }

  // Format the conversation history for the API
  const conversationHistory = [
    ...messageHistory,
    { content: userMessage, isUser: true, timestamp: formatTime() },
  ];
  const formattedMessages = formatMessagesForGemini(conversationHistory);

  // Log the formatted messages for debugging
  console.log("Formatted messages for AI service:", formattedMessages);

  try {
    console.log("Sending message to AI service...");
    const response = await sendMessageToGemini(formattedMessages);

    // Log the response for debugging
    console.log("AI response:", response);

    // Check if the response contains an error message
    if (
      response.startsWith("Error:") ||
      response.includes("I apologize, but I'm having trouble connecting")
    ) {
      console.log("AI service returned an error response");
      return {
        content:
          "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
        error: true,
      };
    }

    return { content: response };
  } catch (error) {
    console.error("Error with AI service:", error);

    // Instead of hardcoded responses, try a different approach with a local fallback model
    // or a simplified request to the API with minimal context
    try {
      console.log("Attempting emergency fallback with simplified context...");

      // Create a simplified context with clear instructions for the specific type of response needed
      const lowercaseMsg = userMessage.toLowerCase();
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

        contextualPrompt = `
Generate a completely unique greeting response as SafariMind, an AI assistant by Cheruu.

User greeting: "${userMessage}"

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
      }
      else if (lowercaseMsg.includes("help")) {
        contextualPrompt = `
As SafariMind, respond to this help request: "${userMessage}"
- Express willingness to assist
- Ask for more specific information if needed
- Maintain a helpful, supportive tone
- Briefly mention your capabilities if relevant
`;
      }
      else if (lowercaseMsg.includes("thank")) {
        contextualPrompt = `
As SafariMind, respond to this expression of gratitude: "${userMessage}"
- Express that you're happy to help
- Ask if there's anything else you can assist with
- Keep the response brief and warm
`;
      }
      else {
        contextualPrompt = `
As SafariMind, acknowledge this request that you're having trouble processing: "${userMessage}"
- Express that you're working to improve
- Suggest the user might try rephrasing their question
- Maintain a helpful, apologetic tone
- Don't make up information you don't have
`;
      }

      // Try one more time with a very simplified approach
      // This uses a different endpoint or configuration to maximize chances of success
      const emergencyResponse = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" +
          import.meta.env.VITE_GEMINI_API_KEY,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: contextualPrompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7, // Higher temperature for more creative responses
              maxOutputTokens: 150,
            },
          }),
        },
      );

      if (emergencyResponse.ok) {
        const data = await emergencyResponse.json();
        if (
          data.candidates &&
          data.candidates[0] &&
          data.candidates[0].content
        ) {
          const responseText = data.candidates[0].content.parts[0].text;
          return {
            content: responseText,
            error: false, // Not marking as error since we got a real response
          };
        }
      }

      // If the emergency request also fails, return a minimal response
      // This is not hardcoded content but a technical fallback message
      return {
        content: "Connection issue. Please try again.",
        error: true,
      };
    } catch (fallbackError) {
      console.error("All fallback attempts failed:", fallbackError);
      return {
        content: "Connection issue. Please try again.",
        error: true,
      };
    }
  }
};

// Welcome message removed - user will initiate the conversation

export default function App() {
  const { showToast } = useToast();
  // State for managing chat messages
  const [messages, setMessages] = useState<Message[]>([]);
  // State to track if AI is currently processing a response
  const [isProcessing, setIsProcessing] = useState(false);
  // State for panels
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  // State for dark mode
  const [isDarkMode, setIsDarkMode] = useState(false);
  // State for system theme preference
  const [isSystemTheme, setIsSystemTheme] = useState(true);
  // State for loading screen
  const [isLoading, setIsLoading] = useState(true);
  // State for feedback dialog
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [currentFeedbackMessageId, setCurrentFeedbackMessageId] = useState<
    string | null
  >(null);

  // Save current chat to localStorage whenever messages change
  useEffect(() => {
    // Only save if there are messages and they're not just typing indicators
    const messagesToSave = messages.filter((msg) => !msg.isTyping);
    if (messagesToSave.length > 0) {
      localStorage.setItem("currentChat", JSON.stringify(messagesToSave));
    }
    else {
      localStorage.removeItem("currentChat");
    }
  }, [messages]);

  // Initialize dark mode from localStorage/system preference and load saved chat messages
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
      "ease-in-out",
    );

    // Check if user has a saved preference for using system theme
    const savedSystemTheme = localStorage.getItem("useSystemTheme");
    const useSystemTheme = savedSystemTheme !== "false"; // Default to true if not set
    setIsSystemTheme(useSystemTheme);

    if (useSystemTheme) {
      // Use system preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      setIsDarkMode(prefersDark);
      if (prefersDark) {
        document.documentElement.classList.add("dark");
        document.body.classList.add("dark-mode-transition");
      }
      else {
        document.documentElement.classList.remove("dark");
        document.body.classList.remove("dark-mode-transition");
      }
    }
    else {
      // Use saved preference from localStorage
      const savedMode = localStorage.getItem("darkMode");
      if (savedMode === "true") {
        setIsDarkMode(true);
        document.documentElement.classList.add("dark");
        document.body.classList.add("dark-mode-transition");
      }
    }

    // Load current chat from localStorage
    const currentChat = localStorage.getItem("currentChat");
    if (currentChat) {
      try {
        const parsedMessages = JSON.parse(currentChat);
        if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
          // Mark all loaded messages as coming from storage
          const messagesWithFlag = parsedMessages.map((msg) => ({
            ...msg,
            fromStorage: true,
          }));
          setMessages(messagesWithFlag);
        }
        else {
          // Initialize with empty messages array if saved messages are empty
          setMessages([]);
        }
      } catch (error) {
        console.error("Error parsing current chat:", error);
        // Initialize with empty messages array if there's an error
        setMessages([]);
      }
    }
    else {
      // Initialize with empty messages array if no saved messages
      setMessages([]);
    }

    // Hide loading screen after a delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500); // 2.5 seconds loading time

    // Add event listener for system theme changes
    const darkModeMediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)",
    );
    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      if (isSystemTheme) {
        setIsDarkMode(event.matches);
        if (event.matches) {
          document.documentElement.classList.add("dark");
          document.body.classList.add("dark-mode-transition");
        }
        else {
          document.documentElement.classList.remove("dark");
          document.body.classList.remove("dark-mode-transition");
        }
      }
    };

    // Add event listener
    darkModeMediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      document.head.removeChild(link);
      clearTimeout(timer);
      darkModeMediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, [isSystemTheme]);

  // Toggle between system theme and manual theme
  // Memoized to prevent unnecessary re-renders
  const toggleSystemTheme = useCallback(() => {
    setIsSystemTheme((prevUseSystem) => {
      const newUseSystem = !prevUseSystem;
      localStorage.setItem("useSystemTheme", newUseSystem.toString());

      if (newUseSystem) {
        // Switch to system preference
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)",
        ).matches;
        setIsDarkMode(prefersDark);

        // Apply the theme
        document.body.classList.add("theme-transition");
        if (prefersDark) {
          document.documentElement.classList.add("dark");
          document.body.classList.add("dark-mode-transition");
        }
        else {
          document.documentElement.classList.remove("dark");
          document.body.classList.remove("dark-mode-transition");
        }
      }

      // Remove transition class after animation completes
      setTimeout(() => {
        document.body.classList.remove("theme-transition");
      }, 300);

      return newUseSystem;
    });
  }, []);

  // Toggle dark mode and save preference to localStorage
  // Memoized to prevent unnecessary re-renders
  const toggleDarkMode = useCallback(() => {
    // If using system theme, switch to manual mode first
    if (isSystemTheme) {
      setIsSystemTheme(false);
      localStorage.setItem("useSystemTheme", "false");

      // Start with the current system preference as the manual setting
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      setIsDarkMode(prefersDark);
      localStorage.setItem("darkMode", prefersDark.toString());

      // Apply the theme
      document.body.classList.add("theme-transition");
      if (prefersDark) {
        document.documentElement.classList.add("dark");
        document.body.classList.add("dark-mode-transition");
      }
      else {
        document.documentElement.classList.remove("dark");
        document.body.classList.remove("dark-mode-transition");
      }

      // Remove transition class after animation completes
      setTimeout(() => {
        document.body.classList.remove("theme-transition");
      }, 300);
    }
    else {
      // Toggle between light and dark mode manually
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
          }
          else {
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
    }
  }, [isSystemTheme]);

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
          `Message is too long. Please limit to ${MAX_MESSAGE_LENGTH} characters.`,
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
              }),
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
              }),
          );
        } finally {
          // Reset processing state
          setIsProcessing(false);
        }
      }, 1000);
    },
    [messages],
  );

  // Clear all chat messages and remove from localStorage
  // Memoized to prevent unnecessary re-renders
  const handleClearChat = useCallback(() => {
    if (messages.length > 0) {
      const confirmClear = window.confirm(
        "Are you sure you want to clear this chat?",
      );
      if (confirmClear) {
        setMessages([]);
        // Also clear the messages from localStorage
        localStorage.removeItem("chatMessages");
      }
    }
  }, [messages.length]);

  // Create a new chat and save the current one to history
  const handleNewChat = useCallback(() => {
    // Only save to history if there are actual messages
    const messagesToSave = messages.filter((msg) => !msg.isTyping);
    if (messagesToSave.length > 0) {
      // Get existing chat history
      const chatHistoryStr = localStorage.getItem("chatHistory");
      let chatHistory = [];

      if (chatHistoryStr) {
        try {
          chatHistory = JSON.parse(chatHistoryStr);
        } catch (error) {
          console.error("Error parsing chat history:", error);
        }
      }

      // Create a new chat history entry
      const chatTitle =
        messagesToSave[0]?.content.split(" ").slice(0, 5).join(" ") +
        (messagesToSave[0]?.content.split(" ").length > 5 ? "..." : "");

      const newChatEntry = {
        id: Date.now().toString(),
        title: chatTitle,
        messages: messagesToSave,
        timestamp: new Date().toISOString(),
        date: new Date(),
        favorite: false,
        tags: [],
        category: "General",
      };

      // Add to history and save
      chatHistory.unshift(newChatEntry);
      localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
    }

    // Clear current chat
    setMessages([]);
    localStorage.removeItem("currentChat");
  }, [messages]);

  // Message action handlers
  const handleEditMessage = useCallback(
    (messageId: string, newContent: string) => {
      // Update the message content
      setMessages((prev) => {
        const updatedMessages = prev.map((msg) =>
          msg.id === messageId ? { ...msg, content: newContent } : msg,
        );

        // Find the edited message
        const editedMessageIndex = updatedMessages.findIndex(
          (msg) => msg.id === messageId,
        );
        const editedMessage = updatedMessages[editedMessageIndex];

        // If it's a user message and there's an AI response after it, regenerate the AI response
        if (
          editedMessage &&
          editedMessage.isUser &&
          editedMessageIndex < updatedMessages.length - 1
        ) {
          const nextMessage = updatedMessages[editedMessageIndex + 1];

          // If the next message is from AI, we'll regenerate it
          if (!nextMessage.isUser) {
            // Set processing state
            setIsProcessing(true);

            // Replace the AI message with a typing indicator
            const typingMessageId = Date.now().toString();
            const messagesWithTyping = updatedMessages.map((msg, index) => {
              if (index === editedMessageIndex + 1) {
                return {
                  id: typingMessageId,
                  content: "AI is typing a response...",
                  isUser: false,
                  timestamp: formatTime(),
                  isTyping: true,
                };
              }
              return msg;
            });

            // Generate new response after a short delay
            setTimeout(async () => {
              try {
                // Get previous messages for context (excluding the typing indicator)
                const messageHistory = messagesWithTyping
                  .filter((msg) => !msg.isTyping)
                  .slice(0, editedMessageIndex + 1); // Include only messages up to the edited user message

                // Generate AI response based on edited user input and conversation history
                const response = await generateAIResponse(
                  newContent,
                  messageHistory,
                );

                // Replace typing indicator with new response
                setMessages((prev) =>
                  prev.map((msg, index) => {
                    if (index === editedMessageIndex + 1) {
                      return {
                        id: Date.now().toString(),
                        content: response.content,
                        isUser: false,
                        timestamp: formatTime(),
                        isError: response.error,
                      };
                    }
                    return msg;
                  }),
                );
              } catch (error) {
                console.error(
                  "Error in handleEditMessage regeneration:",
                  error,
                );

                // If service fails, provide a thoughtful generic response
                setMessages((prev) =>
                  prev.map((msg, index) => {
                    if (index === editedMessageIndex + 1) {
                      return {
                        id: Date.now().toString(),
                        content:
                          "I've reconsidered your updated question and would like to offer a response. The topic you've raised is interesting and I'd be happy to explore it further with you.",
                        isUser: false,
                        timestamp: formatTime(),
                        isError: false,
                      };
                    }
                    return msg;
                  }),
                );
              } finally {
                setIsProcessing(false);
              }
            }, 1000);

            return messagesWithTyping;
          }
        }

        return updatedMessages;
      });
    },
    [setIsProcessing, generateAIResponse],
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
              messageHistory,
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
                }),
            );
          } catch (error) {
            console.error("Error in handleRegenerateResponse:", error);

            // If service fails, provide a thoughtful generic response
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
                }),
            );
          } finally {
            setIsProcessing(false);
          }
        }, 1000);
      }
    },
    [messages],
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
    [messages],
  );

  // Handle like action
  const handleLikeMessage = useCallback(() => {
    // In a real app, this would send the like to a backend
    // For now, just show a toast notification
    showToast("Thanks for your feedback!", "success");
  }, [showToast]);

  // Handle dislike action
  const handleDislikeMessage = useCallback((messageId: string) => {
    // Set the current message ID and open the feedback dialog
    setCurrentFeedbackMessageId(messageId);
    setIsFeedbackDialogOpen(true);
  }, []);

  // Toggle panels
  // Memoized to prevent unnecessary re-renders
  // Commented out to fix TypeScript errors - can be re-enabled when needed
  /*
  const toggleSettings = useCallback(() => {
    setIsSettingsOpen((prev) => !prev);
    if (isHistoryOpen) setIsHistoryOpen(false);
  }, [isHistoryOpen]);
  */

  const toggleHistory = useCallback(() => {
    setIsHistoryOpen((prev) => !prev);
    if (isSettingsOpen) setIsSettingsOpen(false);
  }, [isSettingsOpen]);

  return (
    <ToastProvider position="bottom-right" maxToasts={3}>
      <div
        className="flex flex-col h-screen w-screen overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-950 dark:to-blue-950"
        style={{ fontFamily: "Inter, sans-serif" }}>
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
            <main className="flex-1 flex flex-col overflow-hidden main-content w-full">
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col chat-container">
                  <div className="flex-1"></div>
                  <ChatWindow
                    messages={messages}
                    aria-live="polite"
                    aria-atomic="false"
                    aria-relevant="additions"
                    onEditMessage={handleEditMessage}
                    onRegenerateResponse={handleRegenerateResponse}
                    onExportPdf={handleExportPdf}
                    onLikeMessage={handleLikeMessage}
                    onDislikeMessage={handleDislikeMessage}
                  />
                  <div className="bg-transparent" style={{ borderTop: "none" }}>
                    <div className="no-border-override bg-transparent">
                      <ChatInput
                        onSendMessage={handleSendMessage}
                        disabled={isProcessing}
                        error={inputError}
                        maxLength={3000}
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
                    onEditMessage={handleEditMessage}
                    onRegenerateResponse={handleRegenerateResponse}
                    onExportPdf={handleExportPdf}
                    onLikeMessage={handleLikeMessage}
                    onDislikeMessage={handleDislikeMessage}
                  />
                  <div className="bg-transparent">
                    <ChatInput
                      onSendMessage={handleSendMessage}
                      disabled={isProcessing}
                      error={inputError}
                      maxLength={3000}
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
              isSystemTheme={isSystemTheme}
              toggleDarkMode={toggleDarkMode}
              toggleSystemTheme={toggleSystemTheme}
            />
            <ChatHistory
              isOpen={isHistoryOpen}
              onClose={() => setIsHistoryOpen(false)}
              messages={messages}
              onLoadChat={(chatMessages) => {
                setMessages(chatMessages);
                // Save loaded chat as current chat
                localStorage.setItem(
                  "currentChat",
                  JSON.stringify(chatMessages),
                );
              }}
            />
            <FeedbackDialog
              isOpen={isFeedbackDialogOpen}
              onClose={() => setIsFeedbackDialogOpen(false)}
              messageId={currentFeedbackMessageId}
            />
          </>
        )}
      </div>
    </ToastProvider>
  );
}
