import {
  Clock,
  X,
  Search,
  Trash2,
  Star,
  Download,
  Filter,
  Calendar,
  Tag,
  Edit,
  Save,
  Share2,
  ArrowUpDown,
  CheckSquare,
  Square,
  ExternalLink,
  FileText,
  FileJson,
  FileSpreadsheet,
  FileCode,
  Files,
} from "lucide-react";
import { useEffect, useRef, memo, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useToast } from "../contexts/ToastContext";

type Message = {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  isTyping?: boolean;
  isError?: boolean;
};

type ChatHistoryProps = {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  onLoadChat?: (messages: Message[]) => void;
};

type ChatItem = {
  id: string;
  title: string;
  preview: string;
  timestamp: string;
  timeAgo: string;
  date: Date;
  messages: Message[];
  favorite: boolean;
  tags: string[];
  category: string;
  lastEdited?: Date;
  exportFormat?: "txt" | "json" | "pdf";
  selected?: boolean;
};

type GroupedChats = {
  [key: string]: {
    title: string;
    chats: ChatItem[];
  };
};

// Memoized component to prevent unnecessary re-renders
const ChatHistory = memo(function ChatHistory({
  isOpen,
  onClose,
  messages,
  onLoadChat,
}: ChatHistoryProps) {
  const { showToast } = useToast();
  const modalRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [selectedChat, setSelectedChat] = useState<ChatItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [allChats, setAllChats] = useState<ChatItem[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [sortOrder, setSortOrder] = useState<
    "newest" | "oldest" | "alphabetical"
  >("newest");
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedChats, setSelectedChats] = useState<string[]>([]);
  const [isMobileView, setIsMobileView] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([
    "SafariMind",
    "Cheruu",
    "Important",
    "Work",
    "Personal",
    "Research",
    "Ideas",
    "Follow-up",
  ]);
  const [availableCategories] = useState<string[]>([
    "General",
    "Work",
    "Personal",
    "Research",
    "Creative",
    "Technical",
  ]);

  // Group chats by date categories (Today, Last 7 Days, This Year)
  const getGroupedChats = (): GroupedChats => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    const thisYear = new Date(today);
    thisYear.setDate(1);
    thisYear.setMonth(0);

    // Get chat history from localStorage
    const chatHistoryStr = localStorage.getItem("chatHistory");
    let chatItems: ChatItem[] = [];

    if (chatHistoryStr) {
      try {
        const parsedHistory = JSON.parse(chatHistoryStr);
        if (Array.isArray(parsedHistory)) {
          chatItems = parsedHistory.map((chat) => {
            // Ensure chat has all required properties
            const chatDate = new Date(
              chat.date || chat.timestamp || Date.now()
            );
            const daysDiff = Math.floor(
              (today.getTime() - chatDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            // Format timeAgo string
            let timeAgo;
            if (daysDiff === 0) {
              timeAgo =
                Math.floor(
                  (today.getTime() - chatDate.getTime()) / (1000 * 60)
                ) + " minutes ago";
              if (timeAgo.startsWith("0 ")) timeAgo = "just now";
            } else if (daysDiff === 1) {
              timeAgo = "yesterday";
            } else if (daysDiff < 7) {
              timeAgo = daysDiff + " days ago";
            } else {
              const options: Intl.DateTimeFormatOptions = {
                month: "short",
                day: "numeric",
              };
              timeAgo = chatDate.toLocaleDateString(undefined, options);
            }

            // Generate preview from first AI response if available
            let preview = "";
            const aiMessage = chat.messages.find((msg: Message) => !msg.isUser);
            if (aiMessage) {
              preview =
                aiMessage.content.substring(0, 60) +
                (aiMessage.content.length > 60 ? "..." : "");
            }

            return {
              id: chat.id || Date.now().toString(),
              title: chat.title || "Untitled Chat",
              preview: preview,
              timestamp: chat.timestamp || new Date().toISOString(),
              timeAgo: timeAgo,
              date: chatDate,
              messages: chat.messages || [],
              favorite: chat.favorite || false,
              tags: chat.tags || [],
              category: chat.category || "General",
              lastEdited: chat.lastEdited
                ? new Date(chat.lastEdited)
                : chatDate,
              selected: false,
            };
          });
        }
      } catch (error) {
        console.error("Error parsing chat history:", error);
      }
    }

    // Process and group the chat items
    const groupedChats: GroupedChats = {
      today: {
        title: "Today",
        chats: [],
      },
      lastWeek: {
        title: "Last 7 Days",
        chats: [],
      },
      thisYear: {
        title: "This Year",
        chats: [],
      },
    };

    // Group chats into categories
    chatItems.forEach((chat) => {
      const chatDate = new Date(chat.date);

      // Add to appropriate group
      if (chatDate >= new Date(new Date().setHours(0, 0, 0, 0))) {
        groupedChats.today.chats.push(chat);
      } else if (chatDate >= sevenDaysAgo) {
        groupedChats.lastWeek.chats.push(chat);
      } else if (chatDate >= thisYear) {
        groupedChats.thisYear.chats.push(chat);
      }
    });

    return groupedChats;
  };

  // Get all chats as a flat array
  const getAllChats = useCallback(() => {
    const groupedChats = getGroupedChats();
    let allChats: ChatItem[] = [];

    Object.keys(groupedChats).forEach((key) => {
      allChats = [...allChats, ...groupedChats[key].chats];
    });

    return allChats;
  }, [messages, availableTags, availableCategories]);

  // Update allChats when messages change
  useEffect(() => {
    setAllChats(getAllChats());
  }, [messages, getAllChats]);

  // Filter and sort chats
  const getFilteredAndSortedChats = useCallback(() => {
    let filtered = [...allChats];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (chat) =>
          chat.title.toLowerCase().includes(query) ||
          chat.preview.toLowerCase().includes(query) ||
          chat.messages.some((msg) =>
            msg.content.toLowerCase().includes(query)
          ) ||
          chat.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Apply tag filters
    if (selectedTags.length > 0) {
      filtered = filtered.filter((chat) =>
        selectedTags.every((tag) => chat.tags.includes(tag))
      );
    }

    // Apply category filter
    if (selectedFilter !== "all" && selectedFilter !== "favorites") {
      filtered = filtered.filter((chat) => chat.category === selectedFilter);
    }

    // Apply favorites filter
    if (selectedFilter === "favorites") {
      filtered = filtered.filter((chat) => chat.favorite);
    }

    // Apply sorting
    switch (sortOrder) {
      case "newest":
        filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
        break;
      case "oldest":
        filtered.sort((a, b) => a.date.getTime() - b.date.getTime());
        break;
      case "alphabetical":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return filtered;
  }, [allChats, searchQuery, selectedTags, selectedFilter, sortOrder]);

  // Toggle favorite status
  const toggleFavorite = (chatId: string) => {
    // Find the chat to determine if we're adding or removing from favorites
    const chat = allChats.find((c) => c.id === chatId);
    const isFavorite = chat?.favorite;

    setAllChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId ? { ...chat, favorite: !chat.favorite } : chat
      )
    );

    // If the selected chat is the one being favorited, update it too
    if (selectedChat?.id === chatId) {
      setSelectedChat((prev) =>
        prev ? { ...prev, favorite: !prev.favorite } : null
      );
    }

    // Show toast notification
    showToast(
      isFavorite
        ? "Conversation removed from favorites"
        : "Conversation added to favorites",
      "success"
    );
  };

  // Add tag to a chat
  const addTagToChat = (chatId: string, tag: string) => {
    if (!tag.trim()) return;

    setAllChats((prev) =>
      prev.map((chat) => {
        if (chat.id === chatId && !chat.tags.includes(tag)) {
          return { ...chat, tags: [...chat.tags, tag] };
        }
        return chat;
      })
    );

    // If the selected chat is the one being tagged, update it too
    if (selectedChat?.id === chatId) {
      setSelectedChat((prev) => {
        if (prev && !prev.tags.includes(tag)) {
          return { ...prev, tags: [...prev.tags, tag] };
        }
        return prev;
      });
    }

    // Add to available tags if it's new
    if (!availableTags.includes(tag)) {
      setAvailableTags((prev) => [...prev, tag]);
    }

    // Show success toast notification
    showToast(`Tag "${tag}" added to conversation`, "success");

    setNewTag("");
    setIsAddingTag(false);
  };

  // Remove tag from a chat
  const removeTagFromChat = (chatId: string, tagToRemove: string) => {
    setAllChats((prev) =>
      prev.map((chat) => {
        if (chat.id === chatId) {
          return {
            ...chat,
            tags: chat.tags.filter((tag) => tag !== tagToRemove),
          };
        }
        return chat;
      })
    );

    // If the selected chat is the one being modified, update it too
    if (selectedChat?.id === chatId) {
      setSelectedChat((prev) => {
        if (prev) {
          return {
            ...prev,
            tags: prev.tags.filter((tag) => tag !== tagToRemove),
          };
        }
        return prev;
      });
    }

    // Show success toast notification
    showToast(`Tag "${tagToRemove}" removed from conversation`, "success");
  };

  // Update chat title
  const updateChatTitle = (chatId: string, newTitle: string) => {
    if (!newTitle.trim()) return;

    setAllChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? { ...chat, title: newTitle, lastEdited: new Date() }
          : chat
      )
    );

    // If the selected chat is the one being edited, update it too
    if (selectedChat?.id === chatId) {
      setSelectedChat((prev) =>
        prev ? { ...prev, title: newTitle, lastEdited: new Date() } : null
      );
    }

    setEditingTitle(false);
  };

  // Change chat category
  const changeChatCategory = (chatId: string, newCategory: string) => {
    setAllChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId ? { ...chat, category: newCategory } : chat
      )
    );

    // If the selected chat is the one being modified, update it too
    if (selectedChat?.id === chatId) {
      setSelectedChat((prev) =>
        prev ? { ...prev, category: newCategory } : null
      );
    }
  };

  // Delete a chat
  const deleteChat = (chatId: string) => {
    // First update the local state
    setAllChats((prev) => prev.filter((chat) => chat.id !== chatId));

    // If the selected chat is the one being deleted, clear selection
    if (selectedChat?.id === chatId) {
      setSelectedChat(null);
    }

    // Then update localStorage
    const chatHistoryStr = localStorage.getItem("chatHistory");
    if (chatHistoryStr) {
      try {
        const chatHistory = JSON.parse(chatHistoryStr);
        const updatedHistory = chatHistory.filter(
          (chat: any) => chat.id !== chatId
        );
        localStorage.setItem("chatHistory", JSON.stringify(updatedHistory));
      } catch (error) {
        console.error("Error updating chat history:", error);
      }
    }

    // Show success toast notification
    showToast("Conversation deleted successfully", "success");
  };

  // Delete multiple chats
  const deleteSelectedChats = () => {
    if (selectedChats.length === 0) return;

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedChats.length} selected conversations?`
      )
    ) {
      // Update local state
      setAllChats((prev) =>
        prev.filter((chat) => !selectedChats.includes(chat.id))
      );

      // If the selected chat is among those being deleted, clear selection
      if (selectedChat && selectedChats.includes(selectedChat.id)) {
        setSelectedChat(null);
      }

      // Update localStorage
      const chatHistoryStr = localStorage.getItem("chatHistory");
      if (chatHistoryStr) {
        try {
          const chatHistory = JSON.parse(chatHistoryStr);
          const updatedHistory = chatHistory.filter(
            (chat: any) => !selectedChats.includes(chat.id)
          );
          localStorage.setItem("chatHistory", JSON.stringify(updatedHistory));
        } catch (error) {
          console.error("Error updating chat history:", error);
        }
      }

      // Show success toast notification
      const count = selectedChats.length;
      showToast(
        `${count} ${
          count === 1 ? "conversation" : "conversations"
        } deleted successfully`,
        "success"
      );

      setSelectedChats([]);
      setIsMultiSelectMode(false);
    }
  };

  // Toggle chat selection in multi-select mode
  const toggleChatSelection = (chatId: string) => {
    if (selectedChats.includes(chatId)) {
      setSelectedChats((prev) => prev.filter((id) => id !== chatId));
    } else {
      setSelectedChats((prev) => [...prev, chatId]);
    }

    // Update the selected status in allChats
    setAllChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId ? { ...chat, selected: !chat.selected } : chat
      )
    );
  };

  // Load a chat into the main window
  const loadChatToMainWindow = (chat: ChatItem) => {
    if (onLoadChat && chat.messages && chat.messages.length > 0) {
      onLoadChat(chat.messages);
      onClose();
      showToast("Chat loaded successfully", "success");
    } else {
      showToast("Cannot load empty chat", "error");
    }
  };

  // Export multiple chats as a zip file
  const exportMultipleChats = (
    chatIds: string[],
    format: "txt" | "json" | "csv" | "html"
  ) => {
    if (chatIds.length === 0) return;

    // If only one chat is selected, use the regular export function
    if (chatIds.length === 1) {
      const chat = allChats.find((c) => c.id === chatIds[0]);
      if (chat) {
        exportChat(chat, format);
      }
      return;
    }

    // Show a loading toast
    showToast(
      `Preparing ${
        chatIds.length
      } chats for export as ${format.toUpperCase()}...`,
      "info"
    );

    // For multiple chats, we would ideally use a library like JSZip to create a zip file
    // containing all the exported chats. For now, we'll export them one by one with a delay

    const selectedChats = allChats.filter((chat) => chatIds.includes(chat.id));

    // Export each chat with a small delay between them
    selectedChats.forEach((chat, index) => {
      setTimeout(() => {
        exportChat(chat, format, false); // Pass false to suppress individual success messages
      }, index * 300); // 300ms delay between each export
    });

    // Show a final success message after all exports are likely complete
    setTimeout(() => {
      showToast(
        `Exported ${
          selectedChats.length
        } conversations as ${format.toUpperCase()}`,
        "success"
      );
    }, selectedChats.length * 300 + 500);
  };

  // Export chat as file
  const exportChat = (
    chat: ChatItem,
    format: "txt" | "json" | "pdf" | "csv" | "html",
    showNotification = true
  ) => {
    // Show a loading toast if showNotification is true
    if (showNotification) {
      showToast(`Preparing ${format.toUpperCase()} export...`, "info");
    }

    // Create a sanitized filename
    let filename = `SafariMind-Chat-${chat.title
      .replace(/[^a-z0-9]/gi, "-")
      .toLowerCase()}-${new Date().toISOString().split("T")[0]}`;

    // Use setTimeout to allow the UI to update before processing
    setTimeout(() => {
      let content = "";
      let mimeType = "";
      let blob;

      if (format === "txt") {
        content = `SafariMind AI Chat\n`;
        content += `Title: ${chat.title}\n`;
        content += `Date: ${chat.date.toLocaleString()}\n`;
        content += `Category: ${chat.category}\n`;
        content += `Tags: ${chat.tags.join(", ")}\n\n`;
        content += `CONVERSATION:\n\n`;

        chat.messages.forEach((msg) => {
          // Format the message with proper indentation for readability
          const formattedContent = msg.content
            .split("\n")
            .map((line, i) => (i > 0 ? "    " + line : line))
            .join("\n");

          content += `${msg.isUser ? "You" : "SafariMind AI"} (${
            msg.timestamp
          }):\n${formattedContent}\n\n`;
        });

        filename += ".txt";
        mimeType = "text/plain";
        blob = new Blob([content], { type: mimeType });
      } else if (format === "json") {
        const jsonData = {
          title: chat.title,
          date: chat.date.toISOString(),
          category: chat.category,
          tags: chat.tags,
          messages: chat.messages.map((msg) => ({
            role: msg.isUser ? "user" : "assistant",
            content: msg.content,
            timestamp: msg.timestamp,
            id: msg.id,
          })),
          metadata: {
            exportDate: new Date().toISOString(),
            messageCount: chat.messages.length,
            userMessageCount: chat.messages.filter((m) => m.isUser).length,
            assistantMessageCount: chat.messages.filter((m) => !m.isUser)
              .length,
          },
        };

        content = JSON.stringify(jsonData, null, 2);
        filename += ".json";
        mimeType = "application/json";
        blob = new Blob([content], { type: mimeType });
      } else if (format === "csv") {
        // CSV header
        content = "Role,Timestamp,Content\n";

        // Add each message as a row
        chat.messages.forEach((msg) => {
          // Properly escape content for CSV format
          const escapedContent = msg.content
            .replace(/"/g, '""') // Escape quotes by doubling them
            .replace(/\n/g, " "); // Replace newlines with spaces

          content += `"${msg.isUser ? "User" : "Assistant"}","${
            msg.timestamp
          }","${escapedContent}"\n`;
        });

        filename += ".csv";
        mimeType = "text/csv";
        blob = new Blob([content], { type: mimeType });
      } else if (format === "html") {
        // Create an HTML representation of the chat
        content = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${chat.title}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { margin-bottom: 20px; }
    .message { padding: 10px; margin-bottom: 10px; border-radius: 8px; }
    .user { background-color: #e6f7ff; text-align: right; }
    .assistant { background-color: #f5f5f5; }
    .timestamp { font-size: 0.8em; color: #888; margin-top: 5px; }
    pre { background-color: #f0f0f0; padding: 10px; border-radius: 4px; overflow-x: auto; }
    code { font-family: monospace; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${chat.title}</h1>
    <p>Date: ${new Date(chat.date).toLocaleString()}</p>
    <p>Category: ${chat.category}</p>
    <p>Tags: ${chat.tags.join(", ") || "None"}</p>
  </div>
  <div class="conversation">`;

        // Add each message
        chat.messages.forEach((msg) => {
          // Convert markdown to HTML for assistant messages
          let messageContent = msg.content;
          if (!msg.isUser) {
            // Simple markdown conversion for code blocks and basic formatting
            messageContent = messageContent
              .replace(/```([^`]+)```/g, "<pre><code>$1</code></pre>")
              .replace(/`([^`]+)`/g, "<code>$1</code>")
              .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
              .replace(/\*([^*]+)\*/g, "<em>$1</em>")
              .replace(/\n/g, "<br>");
          } else {
            // For user messages, just replace newlines with <br>
            messageContent = messageContent.replace(/\n/g, "<br>");
          }

          content += `
  <div class="message ${msg.isUser ? "user" : "assistant"}">
    <div class="content">${messageContent}</div>
    <div class="timestamp">${msg.isUser ? "You" : "SafariMind AI"} • ${
            msg.timestamp
          }</div>
  </div>`;
        });

        content += `
  </div>
</body>
</html>`;

        filename += ".html";
        mimeType = "text/html";
        blob = new Blob([content], { type: mimeType });
      } else if (format === "pdf") {
        // For PDF, we'll create an HTML representation first, then convert it to PDF
        // This would typically use a library like html2pdf.js, jsPDF, or pdfmake
        // For now, we'll just show a toast message
        showToast(
          "PDF export would require a PDF generation library. Try HTML export instead.",
          "info"
        );
        return;
      }

      if (blob) {
        // Create and download the file
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Show success toast notification if showNotification is true
        if (showNotification) {
          showToast(
            `Conversation exported as ${format.toUpperCase()} successfully`,
            "success"
          );
        }
      }
    }, 100); // Small delay to allow UI to update
  };

  // Share chat
  const shareChat = (chat: ChatItem) => {
    // In a real app, this would open a sharing dialog or copy a link
    const shareText = `Check out my conversation with SafariMind AI by Cheruu: "${chat.title}"`;

    if (navigator.share) {
      navigator
        .share({
          title: "SafariMind AI Conversation",
          text: shareText,
          url: "https://safarimind.cheruu.com/share/" + chat.id,
        })
        .catch((err) => {
          console.error("Error sharing:", err);
          // Fallback to clipboard
          navigator.clipboard.writeText(
            shareText + " https://safarimind.cheruu.com/share/" + chat.id
          );
          showToast("Share link copied to clipboard!", "success");
        });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(
        shareText + " https://safarimind.cheruu.com/share/" + chat.id
      );
      showToast("Share link copied to clipboard!", "success");
    }
  };

  const filteredChats = getFilteredAndSortedChats();
  const groupedChats = getGroupedChats();

  // Set the first chat as selected by default when modal opens
  useEffect(() => {
    if (isOpen) {
      // Find the first available chat
      for (const key of Object.keys(groupedChats)) {
        if (groupedChats[key].chats.length > 0) {
          setSelectedChat(groupedChats[key].chats[0]);
          break;
        }
      }
    } else {
      setSelectedChat(null);
    }
  }, [isOpen]);

  // Handle click outside to close history and dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Close modal when clicking outside
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }

      // Close any open export dropdowns when clicking elsewhere
      const target = event.target as HTMLElement;

      // Handle individual chat export dropdowns
      if (!target.closest('button[title="Export conversation"]')) {
        // Find all export dropdowns and hide them
        const dropdowns = document.querySelectorAll('[id^="export-dropdown-"]');
        dropdowns.forEach((dropdown) => {
          if (!dropdown.classList.contains("hidden")) {
            dropdown.classList.add("hidden");
          }
        });
      }

      // Handle batch export dropdown
      if (!target.closest('button[title="Export selected chats"]')) {
        const batchDropdown = document.getElementById("batch-export-dropdown");
        if (batchDropdown && !batchDropdown.classList.contains("hidden")) {
          batchDropdown.classList.add("hidden");
        }
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Prevent scrolling of main content when history modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle window resize for mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 640);
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity animate-fadeIn flex items-center justify-center p-2 sm:p-4">
      <div
        ref={modalRef}
        id="history-modal"
        role="dialog"
        aria-label="Chat History"
        aria-modal="true"
        className="w-full sm:w-[95%] md:w-4/5 h-[95%] sm:h-4/5 max-w-6xl bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden transform transition-all animate-scaleIn"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-2 sm:p-3 md:p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 dark:text-white truncate">
              <span className="hidden xs:inline">SafariMind </span>Chat History
            </h2>
            <div className="flex items-center space-x-1 sm:space-x-2">
              {isMultiSelectMode && selectedChats.length > 0 && (
                <>
                  <div className="relative">
                    <button
                      className="p-1 sm:p-1.5 rounded-md bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors"
                      title="Export selected chats"
                      onClick={() => {
                        // Toggle the batch export dropdown
                        const dropdown = document.getElementById(
                          "batch-export-dropdown"
                        );
                        if (dropdown) {
                          dropdown.classList.toggle("hidden");
                        }
                      }}
                    >
                      <Download size={14} className="sm:hidden" />
                      <Download size={16} className="hidden sm:block" />
                    </button>
                    <div
                      id="batch-export-dropdown"
                      className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 py-1 hidden z-10"
                    >
                      <h3 className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        Batch Export
                      </h3>
                      <button
                        className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center"
                        onClick={() => {
                          exportMultipleChats(selectedChats, "txt");
                          const dropdown = document.getElementById(
                            "batch-export-dropdown"
                          );
                          if (dropdown) dropdown.classList.add("hidden");
                        }}
                      >
                        <FileText size={14} className="mr-2 text-gray-500" />
                        <span>Export as TXT</span>
                      </button>
                      <button
                        className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center"
                        onClick={() => {
                          exportMultipleChats(selectedChats, "json");
                          const dropdown = document.getElementById(
                            "batch-export-dropdown"
                          );
                          if (dropdown) dropdown.classList.add("hidden");
                        }}
                      >
                        <FileJson size={14} className="mr-2 text-gray-500" />
                        <span>Export as JSON</span>
                      </button>
                      <button
                        className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center"
                        onClick={() => {
                          exportMultipleChats(selectedChats, "csv");
                          const dropdown = document.getElementById(
                            "batch-export-dropdown"
                          );
                          if (dropdown) dropdown.classList.add("hidden");
                        }}
                      >
                        <FileSpreadsheet
                          size={14}
                          className="mr-2 text-gray-500"
                        />
                        <span>Export as CSV</span>
                      </button>
                      <button
                        className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center"
                        onClick={() => {
                          exportMultipleChats(selectedChats, "html");
                          const dropdown = document.getElementById(
                            "batch-export-dropdown"
                          );
                          if (dropdown) dropdown.classList.add("hidden");
                        }}
                      >
                        <FileCode size={14} className="mr-2 text-gray-500" />
                        <span>Export as HTML</span>
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={deleteSelectedChats}
                    className="p-1 sm:p-1.5 rounded-md bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
                    title="Delete selected chats"
                  >
                    <Trash2 size={14} className="sm:hidden" />
                    <Trash2 size={16} className="hidden sm:block" />
                  </button>
                </>
              )}
              <button
                onClick={() => setIsMultiSelectMode(!isMultiSelectMode)}
                className={`p-1 sm:p-1.5 rounded-md transition-colors ${
                  isMultiSelectMode
                    ? "bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                }`}
                title={
                  isMultiSelectMode
                    ? "Exit selection mode"
                    : "Select multiple chats"
                }
              >
                <CheckSquare size={14} className="sm:hidden" />
                <CheckSquare size={16} className="hidden sm:block" />
              </button>
              <button
                onClick={onClose}
                className="p-1 sm:p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                aria-label="Close history"
              >
                <X
                  size={14}
                  className="text-gray-600 dark:text-gray-400 sm:hidden"
                />
                <X
                  size={16}
                  className="text-gray-600 dark:text-gray-400 hidden sm:block"
                />
              </button>
            </div>
          </div>

          {/* Search and filter bar */}
          <div className="p-2 sm:p-3 md:p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex flex-col space-y-2 sm:space-y-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                  <Search
                    size={14}
                    className="text-gray-500 dark:text-gray-400 sm:hidden"
                  />
                  <Search
                    size={16}
                    className="text-gray-500 dark:text-gray-400 hidden sm:block"
                  />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-1 sm:p-1.5 rounded-md text-xs sm:text-sm flex items-center transition-colors ${
                      showFilters ||
                      selectedFilter !== "all" ||
                      selectedTags.length > 0
                        ? "bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    <Filter size={12} className="mr-1 sm:hidden" />
                    <Filter size={14} className="mr-1 hidden sm:block" />
                    <span className="sm:hidden">Filter</span>
                    <span className="hidden sm:inline">Filters</span>
                    {(selectedFilter !== "all" || selectedTags.length > 0) && (
                      <span className="ml-1 bg-blue-500 text-white text-[10px] sm:text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                        {(selectedFilter !== "all" ? 1 : 0) +
                          (selectedTags.length > 0 ? 1 : 0)}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setSortOrder((prev) => {
                        if (prev === "newest") return "oldest";
                        if (prev === "oldest") return "alphabetical";
                        return "newest";
                      });
                    }}
                    className="p-1 sm:p-1.5 rounded-md text-xs sm:text-sm flex items-center hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                    title={`Sort by: ${
                      sortOrder === "newest"
                        ? "Newest first"
                        : sortOrder === "oldest"
                        ? "Oldest first"
                        : "Alphabetical"
                    }`}
                  >
                    <ArrowUpDown size={12} className="mr-1 sm:hidden" />
                    <ArrowUpDown size={14} className="mr-1 hidden sm:block" />
                    <span className="sm:hidden">
                      {sortOrder === "newest"
                        ? "New"
                        : sortOrder === "oldest"
                        ? "Old"
                        : "A-Z"}
                    </span>
                    <span className="hidden sm:inline">
                      {sortOrder === "newest"
                        ? "Newest"
                        : sortOrder === "oldest"
                        ? "Oldest"
                        : "A-Z"}
                    </span>
                  </button>
                </div>

                {searchQuery && filteredChats.length > 0 && (
                  <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                    {filteredChats.length} result
                    {filteredChats.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {/* Filter options */}
              {showFilters && (
                <div className="p-2 sm:p-3 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 space-y-2 sm:space-y-3">
                  <div>
                    <h4 className="text-[10px] sm:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                      Categories
                    </h4>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      <button
                        className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded-md transition-colors ${
                          selectedFilter === "all"
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                            : "bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500"
                        }`}
                        onClick={() => setSelectedFilter("all")}
                      >
                        All
                      </button>
                      <button
                        className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded-md transition-colors ${
                          selectedFilter === "favorites"
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                            : "bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500"
                        }`}
                        onClick={() => setSelectedFilter("favorites")}
                      >
                        Favorites
                      </button>
                      {availableCategories.map((category) => (
                        <button
                          key={category}
                          className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded-md transition-colors ${
                            selectedFilter === category
                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                              : "bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500"
                          }`}
                          onClick={() => setSelectedFilter(category)}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] sm:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                      Filter by tags
                    </h4>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {availableTags.map((tag) => (
                        <button
                          key={tag}
                          className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded-md transition-colors ${
                            selectedTags.includes(tag)
                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                              : "bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500"
                          }`}
                          onClick={() => {
                            if (selectedTags.includes(tag)) {
                              setSelectedTags((prev) =>
                                prev.filter((t) => t !== tag)
                              );
                            } else {
                              setSelectedTags((prev) => [...prev, tag]);
                            }
                          }}
                        >
                          <Tag
                            size={8}
                            className="mr-0.5 inline-block sm:hidden"
                          />
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row flex-1 overflow-hidden">
            {/* Left column - Chat list */}
            <div
              className={`${
                selectedChat && isMobileView ? "hidden" : "block"
              } w-full sm:w-1/3 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-700 overflow-y-auto`}
            >
              <div className="p-4">
                {searchQuery ||
                selectedFilter !== "all" ||
                selectedTags.length > 0 ? (
                  // Show filtered results
                  <div className="space-y-2">
                    {filteredChats.length > 0 ? (
                      filteredChats.map((chat) => (
                        <div
                          key={chat.id}
                          className={`p-3 rounded-lg transition-colors ${
                            selectedChat?.id === chat.id
                              ? "bg-blue-100 dark:bg-blue-900/30"
                              : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                          } ${
                            isMultiSelectMode
                              ? "cursor-default"
                              : "cursor-pointer"
                          }`}
                          onClick={() => {
                            if (!isMultiSelectMode) {
                              setSelectedChat(chat);
                            }
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-start space-x-2">
                              {isMultiSelectMode && (
                                <div
                                  className="flex-shrink-0 mt-0.5 cursor-pointer"
                                  onClick={() => toggleChatSelection(chat.id)}
                                >
                                  {chat.selected ? (
                                    <CheckSquare
                                      size={16}
                                      className="text-blue-500"
                                    />
                                  ) : (
                                    <Square
                                      size={16}
                                      className="text-gray-400"
                                    />
                                  )}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start">
                                  {chat.favorite && (
                                    <Star
                                      size={14}
                                      className="text-yellow-500 mr-1 flex-shrink-0 mt-0.5"
                                      fill="currentColor"
                                    />
                                  )}
                                  <h4 className="text-sm font-medium text-gray-800 dark:text-white truncate">
                                    {chat.title}
                                  </h4>
                                </div>
                                {chat.preview && (
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                    {chat.preview}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end ml-2">
                              <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                {chat.timeAgo}
                              </span>
                              {!isMultiSelectMode && (
                                <div className="flex mt-1 space-x-1">
                                  <button
                                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleFavorite(chat.id);
                                    }}
                                    title={
                                      chat.favorite
                                        ? "Remove from favorites"
                                        : "Add to favorites"
                                    }
                                  >
                                    <Star
                                      size={12}
                                      className={
                                        chat.favorite
                                          ? "text-yellow-500 fill-current"
                                          : ""
                                      }
                                    />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          {chat.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {chat.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Search
                          size={32}
                          className="mx-auto text-gray-400 mb-3"
                        />
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          No conversations found
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Try adjusting your search or filters
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  // Show grouped chats (default view)
                  <div className="space-y-6">
                    {Object.keys(groupedChats).map((key) => {
                      const group = groupedChats[key];
                      // Only show sections with chats
                      if (group.chats.length === 0) return null;

                      return (
                        <div key={key}>
                          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            {group.title}
                          </h3>
                          <div className="space-y-2">
                            {group.chats.map((chat) => (
                              <div
                                key={chat.id}
                                className={`p-3 rounded-lg transition-colors ${
                                  selectedChat?.id === chat.id
                                    ? "bg-blue-100 dark:bg-blue-900/30"
                                    : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                                } ${
                                  isMultiSelectMode
                                    ? "cursor-default"
                                    : "cursor-pointer"
                                }`}
                                onClick={() => {
                                  if (!isMultiSelectMode) {
                                    setSelectedChat(chat);
                                  }
                                }}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex items-start space-x-2">
                                    {isMultiSelectMode && (
                                      <div
                                        className="flex-shrink-0 mt-0.5 cursor-pointer"
                                        onClick={() =>
                                          toggleChatSelection(chat.id)
                                        }
                                      >
                                        {chat.selected ? (
                                          <CheckSquare
                                            size={16}
                                            className="text-blue-500"
                                          />
                                        ) : (
                                          <Square
                                            size={16}
                                            className="text-gray-400"
                                          />
                                        )}
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start">
                                        {chat.favorite && (
                                          <Star
                                            size={14}
                                            className="text-yellow-500 mr-1 flex-shrink-0 mt-0.5"
                                            fill="currentColor"
                                          />
                                        )}
                                        <h4 className="text-sm font-medium text-gray-800 dark:text-white truncate">
                                          {chat.title}
                                        </h4>
                                      </div>
                                      {chat.preview && (
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                          {chat.preview}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end ml-2">
                                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                      {chat.timeAgo}
                                    </span>
                                    {!isMultiSelectMode && (
                                      <div className="flex mt-1 space-x-1">
                                        <button
                                          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleFavorite(chat.id);
                                          }}
                                          title={
                                            chat.favorite
                                              ? "Remove from favorites"
                                              : "Add to favorites"
                                          }
                                        >
                                          <Star
                                            size={12}
                                            className={
                                              chat.favorite
                                                ? "text-yellow-500 fill-current"
                                                : ""
                                            }
                                          />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {chat.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {chat.tags.map((tag) => (
                                      <span
                                        key={tag}
                                        className="px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right column - Chat content */}
            <div
              className={`${
                selectedChat && isMobileView ? "block" : "hidden"
              } sm:block w-full sm:w-2/3 overflow-y-auto bg-gray-50 dark:bg-gray-900`}
            >
              {selectedChat ? (
                <div className="p-3 sm:p-6">
                  {isMobileView && (
                    <button
                      onClick={() => setSelectedChat(null)}
                      className="mb-3 p-1.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center text-xs"
                    >
                      <ArrowUpDown className="rotate-90 mr-1" size={12} />
                      Back to chat list
                    </button>
                  )}
                  <div className="mb-4 sm:mb-6">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        {editingTitle ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={editedTitle}
                              onChange={(e) => setEditedTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  updateChatTitle(selectedChat.id, editedTitle);
                                }
                              }}
                              autoFocus
                            />
                            <button
                              className="p-1.5 rounded-md bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors"
                              onClick={() =>
                                updateChatTitle(selectedChat.id, editedTitle)
                              }
                              title="Save title"
                            >
                              <Save size={16} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mr-2">
                              {selectedChat.title}
                            </h3>
                            <button
                              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                              onClick={() => {
                                setEditedTitle(selectedChat.title);
                                setEditingTitle(true);
                              }}
                              title="Edit title"
                            >
                              <Edit size={14} />
                            </button>
                          </div>
                        )}
                        <div className="flex items-center space-x-3 mt-1">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(selectedChat.date).toLocaleString()}
                          </p>
                          {selectedChat.lastEdited && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Edited:{" "}
                              {new Date(
                                selectedChat.lastEdited
                              ).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <div className="relative">
                          {/* Using state instead of CSS hover for better control */}
                          <button
                            className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                            title="Export conversation"
                            onClick={() => {
                              // Toggle a state variable to show/hide the dropdown
                              const dropdown = document.getElementById(
                                `export-dropdown-${selectedChat.id}`
                              );
                              if (dropdown) {
                                dropdown.classList.toggle("hidden");
                              }
                            }}
                          >
                            <Download size={16} />
                          </button>
                          <div
                            id={`export-dropdown-${selectedChat.id}`}
                            className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 py-1 hidden z-10"
                          >
                            <h3 className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                              Export Options
                            </h3>
                            <button
                              className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center"
                              onClick={() => {
                                exportChat(selectedChat, "txt");
                                // Hide dropdown after selection
                                const dropdown = document.getElementById(
                                  `export-dropdown-${selectedChat.id}`
                                );
                                if (dropdown) dropdown.classList.add("hidden");
                              }}
                            >
                              <FileText
                                size={14}
                                className="mr-2 text-gray-500"
                              />
                              <span>Plain Text (.txt)</span>
                            </button>
                            <button
                              className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center"
                              onClick={() => {
                                exportChat(selectedChat, "json");
                                // Hide dropdown after selection
                                const dropdown = document.getElementById(
                                  `export-dropdown-${selectedChat.id}`
                                );
                                if (dropdown) dropdown.classList.add("hidden");
                              }}
                            >
                              <FileJson
                                size={14}
                                className="mr-2 text-gray-500"
                              />
                              <span>JSON Format (.json)</span>
                            </button>
                            <button
                              className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center"
                              onClick={() => {
                                exportChat(selectedChat, "csv");
                                // Hide dropdown after selection
                                const dropdown = document.getElementById(
                                  `export-dropdown-${selectedChat.id}`
                                );
                                if (dropdown) dropdown.classList.add("hidden");
                              }}
                            >
                              <FileSpreadsheet
                                size={14}
                                className="mr-2 text-gray-500"
                              />
                              <span>CSV Spreadsheet (.csv)</span>
                            </button>
                            <button
                              className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center"
                              onClick={() => {
                                exportChat(selectedChat, "html");
                                // Hide dropdown after selection
                                const dropdown = document.getElementById(
                                  `export-dropdown-${selectedChat.id}`
                                );
                                if (dropdown) dropdown.classList.add("hidden");
                              }}
                            >
                              <FileCode
                                size={14}
                                className="mr-2 text-gray-500"
                              />
                              <span>HTML Document (.html)</span>
                            </button>
                            <button
                              className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center"
                              onClick={() => {
                                exportChat(selectedChat, "pdf");
                                // Hide dropdown after selection
                                const dropdown = document.getElementById(
                                  `export-dropdown-${selectedChat.id}`
                                );
                                if (dropdown) dropdown.classList.add("hidden");
                              }}
                            >
                              <Files size={14} className="mr-2 text-gray-500" />
                              <span>PDF Document (.pdf)</span>
                            </button>
                          </div>
                        </div>
                        <button
                          className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                          onClick={() => shareChat(selectedChat)}
                          title="Share conversation"
                        >
                          <Share2 size={16} />
                        </button>
                        <button
                          className="p-1.5 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors"
                          onClick={() => loadChatToMainWindow(selectedChat)}
                          title="Open in chat window"
                        >
                          <ExternalLink size={16} />
                        </button>
                        <button
                          className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                          onClick={() => toggleFavorite(selectedChat.id)}
                          title={
                            selectedChat.favorite
                              ? "Remove from favorites"
                              : "Add to favorites"
                          }
                        >
                          <Star
                            size={16}
                            className={
                              selectedChat.favorite
                                ? "text-yellow-500 fill-current"
                                : ""
                            }
                          />
                        </button>
                        <button
                          className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                          onClick={() => {
                            if (
                              window.confirm(
                                "Are you sure you want to delete this conversation?"
                              )
                            ) {
                              deleteChat(selectedChat.id);
                            }
                          }}
                          title="Delete conversation"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center mt-3 space-x-2">
                      <div className="flex items-center space-x-1">
                        <Calendar
                          size={14}
                          className="text-gray-500 dark:text-gray-400"
                        />
                        <span className="text-xs text-gray-600 dark:text-gray-300">
                          Category:
                        </span>
                      </div>
                      <div className="relative group">
                        <button className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                          {selectedChat.category}
                        </button>
                        <div className="absolute left-0 mt-1 w-40 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 py-1 hidden group-hover:block z-10">
                          {availableCategories.map((category) => (
                            <button
                              key={category}
                              className={`w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                selectedChat.category === category
                                  ? "text-blue-600 dark:text-blue-400 font-medium"
                                  : "text-gray-700 dark:text-gray-300"
                              }`}
                              onClick={() =>
                                changeChatCategory(selectedChat.id, category)
                              }
                            >
                              {category}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 ml-4">
                        <Tag
                          size={14}
                          className="text-gray-500 dark:text-gray-400"
                        />
                        <span className="text-xs text-gray-600 dark:text-gray-300">
                          Tags:
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 items-center">
                        {selectedChat.tags.map((tag) => (
                          <div
                            key={tag}
                            className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md flex items-center group"
                          >
                            {tag}
                            <button
                              className="ml-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() =>
                                removeTagFromChat(selectedChat.id, tag)
                              }
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                        {isAddingTag ? (
                          <div className="flex items-center">
                            <input
                              type="text"
                              className="w-24 px-2 py-0.5 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  addTagToChat(selectedChat.id, newTag);
                                } else if (e.key === "Escape") {
                                  setIsAddingTag(false);
                                  setNewTag("");
                                }
                              }}
                              placeholder="New tag..."
                              autoFocus
                            />
                            <button
                              className="ml-1 p-0.5 rounded-full bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                              onClick={() =>
                                addTagToChat(selectedChat.id, newTag)
                              }
                            >
                              <Save size={10} />
                            </button>
                          </div>
                        ) : (
                          <button
                            className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            onClick={() => setIsAddingTag(true)}
                          >
                            + Add Tag
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {selectedChat.messages.map((message, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg ${
                          message.isUser
                            ? "bg-blue-100 dark:bg-blue-900/30 ml-auto max-w-[80%]"
                            : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 max-w-[80%]"
                        }`}
                      >
                        {message.isUser ? (
                          <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                            {message.content}
                          </p>
                        ) : (
                          <div className="text-sm text-gray-800 dark:text-gray-200 markdown-content prose prose-sm max-w-none dark:prose-invert">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block text-right">
                          {message.isUser ? "You" : "SafariMind AI"} •{" "}
                          {message.timestamp}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Clock size={40} className="mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 mb-1">
                      Select a conversation to view details
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Your SafariMind AI conversations are saved here
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// Set display name for better debugging
ChatHistory.displayName = "ChatHistory";
export default ChatHistory;
