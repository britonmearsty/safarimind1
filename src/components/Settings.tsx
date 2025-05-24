import { Moon, Sun, X, Monitor } from "lucide-react";
import { useEffect, useRef, memo } from "react";

type SettingsProps = {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  isSystemTheme: boolean;
  toggleDarkMode: () => void;
  toggleSystemTheme: () => void;
};

// Memoized component to prevent unnecessary re-renders
const Settings = memo(function Settings({
  isOpen,
  onClose,
  isDarkMode,
  isSystemTheme,
  toggleDarkMode,
  toggleSystemTheme,
}: SettingsProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close settings
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
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

  // Prevent scrolling of main content when settings panel is open
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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity animate-fadeIn">
      <div
        ref={panelRef}
        id="settings-panel"
        role="dialog"
        aria-label="Settings"
        aria-modal="true"
        className="absolute right-0 top-0 h-full w-full xs:w-[85%] sm:w-80 max-w-full bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 animate-slideInRight"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">
              Settings
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
              aria-label="Close settings"
            >
              <X
                size={18}
                className="text-gray-600 dark:text-gray-400 sm:hidden"
              />
              <X
                size={20}
                className="text-gray-600 dark:text-gray-400 hidden sm:block"
              />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 sm:p-4">
            <div className="space-y-4 sm:space-y-6">
              {/* Theme Toggle Section */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Appearance
                </h3>

                {/* System Theme Toggle */}
                <div className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-100 dark:bg-gray-700 rounded-lg mb-2">
                  <div className="flex items-center">
                    <Monitor
                      size={16}
                      className="text-blue-500 dark:text-blue-400 mr-1.5 sm:mr-2 sm:hidden"
                    />
                    <Monitor
                      size={18}
                      className="text-blue-500 dark:text-blue-400 mr-2 hidden sm:block"
                    />
                    <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                      Use System Theme
                    </span>
                  </div>
                  <button
                    onClick={toggleSystemTheme}
                    className={`relative inline-flex h-5 sm:h-6 w-9 sm:w-11 items-center rounded-full ${
                      isSystemTheme ? "bg-blue-600" : "bg-gray-300"
                    } transition-colors duration-300 focus:outline-none`}
                    role="switch"
                    aria-label="Toggle system theme"
                  >
                    <span className="sr-only">Use system theme</span>
                    <span
                      className={`inline-block h-3.5 sm:h-4 w-3.5 sm:w-4 transform rounded-full bg-white transition-transform ${
                        isSystemTheme
                          ? "translate-x-5 sm:translate-x-6"
                          : "translate-x-0.5 sm:translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Manual Dark/Light Mode Toggle - Only enabled when not using system theme */}
                <div
                  className={`flex items-center justify-between p-2.5 sm:p-3 bg-gray-100 dark:bg-gray-700 rounded-lg ${
                    isSystemTheme ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-center">
                    {isDarkMode ? (
                      <>
                        <Moon
                          size={16}
                          className="text-indigo-500 dark:text-indigo-400 mr-1.5 sm:mr-2 sm:hidden"
                        />
                        <Moon
                          size={18}
                          className="text-indigo-500 dark:text-indigo-400 mr-2 hidden sm:block"
                        />
                      </>
                    ) : (
                      <>
                        <Sun
                          size={16}
                          className="text-amber-500 mr-1.5 sm:mr-2 sm:hidden"
                        />
                        <Sun
                          size={18}
                          className="text-amber-500 mr-2 hidden sm:block"
                        />
                      </>
                    )}
                    <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                      {isDarkMode ? "Dark Mode" : "Light Mode"}
                    </span>
                  </div>
                  <button
                    onClick={toggleDarkMode}
                    disabled={isSystemTheme}
                    className={`relative inline-flex h-5 sm:h-6 w-9 sm:w-11 items-center rounded-full ${
                      isDarkMode ? "bg-indigo-600" : "bg-gray-300"
                    } transition-colors duration-300 focus:outline-none ${
                      isSystemTheme ? "cursor-not-allowed" : ""
                    }`}
                    role="switch"
                    aria-label="Toggle dark mode"
                  >
                    <span className="sr-only">Toggle theme</span>
                    <span
                      className={`inline-block h-3.5 sm:h-4 w-3.5 sm:w-4 transform rounded-full bg-white transition-transform ${
                        isDarkMode
                          ? "translate-x-5 sm:translate-x-6"
                          : "translate-x-0.5 sm:translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* About Section */}
              <div>
                <h3 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                  About
                </h3>
                <div className="p-2.5 sm:p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    AI Chat is a demo application showcasing a modern chat
                    interface with customizable settings.
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1.5 sm:mt-2">
                    Version 1.0.0
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// Set display name for better debugging
Settings.displayName = "Settings";
export default Settings;
