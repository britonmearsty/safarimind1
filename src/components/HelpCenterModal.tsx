import Modal from "./Modal";
import {
  Search,
  HelpCircle,
  Book,
  Video,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import React, { useState, useEffect } from "react";

type HelpCenterModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type HelpCategory = {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
};

type HelpArticle = {
  id: string;
  category: string;
  title: string;
  preview: string;
  popular?: boolean;
};

const HelpCenterModal = ({ isOpen, onClose }: HelpCenterModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(
    null
  );
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [viewedArticles, setViewedArticles] = useState<string[]>([]);

  // Load recent searches and viewed articles from localStorage
  useEffect(() => {
    const savedSearches = localStorage.getItem("recentSearches");
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }

    const savedViewedArticles = localStorage.getItem("viewedArticles");
    if (savedViewedArticles) {
      setViewedArticles(JSON.parse(savedViewedArticles));
    }
  }, []);

  // Save recent searches when they change
  useEffect(() => {
    localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
  }, [recentSearches]);

  // Save viewed articles when they change
  useEffect(() => {
    localStorage.setItem("viewedArticles", JSON.stringify(viewedArticles));
  }, [viewedArticles]);

  // Handle search submission
  const handleSearch = () => {
    if (searchQuery.trim() !== "") {
      // Add to recent searches if not already there
      if (!recentSearches.includes(searchQuery)) {
        setRecentSearches((prev) => [searchQuery, ...prev.slice(0, 4)]);
      }
    }
  };

  // Handle article selection
  const handleArticleSelect = (article: HelpArticle) => {
    setSelectedArticle(article);

    // Add to viewed articles if not already there
    if (!viewedArticles.includes(article.id)) {
      setViewedArticles((prev) => [article.id, ...prev.slice(0, 9)]);
    }
  };

  // Handle contact support
  const handleContactSupport = () => {
    // In a real app, this would open a support ticket form or chat
    alert("Connecting to Cheruu Support for SafariMind AI assistance...");
  };

  // Help categories
  const categories: HelpCategory[] = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: <Book size={20} className="text-blue-500" />,
      description:
        "Learn the basics of using SafariMind AI and get up to speed quickly.",
    },
    {
      id: "features",
      title: "Features & Capabilities",
      icon: <HelpCircle size={20} className="text-purple-500" />,
      description:
        "Discover all the features and capabilities of SafariMind AI by Cheruu.",
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting",
      icon: <MessageCircle size={20} className="text-red-500" />,
      description: "Find solutions to common problems and issues.",
    },
    {
      id: "tutorials",
      title: "Video Tutorials",
      icon: <Video size={20} className="text-green-500" />,
      description: "Watch step-by-step video guides on using SafariMind AI.",
    },
  ];

  // Help articles
  const articles: HelpArticle[] = [
    {
      id: "article-1",
      category: "getting-started",
      title: "How to start your first conversation",
      preview:
        "Learn how to initiate and manage conversations with SafariMind AI assistant.",
      popular: true,
    },
    {
      id: "article-2",
      category: "getting-started",
      title: "Setting up your profile",
      preview:
        "Customize your profile to get the most out of your SafariMind AI experience.",
    },
    {
      id: "article-3",
      category: "features",
      title: "Advanced conversation techniques",
      preview:
        "Discover how to get more detailed and helpful responses from the AI.",
    },
    {
      id: "article-4",
      category: "features",
      title: "Using chat history effectively",
      preview:
        "Learn how to access, search, and manage your conversation history with SafariMind.",
    },
    {
      id: "article-5",
      category: "troubleshooting",
      title: "What to do if the AI doesn't understand you",
      preview: "Tips for rephrasing your questions to get better responses.",
      popular: true,
    },
    {
      id: "article-6",
      category: "troubleshooting",
      title: "Connection issues and how to resolve them",
      preview:
        "Troubleshoot common connection problems with the SafariMind AI service by Cheruu.",
    },
    {
      id: "article-7",
      category: "tutorials",
      title: "Complete beginner's guide to SafariMind AI",
      preview:
        "A comprehensive video tutorial covering all the basics of using SafariMind AI by Cheruu.",
    },
    {
      id: "article-8",
      category: "tutorials",
      title: "Advanced features walkthrough",
      preview: "Video demonstration of the advanced features and capabilities.",
    },
  ];

  // Filter articles based on search query and selected category
  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      searchQuery === "" ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.preview.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === null || article.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Popular articles
  const popularArticles = articles.filter((article) => article.popular);

  // Handle back button click
  const handleBack = () => {
    if (selectedArticle) {
      setSelectedArticle(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Help Center"
      size="lg"
      hideFooter={true}
    >
      {!selectedArticle ? (
        <div className="space-y-6">
          {/* Search bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-500 dark:text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search for help articles..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
            {recentSearches.length > 0 && searchQuery === "" && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Recent searches:
                </p>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      onClick={() => {
                        setSearchQuery(search);
                        handleSearch();
                      }}
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Back button (when category is selected) */}
          {selectedCategory && (
            <button
              onClick={handleBack}
              className="flex items-center text-blue-600 dark:text-blue-400 hover:underline"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to all categories
            </button>
          )}

          {/* Categories grid */}
          {!selectedCategory && searchQuery === "" && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Help Categories
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3">{category.icon}</div>
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-white">
                          {category.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Popular articles (only shown on main page) */}
          {!selectedCategory && searchQuery === "" && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Popular Articles
              </h3>
              <div className="space-y-3">
                {popularArticles.map((article) => (
                  <div
                    key={article.id}
                    className={`p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer ${
                      viewedArticles.includes(article.id)
                        ? "border-l-4 border-l-blue-500"
                        : ""
                    }`}
                    onClick={() => handleArticleSelect(article)}
                  >
                    <h4 className="font-medium text-gray-800 dark:text-white">
                      {article.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {article.preview}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Articles list (when category is selected or search is active) */}
          {(selectedCategory || searchQuery !== "") && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                {selectedCategory
                  ? categories.find((c) => c.id === selectedCategory)?.title
                  : "Search Results"}
              </h3>

              {filteredArticles.length > 0 ? (
                <div className="space-y-3">
                  {filteredArticles.map((article) => (
                    <div
                      key={article.id}
                      className={`p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer ${
                        viewedArticles.includes(article.id)
                          ? "border-l-4 border-l-blue-500"
                          : ""
                      }`}
                      onClick={() => handleArticleSelect(article)}
                    >
                      <h4 className="font-medium text-gray-800 dark:text-white">
                        {article.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {article.preview}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <HelpCircle
                    size={40}
                    className="mx-auto text-gray-400 mb-3"
                  />
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    No articles found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Try adjusting your search terms or browse by category.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Contact support */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-start">
              <MessageCircle
                size={24}
                className="text-blue-500 mr-3 flex-shrink-0"
              />
              <div>
                <h4 className="font-medium text-gray-800 dark:text-white">
                  Need more help?
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  If you can't find what you're looking for, Cheruu's support
                  team is here to help with your SafariMind AI questions.
                </p>
                <button
                  className="mt-2 text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline"
                  onClick={handleContactSupport}
                >
                  Contact Cheruu Support
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Article detail view
        <div className="space-y-6">
          <button
            onClick={handleBack}
            className="flex items-center text-blue-600 dark:text-blue-400 hover:underline"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to articles
          </button>

          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              {selectedArticle.title}
            </h3>

            <div className="prose dark:prose-invert max-w-none">
              <p>
                Welcome to SafariMind AI by Cheruu, your intelligent assistant
                designed to help you navigate the digital world with ease. This
                guide will help you get the most out of your SafariMind
                experience.
              </p>

              <h4>Getting Started with SafariMind</h4>
              <p>
                SafariMind AI is Cheruu's flagship artificial intelligence
                platform designed to provide intuitive, helpful responses to
                your questions and assist with a wide range of tasks. Whether
                you're researching a topic, need creative inspiration, or want
                help solving a problem, SafariMind is here to help.
              </p>

              <ul>
                <li>
                  First, create an account or sign in to your existing account.
                </li>
                <li>Navigate to the main chat interface.</li>
                <li>
                  Type your question or request in the input field at the
                  bottom.
                </li>
                <li>
                  Press Enter or click the send button to start the
                  conversation.
                </li>
              </ul>

              <h4>Tips for Better Results with SafariMind</h4>
              <p>
                To get the most out of your SafariMind AI experience by Cheruu,
                try these tips:
              </p>

              <ol>
                <li>Be specific with your questions.</li>
                <li>Provide context when needed.</li>
                <li>
                  Ask follow-up questions to get more detailed information.
                </li>
                <li>
                  Use the chat history feature to refer back to previous
                  conversations.
                </li>
              </ol>

              <div className="p-4 bg-gray-100 dark:bg-gray-750 rounded-lg my-4">
                <h5 className="font-medium">Note</h5>
                <p className="text-sm mt-1">
                  The AI assistant is designed to be helpful, but it may not
                  always have the most up-to-date information. For critical
                  matters, please verify information from official sources.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: 2 weeks ago
            </div>
            <div className="flex space-x-4">
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                <ExternalLink size={14} className="mr-1" />
                Share
              </button>
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                Was this helpful?
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default HelpCenterModal;
