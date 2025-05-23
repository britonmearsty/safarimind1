import { Moon, Sun, X } from 'lucide-react';
import { useEffect, useRef, memo } from 'react';

type SettingsProps = {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
};

// Memoized component to prevent unnecessary re-renders
const Settings = memo(function Settings({ isOpen, onClose, isDarkMode, toggleDarkMode }: SettingsProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close settings
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Prevent scrolling of main content when settings panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
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
        className="absolute right-0 top-0 h-full w-80 max-w-full bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 animate-slideInRight"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Settings</h2>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
              aria-label="Close settings"
            >
              <X size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-6">
              {/* Theme Toggle Section */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Appearance</h3>
                <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    {isDarkMode ? (
                      <Moon size={18} className="text-indigo-500 dark:text-indigo-400 mr-2" />
                    ) : (
                      <Sun size={18} className="text-amber-500 mr-2" />
                    )}
                    <span className="text-gray-700 dark:text-gray-300">
                      {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                    </span>
                  </div>
                  <button
                    onClick={toggleDarkMode}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      isDarkMode ? 'bg-indigo-600' : 'bg-gray-300'
                    } transition-colors duration-300 focus:outline-none`}
                    role="switch"
                    aria-label="Toggle dark mode"
                  >
                    <span className="sr-only">Toggle theme</span>
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isDarkMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
              
              {/* About Section */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">About</h3>
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    AI Chat is a demo application showcasing a modern chat interface with customizable settings.
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
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
Settings.displayName = 'Settings';
export default Settings;
