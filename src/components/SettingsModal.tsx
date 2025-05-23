import Modal from "./Modal";
import { Moon, Sun, Globe, Lock, Eye, Bell, Zap } from "lucide-react";
import { useState, useEffect } from "react";

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
  const [activeTab, setActiveTab] = useState("appearance");

  // State for appearance settings
  const [fontSize, setFontSize] = useState("medium");
  const [colorTheme, setColorTheme] = useState("blue");

  // State for language settings
  const [language, setLanguage] = useState("en");

  // State for privacy settings
  const [saveHistory, setSaveHistory] = useState(true);
  const [allowAnalytics, setAllowAnalytics] = useState(true);
  const [acceptCookies, setAcceptCookies] = useState(true);

  // State for accessibility settings
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [screenReaderMode, setScreenReaderMode] = useState("standard");

  // State for notification settings
  const [desktopNotifications, setDesktopNotifications] = useState(true);
  const [soundNotifications, setSoundNotifications] = useState(false);

  // State for advanced settings
  const [dataStorage, setDataStorage] = useState("local");

  // Apply font size to document
  useEffect(() => {
    const htmlElement = document.documentElement;

    // Remove any existing font size classes
    htmlElement.classList.remove("text-sm", "text-base", "text-lg", "text-xl");

    // Add the selected font size class
    switch (fontSize) {
      case "small":
        htmlElement.classList.add("text-sm");
        break;
      case "medium":
        htmlElement.classList.add("text-base");
        break;
      case "large":
        htmlElement.classList.add("text-lg");
        break;
      case "x-large":
        htmlElement.classList.add("text-xl");
        break;
    }
  }, [fontSize]);

  // Apply color theme
  useEffect(() => {
    const root = document.documentElement;

    // Set CSS variables for the selected theme
    switch (colorTheme) {
      case "blue":
        root.style.setProperty("--primary-color", "#4f46e5");
        root.style.setProperty("--primary-hover", "#4338ca");
        break;
      case "purple":
        root.style.setProperty("--primary-color", "#8b5cf6");
        root.style.setProperty("--primary-hover", "#7c3aed");
        break;
      case "green":
        root.style.setProperty("--primary-color", "#10b981");
        root.style.setProperty("--primary-hover", "#059669");
        break;
      case "red":
        root.style.setProperty("--primary-color", "#ef4444");
        root.style.setProperty("--primary-hover", "#dc2626");
        break;
      case "yellow":
        root.style.setProperty("--primary-color", "#f59e0b");
        root.style.setProperty("--primary-hover", "#d97706");
        break;
    }
  }, [colorTheme]);

  // Apply high contrast mode
  useEffect(() => {
    if (highContrast) {
      document.body.classList.add("high-contrast");
    } else {
      document.body.classList.remove("high-contrast");
    }
  }, [highContrast]);

  // Apply reduced motion
  useEffect(() => {
    if (reduceMotion) {
      document.body.classList.add("reduce-motion");
    } else {
      document.body.classList.remove("reduce-motion");
    }
  }, [reduceMotion]);

  // Handle clear all data
  const handleClearAllData = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all data? This action cannot be undone."
      )
    ) {
      localStorage.clear();
      sessionStorage.clear();
      alert("All data has been cleared. The page will now reload.");
      window.location.reload();
    }
  };

  // Save all settings
  const saveSettings = () => {
    // Save settings to localStorage
    localStorage.setItem("fontSize", fontSize);
    localStorage.setItem("colorTheme", colorTheme);
    localStorage.setItem("language", language);
    localStorage.setItem("saveHistory", saveHistory.toString());
    localStorage.setItem("allowAnalytics", allowAnalytics.toString());
    localStorage.setItem("acceptCookies", acceptCookies.toString());
    localStorage.setItem("highContrast", highContrast.toString());
    localStorage.setItem("reduceMotion", reduceMotion.toString());
    localStorage.setItem("screenReaderMode", screenReaderMode);
    localStorage.setItem(
      "desktopNotifications",
      desktopNotifications.toString()
    );
    localStorage.setItem("soundNotifications", soundNotifications.toString());
    localStorage.setItem("dataStorage", dataStorage);

    // Show success message
    alert("Settings saved successfully!");

    // Close the modal
    onClose();
  };

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedFontSize = localStorage.getItem("fontSize");
    if (savedFontSize) setFontSize(savedFontSize);

    const savedColorTheme = localStorage.getItem("colorTheme");
    if (savedColorTheme) setColorTheme(savedColorTheme);

    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage) setLanguage(savedLanguage);

    const savedSaveHistory = localStorage.getItem("saveHistory");
    if (savedSaveHistory) setSaveHistory(savedSaveHistory === "true");

    const savedAllowAnalytics = localStorage.getItem("allowAnalytics");
    if (savedAllowAnalytics) setAllowAnalytics(savedAllowAnalytics === "true");

    const savedAcceptCookies = localStorage.getItem("acceptCookies");
    if (savedAcceptCookies) setAcceptCookies(savedAcceptCookies === "true");

    const savedHighContrast = localStorage.getItem("highContrast");
    if (savedHighContrast) setHighContrast(savedHighContrast === "true");

    const savedReduceMotion = localStorage.getItem("reduceMotion");
    if (savedReduceMotion) setReduceMotion(savedReduceMotion === "true");

    const savedScreenReaderMode = localStorage.getItem("screenReaderMode");
    if (savedScreenReaderMode) setScreenReaderMode(savedScreenReaderMode);

    const savedDesktopNotifications = localStorage.getItem(
      "desktopNotifications"
    );
    if (savedDesktopNotifications)
      setDesktopNotifications(savedDesktopNotifications === "true");

    const savedSoundNotifications = localStorage.getItem("soundNotifications");
    if (savedSoundNotifications)
      setSoundNotifications(savedSoundNotifications === "true");

    const savedDataStorage = localStorage.getItem("dataStorage");
    if (savedDataStorage) setDataStorage(savedDataStorage);
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
              onClick={() => setActiveTab("language")}
              className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                activeTab === "language"
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              }`}
            >
              <div className="flex items-center">
                <Globe size={18} className="mr-3" />
                <span>Language</span>
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
              onClick={() => setActiveTab("advanced")}
              className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                activeTab === "advanced"
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              }`}
            >
              <div className="flex items-center">
                <Zap size={18} className="mr-3" />
                <span>Advanced</span>
              </div>
            </button>
          </div>
        </div>

        {/* Tab content */}
        <div className="w-full md:w-3/4 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg">
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
                  <select
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="x-large">Extra Large</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Color Theme
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    <button
                      className={`w-8 h-8 rounded-full bg-blue-600 border-2 ${
                        colorTheme === "blue"
                          ? "border-black dark:border-white ring-2 ring-blue-400"
                          : "border-white dark:border-gray-800"
                      } shadow-sm transition-all`}
                      onClick={() => setColorTheme("blue")}
                      aria-label="Blue theme"
                    ></button>
                    <button
                      className={`w-8 h-8 rounded-full bg-purple-600 border-2 ${
                        colorTheme === "purple"
                          ? "border-black dark:border-white ring-2 ring-purple-400"
                          : "border-white dark:border-gray-800"
                      } shadow-sm transition-all`}
                      onClick={() => setColorTheme("purple")}
                      aria-label="Purple theme"
                    ></button>
                    <button
                      className={`w-8 h-8 rounded-full bg-green-600 border-2 ${
                        colorTheme === "green"
                          ? "border-black dark:border-white ring-2 ring-green-400"
                          : "border-white dark:border-gray-800"
                      } shadow-sm transition-all`}
                      onClick={() => setColorTheme("green")}
                      aria-label="Green theme"
                    ></button>
                    <button
                      className={`w-8 h-8 rounded-full bg-red-600 border-2 ${
                        colorTheme === "red"
                          ? "border-black dark:border-white ring-2 ring-red-400"
                          : "border-white dark:border-gray-800"
                      } shadow-sm transition-all`}
                      onClick={() => setColorTheme("red")}
                      aria-label="Red theme"
                    ></button>
                    <button
                      className={`w-8 h-8 rounded-full bg-yellow-500 border-2 ${
                        colorTheme === "yellow"
                          ? "border-black dark:border-white ring-2 ring-yellow-400"
                          : "border-white dark:border-gray-800"
                      } shadow-sm transition-all`}
                      onClick={() => setColorTheme("yellow")}
                      aria-label="Yellow theme"
                    ></button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "language" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Language Settings
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Interface Language
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="ja">日本語</option>
                    <option value="zh">中文</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Changes will take effect after reloading the page
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
                    checked={saveHistory}
                    onChange={(e) => setSaveHistory(e.target.checked)}
                  />
                  <label
                    htmlFor="saveHistory"
                    className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    Save chat history
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="analytics"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={allowAnalytics}
                    onChange={(e) => setAllowAnalytics(e.target.checked)}
                  />
                  <label
                    htmlFor="analytics"
                    className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    Allow anonymous usage analytics
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="cookies"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={acceptCookies}
                    onChange={(e) => setAcceptCookies(e.target.checked)}
                  />
                  <label
                    htmlFor="cookies"
                    className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    Accept cookies
                  </label>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Your privacy choices are saved automatically and will be
                  applied immediately.
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
                    checked={highContrast}
                    onChange={(e) => setHighContrast(e.target.checked)}
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
                    checked={reduceMotion}
                    onChange={(e) => setReduceMotion(e.target.checked)}
                  />
                  <label
                    htmlFor="reduceMotion"
                    className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    Reduce motion
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Screen Reader Compatibility
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={screenReaderMode}
                    onChange={(e) => setScreenReaderMode(e.target.value)}
                  >
                    <option value="standard">Standard</option>
                    <option value="enhanced">Enhanced</option>
                  </select>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Accessibility settings are applied immediately to improve your
                  experience.
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
                      checked={desktopNotifications}
                      onChange={(e) => {
                        setDesktopNotifications(e.target.checked);
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
                        desktopNotifications
                          ? "bg-blue-600"
                          : "bg-gray-300 dark:bg-gray-600"
                      } cursor-pointer`}
                    >
                      <span
                        className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ease-in-out ${
                          desktopNotifications ? "transform translate-x-6" : ""
                        }`}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Sound Notifications
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Play a sound when receiving a new message
                    </p>
                  </div>
                  <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full">
                    <input
                      type="checkbox"
                      id="soundNotifications"
                      className="absolute w-6 h-6 opacity-0 z-10 cursor-pointer"
                      checked={soundNotifications}
                      onChange={(e) => setSoundNotifications(e.target.checked)}
                    />
                    <label
                      htmlFor="soundNotifications"
                      className={`block w-full h-full rounded-full ${
                        soundNotifications
                          ? "bg-blue-600"
                          : "bg-gray-300 dark:bg-gray-600"
                      } cursor-pointer`}
                    >
                      <span
                        className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ease-in-out ${
                          soundNotifications ? "transform translate-x-6" : ""
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

          {activeTab === "advanced" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Advanced Settings
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data Storage
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={dataStorage}
                    onChange={(e) => setDataStorage(e.target.value)}
                  >
                    <option value="local">Local Storage Only</option>
                    <option value="cloud">Cloud Sync</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {dataStorage === "cloud"
                      ? "Your data will be synced across devices"
                      : "Your data will only be stored on this device"}
                  </p>
                </div>

                <div>
                  <button
                    className="px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md transition-colors"
                    onClick={handleClearAllData}
                  >
                    Clear All Data
                  </button>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    This will permanently delete all your saved data and
                    preferences
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
