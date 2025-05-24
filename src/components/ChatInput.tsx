import { useState, useRef, useEffect } from "react";
import {
  AlertTriangle,
  SendHorizontal,
  Sparkles,
  Paperclip,
  Brain,
  Search,
} from "lucide-react";

type ChatInputProps = {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  error?: string | null;
  maxLength?: number;
  hasChatContent?: boolean;
};

export default function ChatInput({
  onSendMessage,
  disabled = false,
  error = null,
  maxLength = 3000,
  hasChatContent = false,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [charsRemaining, setCharsRemaining] = useState(maxLength);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDeepThinkActive, setIsDeepThinkActive] = useState(false);
  const [isDeepSearchActive, setIsDeepSearchActive] = useState(false);

  // Auto-resize textarea as content changes and update character count
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        150
      )}px`;
    }
    setCharsRemaining(maxLength - message.length);
  }, [message, maxLength]);

  // Focus textarea when component mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Refocus when error is cleared
  useEffect(() => {
    if (!error && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [error]);

  // Handle message submission with debounce to prevent rapid submissions
  const handleSubmit = () => {
    // Prevent rapid message sending (debounce-like effect)
    if (disabled) return;
    // Validate input before sending
    if (message.trim() && !disabled && message.length <= maxLength) {
      onSendMessage(message.trim());
      setMessage("");

      // Reset height after clearing input
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }

      // Reset character count
      setCharsRemaining(maxLength);
    }
  };

  // Handle keyboard shortcuts with accessibility in mind
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Dynamic set of example prompts related to Kenya and Safarimind
  const [examplePrompts, setExamplePrompts] = useState([
    "Tell me about Kenyan cuisine",
    "What are Kenya's top tourist destinations?",
    "Who created Safarimind?",
    "Teach me some basic Swahili phrases",
  ]);

  // Rotate prompts periodically to make them dynamic
  useEffect(() => {
    const allPrompts = [
      // Kenya-related prompts
      "Tell me about Kenyan cuisine",
      "What are Kenya's top tourist destinations?",
      "Explain Kenya's climate and geography",
      "Tell me about Kenyan traditional music",
      "What are Kenya's major economic sectors?",
      "Describe Kenyan wildlife conservation efforts",
      "What is the history of Nairobi?",
      "Tell me about Kenyan athletes",

      // Safarimind-related prompts
      "Who created Safarimind?",
      "What makes Safarimind unique?",
      "How can Safarimind help Kenyan businesses?",
      "Tell me about Cheruu tech company",

      // Swahili-related prompts
      "Teach me some basic Swahili phrases",
      "Translate 'Hello, how are you?' to Swahili",
      "What are common Swahili names and their meanings?",

      // General knowledge with Kenyan context
      "How is technology changing education in Kenya?",
      "What are sustainable farming practices in Kenya?",
      "Explain Kenya's renewable energy initiatives",
    ];

    // Function to get 4 random prompts
    const getRandomPrompts = () => {
      const shuffled = [...allPrompts].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 4);
    };

    // Update prompts every 30 seconds
    const intervalId = setInterval(() => {
      setExamplePrompts(getRandomPrompts());
    }, 30000);

    // Initial set of random prompts
    setExamplePrompts(getRandomPrompts());

    return () => clearInterval(intervalId);
  }, []);

  // Insert example prompt when clicked
  const insertExamplePrompt = (prompt: string) => {
    setMessage(prompt);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Handle file attachment
  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // For demo purposes, just add the filename to the message
      const fileName = files[0].name;
      setMessage((prev) =>
        prev ? `${prev} [Attached: ${fileName}]` : `[Attached: ${fileName}]`
      );
    }
  };

  // Handle deep think toggle
  const toggleDeepThink = () => {
    setIsDeepThinkActive(!isDeepThinkActive);
    if (!isDeepThinkActive) {
      // Add deep think prefix to message
      setMessage((prev) => (prev ? `DeepThink: ${prev}` : "DeepThink: "));
    } else {
      // Remove deep think prefix from message
      setMessage((prev) =>
        prev.startsWith("DeepThink: ") ? prev.substring(11) : prev
      );
    }
  };

  // Handle deep search toggle
  const toggleDeepSearch = () => {
    setIsDeepSearchActive(!isDeepSearchActive);
    if (!isDeepSearchActive) {
      // Add deep search prefix to message
      setMessage((prev) => (prev ? `DeepSearch: ${prev}` : "DeepSearch: "));
    } else {
      // Remove deep search prefix from message
      setMessage((prev) =>
        prev.startsWith("DeepSearch: ") ? prev.substring(12) : prev
      );
    }
  };

  // Character count class based on remaining characters
  const getCharCountClass = () => {
    if (charsRemaining <= 100)
      return "text-red-500 dark:text-red-400 font-semibold";
    if (charsRemaining <= 300) return "text-amber-500 dark:text-amber-400";
    return "text-gray-400 dark:text-gray-500";
  };

  return (
    <div
      className={`px-1 sm:px-2 md:px-4 py-1 sm:py-2 md:py-3 ${
        !hasChatContent ? "border-t border-gray-200 dark:border-gray-700" : ""
      } bg-transparent sticky bottom-0 z-10`}
    >
      <div className="mx-auto max-w-full sm:max-w-4xl relative px-0.5 sm:px-1 md:px-2">
        {/* Example prompts row - only show when there's no chat content */}
        {message === "" && !disabled && !hasChatContent && (
          <div className="mb-1.5 sm:mb-2 md:mb-3 flex flex-wrap gap-1 sm:gap-1.5 justify-center">
            {examplePrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => insertExamplePrompt(prompt)}
                className="px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 md:py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-[10px] sm:text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors flex items-center"
                aria-label={`Try example: ${prompt}`}
              >
                <Sparkles
                  size={8}
                  className="mr-0.5 sm:hidden"
                  aria-hidden="true"
                />
                <Sparkles
                  size={10}
                  className="mr-1 hidden sm:block md:hidden"
                  aria-hidden="true"
                />
                <Sparkles
                  size={12}
                  className="mr-1 hidden md:block"
                  aria-hidden="true"
                />
                <span className="truncate max-w-[120px] sm:max-w-[150px] md:max-w-none">
                  {prompt}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="mb-1.5 sm:mb-2 md:mb-3 flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 md:p-2 text-[10px] sm:text-xs md:text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-md"
          >
            <AlertTriangle size={12} className="md:hidden" aria-hidden="true" />
            <AlertTriangle
              size={14}
              className="hidden md:block"
              aria-hidden="true"
            />
            <span>{error}</span>
          </div>
        )}

        {/* Input area with proper ARIA labels */}
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled}
        />

        {/* Unified chat input container with action buttons */}
        <div
          className={`border rounded-lg bg-transparent border-gray-300 dark:border-gray-600 ${
            error ? "border-red-500 dark:border-red-500" : ""
          } ${
            disabled ? "opacity-75" : ""
          } transition-all duration-200 overflow-hidden shadow-sm w-full`}
        >
          {/* Main input area */}
          <div className="flex items-end">
            <label htmlFor="chat-input" className="sr-only">
              Type your message
            </label>
            <textarea
              ref={textareaRef}
              id="chat-input"
              className="flex-grow w-full p-1.5 sm:p-2 md:p-3 bg-transparent outline-none resize-none text-sm md:text-base text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 hide-scrollbar"
              placeholder={
                disabled ? "AI is thinking..." : "Type your message..."
              }
              rows={1}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              aria-describedby={error ? "input-error" : "input-help"}
              aria-invalid={error ? "true" : "false"}
              maxLength={maxLength}
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            />
            <button
              className={`p-1 sm:p-1.5 md:p-2 m-0.5 sm:m-1 rounded-md ${
                disabled
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-500 dark:text-blue-300"
                  : message.trim() && message.length <= maxLength
                  ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-400 cursor-not-allowed"
              } transition-colors duration-200`}
              onClick={handleSubmit}
              disabled={
                !message.trim() || disabled || message.length > maxLength
              }
              aria-label="Send message"
              title={disabled ? "AI is thinking..." : "Send message"}
            >
              {disabled ? (
                <div
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 border-2 border-t-transparent border-blue-400 dark:border-blue-300 rounded-full animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <>
                  <SendHorizontal
                    size={12}
                    className="sm:hidden"
                    aria-hidden="true"
                  />
                  <SendHorizontal
                    size={14}
                    className="hidden sm:block md:hidden"
                    aria-hidden="true"
                  />
                  <SendHorizontal
                    size={16}
                    className="hidden md:block"
                    aria-hidden="true"
                  />
                </>
              )}
            </button>
          </div>

          {/* Action buttons row - now part of the same container */}
          <div className="flex items-center px-0.5 sm:px-1 md:px-2 py-0.5 sm:py-0.5 md:py-1 space-x-0.5 sm:space-x-1">
            {/* Attach file button */}
            <button
              className="p-1 sm:p-1.5 md:p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={handleAttachClick}
              disabled={disabled}
              aria-label="Attach file"
              title="Attach file"
            >
              <Paperclip size={12} className="md:hidden" />
              <Paperclip size={14} className="hidden md:block lg:hidden" />
              <Paperclip size={16} className="hidden lg:block" />
            </button>

            {/* Deep think button */}
            <button
              className={`p-1 sm:p-1.5 md:p-2 rounded-md transition-colors ${
                isDeepThinkActive
                  ? "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20"
                  : "text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              onClick={toggleDeepThink}
              disabled={disabled}
              aria-label="Deep thinking mode"
              title="Deep thinking mode"
            >
              <Brain size={12} className="md:hidden" />
              <Brain size={14} className="hidden md:block lg:hidden" />
              <Brain size={16} className="hidden lg:block" />
            </button>

            {/* Deep search button */}
            <button
              className={`p-1 sm:p-1.5 md:p-2 rounded-md transition-colors ${
                isDeepSearchActive
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                  : "text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              onClick={toggleDeepSearch}
              disabled={disabled}
              aria-label="Deep search mode"
              title="Deep search mode"
            >
              <Search size={12} className="md:hidden" />
              <Search size={14} className="hidden md:block lg:hidden" />
              <Search size={16} className="hidden lg:block" />
            </button>
          </div>
        </div>

        {/* Character counter and help text */}
        <div className="mt-1 sm:mt-1.5 md:mt-2 flex justify-between text-[10px] sm:text-xs">
          <span id="input-help" className="text-gray-400 dark:text-gray-500">
            {disabled ? "AI is thinking..." : ""}
          </span>
          <span className={getCharCountClass()}>
            <span className="sm:hidden">{charsRemaining} chars left</span>
            <span className="hidden sm:inline">
              {charsRemaining} characters remaining
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
