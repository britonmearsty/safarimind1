import Modal from "./Modal";
import { Bell, Info, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useState, useEffect } from "react";

type NotificationsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type Notification = {
  id: number;
  type: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
};

const NotificationsModal = ({ isOpen, onClose }: NotificationsModalProps) => {
  // State for notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState("all");

  // Load notifications from localStorage on component mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem("notifications");
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    } else {
      // Initialize with default notifications if none exist
      setNotifications(defaultNotifications);
      localStorage.setItem(
        "notifications",
        JSON.stringify(defaultNotifications)
      );
    }
  }, []);

  // Save notifications to localStorage when they change
  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, [notifications]);

  // Mark a notification as read
  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };

  // Filter notifications based on selected filter
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.read;
    if (filter === "important")
      return notification.type === "alert" || notification.type === "update";
    return true;
  });

  // Sample notifications data
  const defaultNotifications = [
    {
      id: 1,
      type: "info",
      title: "Welcome to SafariMind AI",
      message:
        "Thanks for joining! Explore the features and start chatting with Cheruu's SafariMind AI assistant.",
      time: "2 hours ago",
      read: false,
    },
    {
      id: 2,
      type: "update",
      title: "New SafariMind Features Available",
      message:
        "Cheruu has added new capabilities to SafariMind AI. Try asking about weather forecasts and sports results!",
      time: "Yesterday",
      read: false,
    },
    {
      id: 3,
      type: "alert",
      title: "Scheduled Maintenance",
      message:
        "Cheruu will be performing maintenance on SafariMind servers this weekend. Service may be intermittently unavailable.",
      time: "3 days ago",
      read: true,
    },
    {
      id: 4,
      type: "success",
      title: "Account Verified",
      message:
        "Your Cheruu account has been successfully verified. You now have access to all premium SafariMind AI features.",
      time: "1 week ago",
      read: true,
    },
    {
      id: 5,
      type: "info",
      title: "SafariMind Tips & Tricks",
      message:
        "Did you know you can customize your SafariMind experience? Check out the settings page for more Cheruu options.",
      time: "2 weeks ago",
      read: true,
    },
  ];

  // Function to render icon based on notification type
  const getIcon = (type: string) => {
    switch (type) {
      case "info":
        return <Info size={18} className="text-blue-500" />;
      case "alert":
        return <AlertTriangle size={18} className="text-yellow-500" />;
      case "success":
        return <CheckCircle size={18} className="text-green-500" />;
      case "update":
        return <Bell size={18} className="text-purple-500" />;
      default:
        return <Info size={18} className="text-blue-500" />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Notifications" size="md">
      <div className="space-y-6">
        {/* Notification filters */}
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filter === "unread"
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
            onClick={() => setFilter("unread")}
          >
            Unread
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filter === "important"
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
            onClick={() => setFilter("important")}
          >
            Important
          </button>
        </div>

        {/* Notifications list */}
        <div className="space-y-3">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                className={`p-4 rounded-lg border cursor-pointer ${
                  notification.read
                    ? "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                    : "border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/20"
                }`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3 mt-0.5">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4
                        className={`font-medium ${
                          notification.read
                            ? "text-gray-800 dark:text-white"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {notification.title}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                          <Clock size={12} className="mr-1" />
                          {notification.time}
                        </span>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      {notification.message}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Bell size={40} className="mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                No notifications
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                You're all caught up! Check back later for updates.
              </p>
            </div>
          )}
        </div>

        {/* Mark all as read button */}
        {notifications.some((n) => !n.read) && (
          <div className="flex justify-center">
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
            >
              Mark all as read
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default NotificationsModal;
