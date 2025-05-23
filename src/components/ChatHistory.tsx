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
} from "lucide-react";
import { useEffect, useRef, memo, useState, useCallback } from "react";
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
}: ChatHistoryProps) {
  // const { showToast } = useToast(); // Commented out as it's not used
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

  // Group messages by date categories (Today, Last 7 Days, This Year)
  const getGroupedChats = (): GroupedChats => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    const thisYear = new Date(today);
    thisYear.setDate(1);
    thisYear.setMonth(0);

    // For demo purpose - generate some sample chat titles based on actual messages
    const chatItems = messages.reduce((acc: any[], message, index) => {
      // Only process user messages as conversation starters
      if (message.isUser) {
        // Find if there's any AI response right after this message
        const aiResponse =
          messages[index + 1]?.isUser === false
            ? messages[index + 1].content
            : "";

        // Use first few words of message as title
        const title =
          message.content.split(" ").slice(0, 5).join(" ") +
          (message.content.split(" ").length > 5 ? "..." : "");

        // Create a chat session with this message and the next few messages
        const chatMessages = [];
        let i = index;
        // Add up to 10 messages or until the next user message that's not consecutive
        while (chatMessages.length < 10 && i < messages.length) {
          chatMessages.push(messages[i]);
          i++;
        }

        // Generate random tags and category for demo purposes
        const randomTags: string[] = [];
        const numTags = Math.floor(Math.random() * 3); // 0-2 tags
        for (let t = 0; t < numTags; t++) {
          const randomTag =
            availableTags[Math.floor(Math.random() * availableTags.length)];
          if (!randomTags.includes(randomTag)) {
            randomTags.push(randomTag);
          }
        }

        // Random category
        const randomCategory =
          availableCategories[
            Math.floor(Math.random() * availableCategories.length)
          ];

        // Random favorite status (20% chance of being favorited)
        const isFavorite = Math.random() < 0.2;

        acc.push({
          id: message.id,
          title: title,
          preview:
            aiResponse.substring(0, 60) + (aiResponse.length > 60 ? "..." : ""),
          timestamp: message.timestamp,
          // For demo purposes, assign random timestamps
          date: new Date(
            today.getTime() -
              Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000
          ),
          messages: chatMessages,
          favorite: isFavorite,
          tags: randomTags,
          category: randomCategory,
          lastEdited: new Date(
            today.getTime() -
              Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000
          ),
          selected: false,
        });
      }
      return acc;
    }, []);

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
      const daysDiff = Math.floor(
        (today.getTime() - chatDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Format timeAgo string
      let timeAgo;
      if (daysDiff === 0) {
        timeAgo =
          Math.floor((today.getTime() - chatDate.getTime()) / (1000 * 60)) +
          " minutes ago";
      } else if (daysDiff < 7) {
        timeAgo = daysDiff + " days ago";
      } else {
        timeAgo = "Apr " + chatDate.getDate(); // Simplified for demo
      }

      const chatItem = {
        id: chat.id,
        title: chat.title,
        preview: chat.preview,
        timestamp: chat.timestamp,
        timeAgo: timeAgo,
        date: chat.date,
        messages: chat.messages,
        favorite: chat.favorite,
        tags: chat.tags,
        category: chat.category,
        lastEdited: chat.lastEdited,
        selected: chat.selected,
      };

      // Add to appropriate group
      if (chatDate >= new Date(today.setHours(0, 0, 0, 0))) {
        groupedChats.today.chats.push(chatItem);
      } else if (chatDate >= sevenDaysAgo) {
        groupedChats.lastWeek.chats.push(chatItem);
      } else if (chatDate >= thisYear) {
        groupedChats.thisYear.chats.push(chatItem);
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
    setAllChats((prev) => prev.filter((chat) => chat.id !== chatId));

    // If the selected chat is the one being deleted, clear selection
    if (selectedChat?.id === chatId) {
      setSelectedChat(null);
    }
  };

  // Delete multiple chats
  const deleteSelectedChats = () => {
    if (selectedChats.length === 0) return;

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedChats.length} selected conversations?`
      )
    ) {
      setAllChats((prev) =>
        prev.filter((chat) => !selectedChats.includes(chat.id))
      );

      // If the selected chat is among those being deleted, clear selection
      if (selectedChat && selectedChats.includes(selectedChat.id)) {
        setSelectedChat(null);
      }

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

  // Export chat as file
  const exportChat = (chat: ChatItem, format: "txt" | "json" | "pdf") => {
    let content = "";
    let filename = `SafariMind-Chat-${chat.title
      .replace(/[^a-z0-9]/gi, "-")
      .toLowerCase()}-${new Date().toISOString().split("T")[0]}`;
    let mimeType = "";

    if (format === "txt") {
      content = `SafariMind AI Chat by Cheruu\n`;
      content += `Title: ${chat.title}\n`;
      content += `Date: ${chat.date.toLocaleString()}\n`;
      content += `Category: ${chat.category}\n`;
      content += `Tags: ${chat.tags.join(", ")}\n\n`;
      content += `CONVERSATION:\n\n`;

      chat.messages.forEach((msg) => {
        content += `${msg.isUser ? "You" : "SafariMind AI"} (${
          msg.timestamp
        }):\n${msg.content}\n\n`;
      });

      filename += ".txt";
      mimeType = "text/plain";
    } else if (format === "json") {
      const jsonData = {
        title: chat.title,
        date: chat.date,
        category: chat.category,
        tags: chat.tags,
        messages: chat.messages.map((msg) => ({
          role: msg.isUser ? "user" : "assistant",
          content: msg.content,
          timestamp: msg.timestamp,
        })),
      };

      content = JSON.stringify(jsonData, null, 2);
      filename += ".json";
      mimeType = "application/json";
    } else if (format === "pdf") {
      // In a real app, this would generate a PDF
      const { showToast } = useToast();
      showToast(
        "PDF export would be implemented with a PDF generation library",
        "info"
      );
      return;
    }

    // Create and download the file
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
          alert("Share link copied to clipboard!");
        });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(
        shareText + " https://safarimind.cheruu.com/share/" + chat.id
      );
      alert("Share link copied to clipboard!");
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

  // Handle click outside to close history
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity animate-fadeIn flex items-center justify-center">
      <div
        ref={modalRef}
        id="history-modal"
        role="dialog"
        aria-label="Chat History"
        aria-modal="true"
        className="w-4/5 h-4/5 max-w-6xl bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden transform transition-all animate-scaleIn"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              SafariMind Chat History
            </h2>
            <div className="flex items-center space-x-2">
              {isMultiSelectMode && selectedChats.length > 0 && (
                <button
                  onClick={deleteSelectedChats}
                  className="p-1.5 rounded-md bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
                  title="Delete selected chats"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button
                onClick={() => setIsMultiSelectMode(!isMultiSelectMode)}
                className={`p-1.5 rounded-md transition-colors ${
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
                <CheckSquare size={16} />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                aria-label="Close history"
              >
                <X size={16} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Search and filter bar */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex flex-col space-y-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search
                    size={16}
                    className="text-gray-500 dark:text-gray-400"
                  />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-1.5 rounded-md text-sm flex items-center transition-colors ${
                      showFilters ||
                      selectedFilter !== "all" ||
                      selectedTags.length > 0
                        ? "bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    <Filter size={14} className="mr-1" />
                    Filters
                    {(selectedFilter !== "all" || selectedTags.length > 0) && (
                      <span className="ml-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
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
                    className="p-1.5 rounded-md text-sm flex items-center hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                    title={`Sort by: ${
                      sortOrder === "newest"
                        ? "Newest first"
                        : sortOrder === "oldest"
                        ? "Oldest first"
                        : "Alphabetical"
                    }`}
                  >
                    <ArrowUpDown size={14} className="mr-1" />
                    {sortOrder === "newest"
                      ? "Newest"
                      : sortOrder === "oldest"
                      ? "Oldest"
                      : "A-Z"}
                  </button>
                </div>

                {searchQuery && filteredChats.length > 0 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {filteredChats.length} result
                    {filteredChats.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {/* Filter options */}
              {showFilters && (
                <div className="p-3 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 space-y-3">
                  <div>
                    <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Categories
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className={`px-2 py-1 text-xs rounded-md transition-colors ${
                          selectedFilter === "all"
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                            : "bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500"
                        }`}
                        onClick={() => setSelectedFilter("all")}
                      >
                        All
                      </button>
                      <button
                        className={`px-2 py-1 text-xs rounded-md transition-colors ${
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
                          className={`px-2 py-1 text-xs rounded-md transition-colors ${
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
                    <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Filter by tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map((tag) => (
                        <button
                          key={tag}
                          className={`px-2 py-1 text-xs rounded-md transition-colors ${
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
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Left column - Chat list */}
            <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
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
            <div className="w-2/3 overflow-y-auto bg-gray-50 dark:bg-gray-900">
              {selectedChat ? (
                <div className="p-6">
                  <div className="mb-6">
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
                        <div className="relative group">
                          <button
                            className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                            title="Export conversation"
                          >
                            <Download size={16} />
                          </button>
                          <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 py-1 hidden group-hover:block z-10">
                            <button
                              className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                              onClick={() => exportChat(selectedChat, "txt")}
                            >
                              Export as TXT
                            </button>
                            <button
                              className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                              onClick={() => exportChat(selectedChat, "json")}
                            >
                              Export as JSON
                            </button>
                            <button
                              className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                              onClick={() => exportChat(selectedChat, "pdf")}
                            >
                              Export as PDF
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
                        <p className="text-sm text-gray-800 dark:text-gray-200">
                          {message.content}
                        </p>
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
