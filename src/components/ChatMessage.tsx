import {
  AlertTriangle,
  Bot,
  Check,
  Copy,
  User,
  Edit,
  Share,
  ThumbsUp,
  ThumbsDown,
  FileText,
  RefreshCw,
  ClipboardCopy,
} from "lucide-react";
import { useState, useRef, memo, useCallback, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useToast } from "../contexts/ToastContext";

type MessageProps = {
  content: string;
  isUser: boolean;
  timestamp: string;
  isTyping?: boolean;
  isError?: boolean;
  fromStorage?: boolean;
  onEdit?: (content: string) => void;
  onRegenerate?: () => void;
  onLike?: () => void;
  onDislike?: () => void;
  onExportPdf?: () => void;
};

// Memoized component to prevent unnecessary re-renders
const ChatMessage = memo(function ChatMessage({
  content,
  isUser,
  timestamp,
  isTyping = false,
  isError = false,
  fromStorage = false,
  onEdit,
  onRegenerate,
  onLike,
  onDislike,
  onExportPdf,
}: MessageProps) {
  // State to manage feedback and interactions
  const [isCopied, setIsCopied] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  // State for typing effect
  const [displayedText, setDisplayedText] = useState("");
  const [isTypingEffect, setIsTypingEffect] = useState(
    !isUser && !isTyping && !isError
  );

  // Typing effect implementation
  useEffect(() => {
    // Only apply typing effect to NEW AI responses that aren't error messages, already typing, or loaded from storage
    if (isUser || isTyping || isError || fromStorage) {
      setDisplayedText(content);
      setIsTypingEffect(false);
      return;
    }

    // Reset displayed text when content changes
    setDisplayedText("");
    setIsTypingEffect(true);

    // Create a clean version of the content to display
    const cleanContent = content;

    // Set up variables for the typing effect
    let index = 0;
    // Speed of typing (milliseconds per character)
    const typingSpeed = 15;

    // Function to add one character at a time
    const typeNextCharacter = () => {
      if (index < cleanContent.length) {
        // Important: We're directly setting the text up to the current index
        // instead of appending to previous text to avoid duplication
        setDisplayedText(cleanContent.substring(0, index + 1));
        index++;
        setTimeout(typeNextCharacter, typingSpeed);
      } else {
        setIsTypingEffect(false);
      }
    };

    // Start typing effect with a small delay
    setTimeout(typeNextCharacter, 100);

    // Cleanup function
    return () => {
      setIsTypingEffect(false);
    };
  }, [content, isUser, isTyping, isError]);

  // Reference to the message content for screen readers
  const messageRef = useRef<HTMLDivElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Copy message content to clipboard
  const copyToClipboard = async () => {
    try {
      // Always copy the plain text content, not the HTML
      await navigator.clipboard.writeText(content);
      setIsCopied(true);

      // Reset copy status after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  // Handle edit mode toggle
  const handleEditClick = () => {
    setIsEditing(true);
    setEditedContent(content);
    // Focus the textarea after it renders
    setTimeout(() => {
      if (editTextareaRef.current) {
        editTextareaRef.current.focus();
      }
    }, 0);
  };

  // Handle edit save
  const handleEditSave = () => {
    if (onEdit && editedContent.trim() !== "") {
      onEdit(editedContent);
    }
    setIsEditing(false);
  };

  // Handle edit cancel
  const handleEditCancel = () => {
    setIsEditing(false);
    setEditedContent(content);
  };

  // Handle regenerate
  const handleRegenerate = () => {
    if (onRegenerate) {
      onRegenerate();
    }
  };

  // Handle like/dislike
  const handleLike = () => {
    setIsLiked(!isLiked);
    setIsDisliked(false);
    if (onLike) {
      onLike();
    }
  };

  const handleDislike = () => {
    setIsDisliked(!isDisliked);
    setIsLiked(false);
    if (onDislike) {
      onDislike();
    }
  };

  // Handle export to PDF
  const handleExportPdf = () => {
    if (onExportPdf) {
      onExportPdf();
    }
  };

  // Get toast context
  const { showToast } = useToast();

  // Handle share
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Shared from WebVenture Chat",
          text: content,
        });
      } else {
        await navigator.clipboard.writeText(content);
        showToast("Content copied to clipboard for sharing", "success");
      }
    } catch (err) {
      console.error("Failed to share: ", err);
    }
  };
  // Render typing animation for AI responses that are in "typing" state
  const renderContent = () => {
    if (isTyping) {
      return (
        <div
          className="flex space-x-1 items-center mt-1"
          aria-label="AI is typing"
        >
          <div
            className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"
            style={{ animationDelay: "300ms" }}
          ></div>
        </div>
      );
    }

    // Render error message with an icon (always as plain text)
    if (isError) {
      return (
        <div className="flex items-start gap-2 text-red-600 dark:text-red-400">
          <AlertTriangle
            size={16}
            className="flex-shrink-0 mt-1"
            aria-hidden="true"
          />
          <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
        </div>
      );
    }

    // Render edit mode
    if (isEditing && isUser) {
      return (
        <div className="w-full">
          <textarea
            ref={editTextareaRef}
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={Math.max(3, editedContent.split("\n").length)}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={handleEditCancel}
              className="px-3 py-1 text-xs rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleEditSave}
              className="px-3 py-1 text-xs rounded-md bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>
      );
    }

    // Use ReactMarkdown for AI responses, but keep plain text for user messages
    if (isUser) {
      return (
        <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed text-xs sm:text-sm break-words">
          {content}
        </p>
      );
    } else {
      // No blinking cursor needed

      return (
        <div className="markdown-content text-gray-800 dark:text-gray-200 text-xs sm:text-sm break-words">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Style headings with different colors
              h1: ({ node, ...props }) => (
                <h1
                  className="text-lg font-bold my-3 text-purple-700 dark:text-purple-400"
                  {...props}
                />
              ),
              h2: ({ node, ...props }) => (
                <h2
                  className="text-base font-bold my-2 text-blue-600 dark:text-blue-400"
                  {...props}
                />
              ),
              h3: ({ node, ...props }) => (
                <h3
                  className="text-sm font-bold my-2 text-teal-600 dark:text-teal-400"
                  {...props}
                />
              ),
              // Style links
              a: ({ node, ...props }) => (
                <a
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                  {...props}
                />
              ),
              // Style code blocks and inline code with copy button only for multiline blocks
              code: ({ node, className, children, ...props }: any) => {
                const codeText = String(children).replace(/\n$/, "");
                const [isCopied, setIsCopied] = useState(false);

                const handleCopyCode = useCallback(() => {
                  navigator.clipboard.writeText(codeText);
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                }, [codeText]);

                const match = /language-(\w+)/.exec(className || "");
                const language = match ? match[1] : "";

                // Check if this is inline code (no line breaks and not in a pre tag)
                const isInline =
                  !className?.includes("language-") &&
                  String(children).indexOf("\n") === -1;

                // Enhanced inline code - better styling with background and border
                if (isInline) {
                  return (
                    <code
                      className="font-mono text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-800/30"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                }

                // Extremely simplified code blocks - single container with minimal styling
                return (
                  <div className="my-2 sm:my-3">
                    {/* Single code block container with language header and copy button */}
                    <div
                      className="code-block rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden bg-transparent dark:bg-transparent max-w-full"
                      data-language={language || "code"}
                    >
                      {/* Header with language and copy button */}
                      <div className="flex justify-between items-center bg-transparent dark:bg-transparent px-3 py-1 border-b border-gray-200 dark:border-gray-700">
                        {/* Language indicator */}
                        <span
                          className="text-xs font-medium"
                          data-language={language || "code"}
                        >
                          {language || "Code"}
                        </span>

                        {/* Copy button - integrated into header */}
                        <button
                          onClick={handleCopyCode}
                          className={`p-1 rounded ${
                            isCopied
                              ? "text-green-600 dark:text-green-400"
                              : "text-gray-600 dark:text-gray-400"
                          }`}
                          aria-label={isCopied ? "Copied!" : "Copy code"}
                          title={isCopied ? "Copied!" : "Copy code"}
                        >
                          {isCopied ? (
                            <Check size={14} />
                          ) : (
                            <ClipboardCopy size={14} />
                          )}
                        </button>
                      </div>

                      {/* Code content - directly in container */}
                      <pre className="m-0 p-0 overflow-auto bg-transparent dark:bg-transparent">
                        <code
                          className={`block p-3 pl-8 text-sm font-mono ${className} text-left bg-transparent dark:bg-transparent`}
                          {...props}
                        >
                          {children}
                        </code>
                      </pre>
                    </div>
                  </div>
                );
              },
              // Style lists with enhanced visuals
              ul: ({ node, ...props }) => (
                <ul
                  className="list-disc pl-6 my-3 space-y-1 text-gray-700 dark:text-gray-300"
                  {...props}
                />
              ),
              ol: ({ node, ...props }) => (
                <ol
                  className="list-decimal pl-6 my-3 space-y-1 text-gray-700 dark:text-gray-300"
                  {...props}
                />
              ),
              // Style list items
              li: ({ node, ...props }) => <li className="my-1" {...props} />,
              // Style blockquotes with a more distinct appearance
              blockquote: ({ node, ...props }) => (
                <blockquote
                  className="border-l-4 border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 pl-4 py-2 italic my-3 text-gray-700 dark:text-gray-300 rounded-r-md"
                  {...props}
                />
              ),
              // Style tables with better visuals and fixed dimensions to prevent wiggling
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto my-4 rounded-md border border-gray-200 dark:border-gray-700 w-full table-fixed">
                  <table
                    className="border-collapse w-full min-w-full table-fixed"
                    style={{ tableLayout: "fixed" }}
                    {...props}
                  />
                </div>
              ),
              thead: ({ node, ...props }) => (
                <thead
                  className="bg-transparent dark:bg-transparent text-gray-700 dark:text-gray-300"
                  {...props}
                />
              ),
              th: ({ node, ...props }) => (
                <th
                  className="border-b border-r border-gray-200 dark:border-gray-700 px-4 py-2 text-left font-semibold whitespace-nowrap overflow-hidden text-ellipsis"
                  style={{ minWidth: "100px" }}
                  {...props}
                />
              ),
              td: ({ node, ...props }) => (
                <td
                  className="border-b border-r border-gray-200 dark:border-gray-700 px-4 py-2 overflow-hidden"
                  {...props}
                />
              ),
              // Style horizontal rules with a gradient effect
              hr: () => (
                <div className="my-6 flex items-center justify-center">
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-400 dark:via-gray-500 to-transparent" />
                </div>
              ),
            }}
          >
            {isTypingEffect ? displayedText : content}
          </ReactMarkdown>
          {/* No blinking cursor */}
        </div>
      );
    }
  };

  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      } px-0.5 sm:px-2 md:px-4 py-1 sm:py-2 md:py-3`}
      aria-label={`${isUser ? "Your message" : "AI message"}`}
    >
      <div
        className={`flex ${
          isUser
            ? "max-w-[95%] sm:max-w-[85%] md:max-w-[75%] flex-row-reverse"
            : "max-w-[95%] sm:max-w-[90%] md:max-w-[85%] flex-row"
        } gap-0.5 sm:gap-2 items-start animate-fadeIn`}
        role="listitem"
      >
        <div
          className={`flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full flex-shrink-0 ${
            isUser
              ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
              : isError
              ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
              : "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300"
          }`}
          aria-hidden="true"
        >
          {isUser ? (
            <>
              <User size={10} className="md:hidden" />
              <User size={12} className="hidden md:block" />
            </>
          ) : (
            <>
              <Bot size={10} className="md:hidden" />
              <Bot size={12} className="hidden md:block" />
            </>
          )}
        </div>

        <div
          className={`${
            isUser
              ? "bg-transparent dark:bg-transparent text-gray-800 dark:text-gray-100 rounded-lg sm:rounded-xl rounded-tr-sm border border-blue-200/50 dark:border-blue-700/30 px-1.5 py-1 sm:px-2.5 sm:py-2 md:px-3 md:py-2"
              : "bg-transparent dark:bg-transparent text-gray-800 dark:text-gray-200 rounded-lg sm:rounded-xl rounded-tl-sm px-1.5 py-1 sm:px-2.5 sm:py-2 md:px-3 md:py-2.5"
          } max-w-full break-words group w-full`}
          tabIndex={0}
        >
          <div
            className={`prose prose-xs ${
              isUser ? "prose-invert" : "dark:prose-invert"
            } max-w-none text-xs sm:text-sm leading-relaxed overflow-hidden`}
            aria-live={!isUser && !isTyping ? "polite" : "off"}
          >
            <div ref={messageRef}>{renderContent()}</div>

            {/* Action buttons for user messages */}
            {isUser && !isTyping && !isEditing && (
              <div className="mt-1.5 sm:mt-2 flex justify-end gap-0.5 text-gray-400 dark:text-gray-500 bg-transparent rounded-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={copyToClipboard}
                  className={`p-1 rounded-md inline-flex items-center text-xs ${
                    isCopied
                      ? "text-green-500 dark:text-green-400"
                      : "hover:bg-blue-100 dark:hover:bg-blue-800 hover:text-blue-600 dark:hover:text-blue-300"
                  } transition-colors focus:outline-none`}
                  aria-label={
                    isCopied
                      ? "Copied to clipboard"
                      : "Copy message to clipboard"
                  }
                  title={isCopied ? "Copied!" : "Copy to clipboard"}
                >
                  {isCopied ? (
                    <>
                      <Check
                        size={10}
                        className="sm:hidden"
                        aria-hidden="true"
                      />
                      <Check
                        size={12}
                        className="hidden sm:block"
                        aria-hidden="true"
                      />
                    </>
                  ) : (
                    <>
                      <Copy
                        size={10}
                        className="sm:hidden"
                        aria-hidden="true"
                      />
                      <Copy
                        size={12}
                        className="hidden sm:block"
                        aria-hidden="true"
                      />
                    </>
                  )}
                </button>

                <button
                  onClick={handleEditClick}
                  className="p-1 rounded-md inline-flex items-center text-xs hover:bg-blue-100 dark:hover:bg-blue-800 hover:text-blue-600 dark:hover:text-blue-300 transition-colors focus:outline-none"
                  aria-label="Edit message"
                  title="Edit message"
                >
                  <Edit size={10} className="sm:hidden" aria-hidden="true" />
                  <Edit
                    size={12}
                    className="hidden sm:block"
                    aria-hidden="true"
                  />
                </button>
              </div>
            )}

            {/* Action buttons for AI responses - only show when typing effect is complete */}
            {!isUser && !isTyping && !isError && !isTypingEffect && (
              <div className="mt-1.5 sm:mt-2 flex flex-wrap justify-end gap-0.5 text-gray-500 dark:text-gray-400 bg-transparent rounded-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={handleRegenerate}
                  className="p-1 rounded-md inline-flex items-center text-xs hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400 transition-colors focus:outline-none"
                  aria-label="Regenerate response"
                  title="Regenerate response"
                >
                  <RefreshCw
                    size={10}
                    className="sm:hidden"
                    aria-hidden="true"
                  />
                  <RefreshCw
                    size={12}
                    className="hidden sm:block"
                    aria-hidden="true"
                  />
                </button>

                <button
                  onClick={copyToClipboard}
                  className={`p-1 rounded-md inline-flex items-center text-xs ${
                    isCopied
                      ? "text-green-500 dark:text-green-400"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300"
                  } transition-colors focus:outline-none`}
                  aria-label={
                    isCopied
                      ? "Copied to clipboard"
                      : "Copy message to clipboard"
                  }
                  title={isCopied ? "Copied!" : "Copy to clipboard"}
                >
                  {isCopied ? (
                    <>
                      <Check
                        size={10}
                        className="sm:hidden"
                        aria-hidden="true"
                      />
                      <Check
                        size={12}
                        className="hidden sm:block"
                        aria-hidden="true"
                      />
                    </>
                  ) : (
                    <>
                      <Copy
                        size={10}
                        className="sm:hidden"
                        aria-hidden="true"
                      />
                      <Copy
                        size={12}
                        className="hidden sm:block"
                        aria-hidden="true"
                      />
                    </>
                  )}
                </button>

                <button
                  onClick={handleShare}
                  className="p-1.5 rounded-md inline-flex items-center text-xs hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none"
                  aria-label="Share response"
                  title="Share response"
                >
                  <Share size={12} aria-hidden="true" />
                </button>

                <button
                  onClick={handleLike}
                  className={`p-1.5 rounded-md inline-flex items-center text-xs ${
                    isLiked
                      ? "text-green-500 dark:text-green-400 bg-green-50 dark:bg-green-900/20"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300"
                  } transition-colors focus:outline-none`}
                  aria-label={isLiked ? "Remove like" : "Like response"}
                  title={isLiked ? "Remove like" : "Like response"}
                >
                  <ThumbsUp size={12} aria-hidden="true" />
                </button>

                <button
                  onClick={handleDislike}
                  className={`p-1.5 rounded-md inline-flex items-center text-xs ${
                    isDisliked
                      ? "text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300"
                  } transition-colors focus:outline-none`}
                  aria-label={
                    isDisliked ? "Remove dislike" : "Dislike response"
                  }
                  title={isDisliked ? "Remove dislike" : "Dislike response"}
                >
                  <ThumbsDown size={12} aria-hidden="true" />
                </button>

                <button
                  onClick={handleExportPdf}
                  className="p-1.5 rounded-md inline-flex items-center text-xs hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300 transition-colors focus:outline-none"
                  aria-label="Export as PDF"
                  title="Export as PDF"
                >
                  <FileText size={12} aria-hidden="true" />
                </button>
              </div>
            )}

            {/* Copy button for error messages - only show when typing effect is complete */}
            {!isUser && !isTyping && isError && !isTypingEffect && (
              <div className="mt-2 flex justify-end gap-0.5 text-red-500 dark:text-red-400 bg-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={copyToClipboard}
                  className={`p-1.5 rounded-md inline-flex items-center text-xs ${
                    isCopied
                      ? "text-green-500 dark:text-green-400"
                      : "hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
                  } transition-colors focus:outline-none`}
                  aria-label={
                    isCopied
                      ? "Copied to clipboard"
                      : "Copy error message to clipboard"
                  }
                  title={isCopied ? "Copied!" : "Copy to clipboard"}
                >
                  {isCopied ? (
                    <Check size={12} aria-hidden="true" />
                  ) : (
                    <Copy size={12} aria-hidden="true" />
                  )}
                </button>
              </div>
            )}

            {/* Timestamp at bottom left - only for non-user messages and when typing is complete */}
            {!isUser && (!isTypingEffect || isTyping) && (
              <div className="flex justify-start mt-2">
                <span
                  className={`text-xs ${
                    isError
                      ? "text-red-400 dark:text-red-500"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {timestamp}
                  {isTyping && (
                    <span className="ml-2 animate-pulse">typing...</span>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

// Default export with display name for better debugging
ChatMessage.displayName = "ChatMessage";
export default ChatMessage;
