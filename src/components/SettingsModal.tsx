import Modal from "./Modal";
import { Moon, Sun, Lock, Eye, Bell, Trash } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "../contexts/ToastContext";

type SettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
};

const SettingsModal = ({
  isOpen,
  onClose,
  isDarkMode,
  toggleDarkMode,
}: SettingsModalProps) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("appearance");

  // Current applied settings
  const [currentSettings, setCurrentSettings] = useState({
    fontSize: "medium",
    saveHistory: true,
    highContrast: false,
    reduceMotion: false,
    desktopNotifications: false,
  });

  // Temporary settings (changes that haven't been saved yet)
  const [tempSettings, setTempSettings] = useState({
    fontSize: "medium",
    saveHistory: true,
    highContrast: false,
    reduceMotion: false,
    desktopNotifications: false,
  });

  // Update temporary settings
  const updateTempSetting = (key: string, value: any) => {
    setTempSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Apply settings to the UI
  const applySettings = (settings: typeof currentSettings) => {
    const htmlElement = document.documentElement;

    // Apply font size - improved scale for better readability
    // Remove all font size classes first
    htmlElement.classList.remove("text-base", "text-lg", "text-xl");

    // Apply the appropriate font size class with improved scaling
    switch (settings.fontSize) {
      case "small":
        // Small is now more readable than before
        htmlElement.classList.add("text-base");
        // Add custom CSS variable for consistent scaling
        htmlElement.style.setProperty("--content-scale", "1");
        break;
      case "medium":
        // Medium is now larger than the default
        htmlElement.classList.add("text-lg");
        htmlElement.style.setProperty("--content-scale", "1.15");
        break;
      case "large":
        // Large is significantly larger for better readability
        htmlElement.classList.add("text-xl");
        htmlElement.style.setProperty("--content-scale", "1.3");
        break;
    }

    // Apply high contrast mode
    if (settings.highContrast) {
      document.body.classList.add("high-contrast");
    } else {
      document.body.classList.remove("high-contrast");
    }

    // Apply reduced motion
    if (settings.reduceMotion) {
      document.body.classList.add("reduce-motion");
    } else {
      document.body.classList.remove("reduce-motion");
    }

    // Request notification permission if enabled
    if (settings.desktopNotifications) {
      if (Notification && Notification.permission !== "granted") {
        Notification.requestPermission();
      }
    }
  };

  // Handle clear all data
  const handleClearAllData = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all data? This action cannot be undone."
      )
    ) {
      // Keep dark mode setting
      const darkMode = localStorage.getItem("darkMode");

      // Clear all data
      localStorage.clear();
      sessionStorage.clear();

      // Restore dark mode setting
      if (darkMode) {
        localStorage.setItem("darkMode", darkMode);
      }

      showToast(
        "All data has been cleared. The page will now reload.",
        "success"
      );
      setTimeout(() => {
        window.location.reload();
      }, 1500); // Give the toast time to be seen before reload
    }
  };

  // Save all settings
  const saveSettings = () => {
    // Update current settings with temporary settings
    setCurrentSettings(tempSettings);

    // Apply the settings to the UI
    applySettings(tempSettings);

    // Save settings to localStorage
    localStorage.setItem("fontSize", tempSettings.fontSize);
    localStorage.setItem("saveHistory", tempSettings.saveHistory.toString());
    localStorage.setItem("highContrast", tempSettings.highContrast.toString());
    localStorage.setItem("reduceMotion", tempSettings.reduceMotion.toString());
    localStorage.setItem(
      "desktopNotifications",
      tempSettings.desktopNotifications.toString()
    );

    // Show success message with toast
    showToast("Settings saved successfully!", "success");

    // Close the modal
    onClose();
  };

  // Reset temporary settings when modal is opened
  useEffect(() => {
    if (isOpen) {
      setTempSettings(currentSettings);
    }
  }, [isOpen, currentSettings]);

  // Add CSS rule for font size scaling
  useEffect(() => {
    // Create a style element if it doesn't exist
    let styleEl = document.getElementById("font-size-scaling");
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "font-size-scaling";
      document.head.appendChild(styleEl);
    }

    // Add CSS rules for font scaling
    styleEl.textContent = `
      :root {
        --content-scale: 1;
      }
      
      /* Apply font scaling to main content areas only */
      .chat-container, 
      .settings-content,
      .main-content,
      .sidebar-content {
        font-size: calc(1em * var(--content-scale));
      }
      
      /* Specific styling for chat elements */
      .chat-message p, 
      .chat-input textarea {
        font-size: calc(1em * var(--content-scale));
        line-height: 1.5;
      }
      
      /* Preserve fixed dimensions for profile elements */
      .w-7 { width: 1.75rem !important; height: 1.75rem !important; }
      .h-7 { width: 1.75rem !important; height: 1.75rem !important; }
      .w-8 { width: 2rem !important; height: 2rem !important; }
      .h-8 { width: 2rem !important; height: 2rem !important; }
      .w-10 { width: 2.5rem !important; height: 2.5rem !important; }
      .h-10 { width: 2.5rem !important; height: 2.5rem !important; }
      .w-24 { width: 6rem !important; }
      .h-24 { height: 6rem !important; }
      
      /* Ensure profile elements maintain their appearance */
      .profile-picture, 
      .profile-initial,
      .profile-exempt {
        font-size: inherit !important;
        transform: none !important;
      }
      
      /* Fix for header profile elements */
      #profile-dropdown,
      button[aria-controls="profile-dropdown"] {
        font-size: inherit !important;
      }
    `;

    return () => {
      // Clean up when component unmounts
      if (styleEl) {
        document.head.removeChild(styleEl);
      }
    };
  }, []);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const newSettings = { ...currentSettings };
    let settingsChanged = false;

    const savedFontSize = localStorage.getItem("fontSize");
    if (savedFontSize) {
      newSettings.fontSize = savedFontSize;
      settingsChanged = true;
    }

    const savedSaveHistory = localStorage.getItem("saveHistory");
    if (savedSaveHistory) {
      newSettings.saveHistory = savedSaveHistory === "true";
      settingsChanged = true;
    }

    const savedHighContrast = localStorage.getItem("highContrast");
    if (savedHighContrast) {
      newSettings.highContrast = savedHighContrast === "true";
      settingsChanged = true;
    }

    const savedReduceMotion = localStorage.getItem("reduceMotion");
    if (savedReduceMotion) {
      newSettings.reduceMotion = savedReduceMotion === "true";
      settingsChanged = true;
    }

    const savedDesktopNotifications = localStorage.getItem(
      "desktopNotifications"
    );
    if (savedDesktopNotifications) {
      newSettings.desktopNotifications = savedDesktopNotifications === "true";
      settingsChanged = true;
    }

    if (settingsChanged) {
      setCurrentSettings(newSettings);
      setTempSettings(newSettings);
      applySettings(newSettings);
    }
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Settings"
      size="lg"
      onSave={saveSettings}
    >
      <div className="flex flex-col md:flex-row md:space-x-6">
        {/* Tabs navigation */}
        <div className="w-full md:w-1/4 mb-6 md:mb-0">
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab("appearance")}
              className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                activeTab === "appearance"
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              }`}
            >
              <div className="flex items-center">
                <Sun size={18} className="mr-3" />
                <span>Appearance</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("privacy")}
              className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                activeTab === "privacy"
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              }`}
            >
              <div className="flex items-center">
                <Lock size={18} className="mr-3" />
                <span>Privacy</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("accessibility")}
              className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                activeTab === "accessibility"
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              }`}
            >
              <div className="flex items-center">
                <Eye size={18} className="mr-3" />
                <span>Accessibility</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                activeTab === "notifications"
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              }`}
            >
              <div className="flex items-center">
                <Bell size={18} className="mr-3" />
                <span>Notifications</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("data")}
              className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                activeTab === "data"
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              }`}
            >
              <div className="flex items-center">
                <Trash size={18} className="mr-3" />
                <span>Data Management</span>
              </div>
            </button>
          </div>
        </div>

        {/* Tab content */}
        <div className="w-full md:w-3/4 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg settings-content">
          {activeTab === "appearance" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Appearance Settings
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Moon
                        size={18}
                        className="text-gray-700 dark:text-gray-300"
                      />
                      <label
                        htmlFor="darkMode"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Dark Mode
                      </label>
                    </div>
                    <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full">
                      <input
                        type="checkbox"
                        id="darkMode"
                        className="absolute w-6 h-6 opacity-0 z-10 cursor-pointer"
                        checked={isDarkMode}
                        onChange={toggleDarkMode}
                      />
                      <label
                        htmlFor="darkMode"
                        className={`block w-full h-full rounded-full ${
                          isDarkMode
                            ? "bg-blue-600"
                            : "bg-gray-300 dark:bg-gray-600"
                        } cursor-pointer transition-colors duration-300 ease-in-out`}
                      >
                        <span
                          className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ease-in-out ${
                            isDarkMode ? "transform translate-x-6" : ""
                          }`}
                        />
                      </label>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 ml-6">
                    Switch between light and dark themes
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Font Size
                  </label>
                  <div className="space-y-3">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="fontSize-small"
                          name="fontSize"
                          value="small"
                          checked={tempSettings.fontSize === "small"}
                          onChange={(e) =>
                            updateTempSetting("fontSize", e.target.value)
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <label
                          htmlFor="fontSize-small"
                          className="text-sm text-gray-700 dark:text-gray-300"
                        >
                          Small
                        </label>
                      </div>
                      <div className="ml-6 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                        <span>This is a preview of the small font size.</span>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="fontSize-medium"
                          name="fontSize"
                          value="medium"
                          checked={tempSettings.fontSize === "medium"}
                          onChange={(e) =>
                            updateTempSetting("fontSize", e.target.value)
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <label
                          htmlFor="fontSize-medium"
                          className="text-sm text-gray-700 dark:text-gray-300"
                        >
                          Medium
                        </label>
                      </div>
                      <div className="ml-6 p-2 bg-gray-100 dark:bg-gray-800 rounded text-base">
                        <span>This is a preview of the medium font size.</span>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="fontSize-large"
                          name="fontSize"
                          value="large"
                          checked={tempSettings.fontSize === "large"}
                          onChange={(e) =>
                            updateTempSetting("fontSize", e.target.value)
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <label
                          htmlFor="fontSize-large"
                          className="text-sm text-gray-700 dark:text-gray-300"
                        >
                          Large
                        </label>
                      </div>
                      <div className="ml-6 p-2 bg-gray-100 dark:bg-gray-800 rounded text-lg">
                        <span>This is a preview of the large font size.</span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Choose a font size that's comfortable for your reading
                    preference.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "privacy" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Privacy Settings
              </h3>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="saveHistory"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={tempSettings.saveHistory}
                    onChange={(e) =>
                      updateTempSetting("saveHistory", e.target.checked)
                    }
                  />
                  <label
                    htmlFor="saveHistory"
                    className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    Save chat history
                  </label>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  When enabled, your chat conversations will be saved locally on
                  your device. Disable this option if you prefer not to store
                  your chat history.
                </p>
              </div>
            </div>
          )}

          {activeTab === "accessibility" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Accessibility Settings
              </h3>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="highContrast"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={tempSettings.highContrast}
                    onChange={(e) =>
                      updateTempSetting("highContrast", e.target.checked)
                    }
                  />
                  <label
                    htmlFor="highContrast"
                    className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    High contrast mode
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="reduceMotion"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={tempSettings.reduceMotion}
                    onChange={(e) =>
                      updateTempSetting("reduceMotion", e.target.checked)
                    }
                  />
                  <label
                    htmlFor="reduceMotion"
                    className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    Reduce motion
                  </label>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Accessibility settings will be applied when you click Save
                  Changes.
                </p>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Notification Settings
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Desktop Notifications
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Receive notifications when the app is in the background
                    </p>
                  </div>
                  <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full">
                    <input
                      type="checkbox"
                      id="desktopNotifications"
                      className="absolute w-6 h-6 opacity-0 z-10 cursor-pointer"
                      checked={tempSettings.desktopNotifications}
                      onChange={(e) => {
                        updateTempSetting(
                          "desktopNotifications",
                          e.target.checked
                        );
                        if (e.target.checked) {
                          // Request notification permission if enabled
                          if (
                            Notification &&
                            Notification.permission !== "granted"
                          ) {
                            Notification.requestPermission();
                          }
                        }
                      }}
                    />
                    <label
                      htmlFor="desktopNotifications"
                      className={`block w-full h-full rounded-full ${
                        tempSettings.desktopNotifications
                          ? "bg-blue-600"
                          : "bg-gray-300 dark:bg-gray-600"
                      } cursor-pointer`}
                    >
                      <span
                        className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ease-in-out ${
                          tempSettings.desktopNotifications
                            ? "transform translate-x-6"
                            : ""
                        }`}
                      />
                    </label>
                  </div>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Note: Desktop notifications require browser permission.
                </p>
              </div>
            </div>
          )}

          {activeTab === "data" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Data Management
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    Your data is stored locally on this device. You can clear
                    all data if needed.
                  </p>

                  <button
                    className="px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md transition-colors"
                    onClick={handleClearAllData}
                  >
                    Clear All Data
                  </button>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    This will permanently delete all your saved data and
                    preferences, except for your dark mode setting.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
