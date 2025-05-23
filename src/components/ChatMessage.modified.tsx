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
} from "lucide-react";
import { useState, useRef, memo } from "react";

type MessageProps = {
  content: string;
  isUser: boolean;
  timestamp: string;
  isTyping?: boolean;
  isError?: boolean;
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

  // Reference to the message content for screen readers
  const messageRef = useRef<HTMLDivElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Copy message content to clipboard
  const copyToClipboard = async () => {
    try {
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
        alert("Content copied to clipboard for sharing");
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

    // Render error message with an icon
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

    return (
      <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
        {content}
      </p>
    );
  };

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} px-4 py-2.5`}
      aria-label={`${isUser ? "Your message" : "AI message"}`}
    >
      <div
        className={`flex max-w-[80%] ${
          isUser ? "flex-row-reverse" : "flex-row"
        } gap-2 items-start animate-fadeIn`}
        role="listitem"
      >
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 ${
            isUser
              ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
              : isError
              ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
              : "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300"
          }`}
          aria-hidden="true"
        >
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>

        <div
          className={`${
            isUser
              ? "bg-transparent dark:bg-transparent text-gray-800 dark:text-gray-100 rounded-2xl rounded-tr-sm border border-blue-200/50 dark:border-blue-700/30"
              : "bg-transparent dark:bg-transparent text-gray-800 dark:text-gray-200 rounded-2xl rounded-tl-sm"
          } px-4 py-3 max-w-full break-words group`}
          tabIndex={0}
        >
          <div
            className={`prose prose-sm ${
              isUser ? "prose-invert" : "dark:prose-invert"
            } max-w-none`}
            aria-live={!isUser && !isTyping ? "polite" : "off"}
          >
            <div ref={messageRef}>{renderContent()}</div>

            {/* Action buttons for user messages */}
            {isUser && !isTyping && !isEditing && (
              <div className="mt-2 flex justify-end gap-0.5 text-gray-400 dark:text-gray-500 bg-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
                    <Check size={12} aria-hidden="true" />
                  ) : (
                    <Copy size={12} aria-hidden="true" />
                  )}
                </button>

                <button
                  onClick={handleEditClick}
                  className="p-1 rounded-md inline-flex items-center text-xs hover:bg-blue-100 dark:hover:bg-blue-800 hover:text-blue-600 dark:hover:text-blue-300 transition-colors focus:outline-none"
                  aria-label="Edit message"
                  title="Edit message"
                >
                  <Edit size={12} aria-hidden="true" />
                </button>
              </div>
            )}

            {/* Action buttons for AI responses */}
            {!isUser && !isTyping && !isError && (
              <div className="mt-2 flex flex-wrap justify-end gap-0.5 text-gray-500 dark:text-gray-400 bg-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={handleRegenerate}
                  className="p-1 rounded-md inline-flex items-center text-xs hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400 transition-colors focus:outline-none"
                  aria-label="Regenerate response"
                  title="Regenerate response"
                >
                  <RefreshCw size={12} aria-hidden="true" />
                </button>

                <button
                  onClick={copyToClipboard}
                  className={`p-1.5 rounded-md inline-flex items-center text-xs ${
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
                    <Check size={12} aria-hidden="true" />
                  ) : (
                    <Copy size={12} aria-hidden="true" />
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

            {/* Copy button for error messages */}
            {!isUser && !isTyping && isError && (
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
            
            {/* Timestamp at bottom left */}
            <div className="flex justify-start mt-2">
              <span
                className={`text-xs ${
                  isUser
                    ? "text-blue-400 dark:text-blue-500"
                    : isError
                    ? "text-red-400 dark:text-red-500"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                {timestamp}
                {isTyping && (
                  <span className="ml-2 animate-pulse">
                    typing...
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// Default export with display name for better debugging
ChatMessage.displayName = "ChatMessage";
export default ChatMessage;