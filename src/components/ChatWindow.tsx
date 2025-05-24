import { useRef, useEffect, useState, memo } from "react";
import ChatMessage from "./ChatMessage";

type Message = {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  isTyping?: boolean; // Flag to indicate AI is typing
  isError?: boolean; // Flag to indicate error message
  fromStorage?: boolean; // Flag to indicate message was loaded from localStorage
};

// Define Booleanish type for ARIA attributes
type Booleanish = boolean | "true" | "false";

type ChatWindowProps = {
  messages: Message[];
  "aria-live"?: "off" | "polite" | "assertive";
  "aria-atomic"?: Booleanish;
  "aria-relevant"?:
    | "text"
    | "additions"
    | "additions removals"
    | "additions text"
    | "all"
    | "removals"
    | "removals additions"
    | "removals text"
    | "text additions"
    | "text removals";
  onEditMessage?: (messageId: string, newContent: string) => void;
  onRegenerateResponse?: (messageId: string) => void;
  onExportPdf?: (messageId: string) => void;
  onLikeMessage?: (messageId: string) => void;
  onDislikeMessage?: (messageId: string) => void;
};

// Memoized component to prevent unnecessary re-renders
const ChatWindow = memo(function ChatWindow({
  messages,
  "aria-live": ariaLive = "polite",
  "aria-atomic": ariaAtomic = "false",
  "aria-relevant": ariaRelevant = "additions",
  onEditMessage,
  onRegenerateResponse,
  onExportPdf,
  onLikeMessage,
  onDislikeMessage,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change with smooth behavior
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Keyboard navigation within chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only intercept if we're focused within the chat container
      if (!chatContainerRef.current?.contains(document.activeElement)) {
        return;
      }

      if (e.key === "Home") {
        e.preventDefault();
        chatContainerRef.current.scrollTop = 0;
        // Focus first message if possible
        const firstMessage =
          chatContainerRef.current.querySelector('[role="listitem"]');
        if (firstMessage instanceof HTMLElement) {
          firstMessage.focus();
        }
      } else if (e.key === "End") {
        e.preventDefault();
        messagesEndRef.current?.scrollIntoView();
        // Focus last message if possible
        const allMessages =
          chatContainerRef.current.querySelectorAll('[role="listitem"]');
        const lastMessage = allMessages[allMessages.length - 1];
        if (lastMessage instanceof HTMLElement) {
          lastMessage.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // State for welcome message with username
  const [welcomeMessage, setWelcomeMessage] = useState<string>(
    "Hello! I'm SafariMind. How can I help you today?"
  );
  const [isLoadingWelcome, setIsLoadingWelcome] = useState<boolean>(true);

  // Load simple welcome message with username on component mount
  useEffect(() => {
    const loadWelcomeMessage = () => {
      try {
        setIsLoadingWelcome(true);
        // Get user's name from profile data in localStorage
        const savedProfileData = localStorage.getItem("profileData");
        let userName = "Briton";

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

        // Set a simple welcome message with the username
        setWelcomeMessage(`Hello ${userName}!`);
      } catch (error) {
        console.error("Error loading welcome message:", error);
        // Fallback message if there's an error
        setWelcomeMessage("Hello!");
      } finally {
        setIsLoadingWelcome(false);
      }
    };

    loadWelcomeMessage();
  }, []);

  // Render empty state when no messages
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-4 bg-transparent">
        <div className="w-16 h-16 mb-4 rounded-full flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            width="100%"
            height="100%"
            viewBox="0 0 48 48"
          >
            <radialGradient
              id="chatWindowGradient1"
              cx="-670.437"
              cy="617.13"
              r=".041"
              gradientTransform="matrix(128.602 652.9562 653.274 -128.6646 -316906.281 517189.719)"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stop-color="#1ba1e3"></stop>
              <stop offset="0" stop-color="#1ba1e3"></stop>
              <stop offset=".3" stop-color="#5489d6"></stop>
              <stop offset=".545" stop-color="#9b72cb"></stop>
              <stop offset=".825" stop-color="#d96570"></stop>
              <stop offset="1" stop-color="#f49c46"></stop>
            </radialGradient>
            <path
              fill="url(#chatWindowGradient1)"
              d="M22.882,31.557l-1.757,4.024c-0.675,1.547-2.816,1.547-3.491,0l-1.757-4.024	c-1.564-3.581-4.378-6.432-7.888-7.99l-4.836-2.147c-1.538-0.682-1.538-2.919,0-3.602l4.685-2.08	c3.601-1.598,6.465-4.554,8.002-8.258l1.78-4.288c0.66-1.591,2.859-1.591,3.52,0l1.78,4.288c1.537,3.703,4.402,6.659,8.002,8.258	l4.685,2.08c1.538,0.682,1.538,2.919,0,3.602l-4.836,2.147C27.26,25.126,24.446,27.976,22.882,31.557z"
            ></path>
            <radialGradient
              id="chatWindowGradient2"
              cx="-670.437"
              cy="617.13"
              r=".041"
              gradientTransform="matrix(128.602 652.9562 653.274 -128.6646 -316906.281 517189.719)"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stop-color="#1ba1e3"></stop>
              <stop offset="0" stop-color="#1ba1e3"></stop>
              <stop offset=".3" stop-color="#5489d6"></stop>
              <stop offset=".545" stop-color="#9b72cb"></stop>
              <stop offset=".825" stop-color="#d96570"></stop>
              <stop offset="1" stop-color="#f49c46"></stop>
            </radialGradient>
            <path
              fill="url(#chatWindowGradient2)"
              d="M39.21,44.246l-0.494,1.132	c-0.362,0.829-1.51,0.829-1.871,0l-0.494-1.132c-0.881-2.019-2.467-3.627-4.447-4.506l-1.522-0.676	c-0.823-0.366-0.823-1.562,0-1.928l1.437-0.639c2.03-0.902,3.645-2.569,4.511-4.657l0.507-1.224c0.354-0.853,1.533-0.853,1.886,0	l0.507,1.224c0.866,2.088,2.481,3.755,4.511,4.657l1.437,0.639c0.823,0.366,0.823,1.562,0,1.928l-1.522,0.676	C41.677,40.619,40.091,42.227,39.21,44.246z"
            ></path>
          </svg>
        </div>
        {isLoadingWelcome ? (
          <h2
            className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2"
            tabIndex={0}
          >
            Loading...
          </h2>
        ) : (
          <div className="text-center">
            <div
              className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2"
              tabIndex={0}
              dangerouslySetInnerHTML={{ __html: welcomeMessage }}
            />
          </div>
        )}
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md">
          Ask me anything! I can help with information, problem-solving, and
          more.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={chatContainerRef}
      className="flex-1 overflow-y-auto bg-transparent scroll-smooth focus:outline-none"
      tabIndex={-1}
      role="log"
      aria-live={ariaLive}
      aria-atomic={ariaAtomic}
      aria-relevant={ariaRelevant}
      aria-label="Chat conversation"
    >
      <div
        className="py-1 sm:py-3 md:py-5 w-full max-w-full px-1 sm:px-3 md:px-5 sm:max-w-4xl mx-auto space-y-2 sm:space-y-3 md:space-y-4"
        role="list"
      >
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            content={message.content}
            isUser={message.isUser}
            timestamp={message.timestamp}
            isTyping={message.isTyping}
            isError={message.isError}
            fromStorage={message.fromStorage}
            onEdit={(newContent) =>
              onEditMessage && onEditMessage(message.id, newContent)
            }
            onRegenerate={() =>
              onRegenerateResponse && onRegenerateResponse(message.id)
            }
            onExportPdf={() => onExportPdf && onExportPdf(message.id)}
            onLike={() => onLikeMessage && onLikeMessage(message.id)}
            onDislike={() => onDislikeMessage && onDislikeMessage(message.id)}
          />
        ))}
      </div>
      <div
        ref={messagesEndRef}
        className="h-4 sm:h-8 md:h-12"
        aria-hidden="true"
      />{" "}
      {/* Added padding at bottom for better scroll experience */}
    </div>
  );
});

// Set display name for debugging
ChatWindow.displayName = "ChatWindow";
export default ChatWindow;
