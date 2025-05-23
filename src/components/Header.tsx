import {
  History,
  Sparkles,
  User,
  Settings as SettingsIcon,
  HelpCircle,
  LogOut,
  Bell,
  Shield,
  Flag,
  ChevronDown,
} from "lucide-react";
import { memo, useState, useRef, useEffect } from "react";
import ProfileModal from "./ProfileModal";
import SettingsModal from "./SettingsModal";
import NotificationsModal from "./NotificationsModal";
import HelpCenterModal from "./HelpCenterModal";
import ReportIssueModal from "./ReportIssueModal";
import PrivacySecurityModal from "./PrivacySecurityModal";

type HeaderProps = {
  onClearChat: () => void;
  onToggleHistory: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onNewChat: () => void;
};

// Memoized component to prevent unnecessary re-renders
const Header = memo(function Header({
  onClearChat,
  onToggleHistory,
  isDarkMode,
  toggleDarkMode,
  onNewChat,
}: HeaderProps) {
  // Profile dropdown state
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  // Modal states
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] =
    useState(false);
  const [isHelpCenterModalOpen, setIsHelpCenterModalOpen] = useState(false);
  const [isReportIssueModalOpen, setIsReportIssueModalOpen] = useState(false);
  const [isPrivacySecurityModalOpen, setIsPrivacySecurityModalOpen] =
    useState(false);

  // Handle click outside to close profile menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node) &&
        !profileButtonRef.current?.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    }

    if (isProfileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  // Close menu when Escape key is pressed
  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsProfileMenuOpen(false);
      }
    }

    if (isProfileMenuOpen) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isProfileMenuOpen]);

  // Handle opening modals from dropdown menu
  const handleOpenProfileModal = () => {
    setIsProfileModalOpen(true);
    setIsProfileMenuOpen(false);
  };

  const handleOpenSettingsModal = () => {
    setIsSettingsModalOpen(true);
    setIsProfileMenuOpen(false);
  };

  const handleOpenNotificationsModal = () => {
    setIsNotificationsModalOpen(true);
    setIsProfileMenuOpen(false);
  };

  const handleOpenHelpCenterModal = () => {
    setIsHelpCenterModalOpen(true);
    setIsProfileMenuOpen(false);
  };

  const handleOpenReportIssueModal = () => {
    setIsReportIssueModalOpen(true);
    setIsProfileMenuOpen(false);
  };

  const handleOpenPrivacySecurityModal = () => {
    setIsPrivacySecurityModalOpen(true);
    setIsProfileMenuOpen(false);
  };

  return (
    <>
      <header className="flex items-center justify-between px-2 sm:px-4 py-2 sm:py-3 bg-transparent backdrop-blur-sm">
        <div className="flex items-center">
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                width="100%"
                height="100%"
                viewBox="0 0 48 48"
              >
                <radialGradient
                  id="oDvWy9qKGfkbPZViUk7TCa_eoxMN35Z6JKg_gr1"
                  cx="-670.437"
                  cy="617.13"
                  r=".041"
                  gradientTransform="matrix(128.602 652.9562 653.274 -128.6646 -316906.281 517189.719)"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0" stop-color="#1ba1e3"></stop>
                  <stop offset="0" stop-color="#1ba1e3"></stop>
                  <stop offset=".3" stop-color="#5489d6"></stop>
                  <stop offset=".545" stop-color="#9b72cb"></stop>
                  <stop offset=".825" stop-color="#d96570"></stop>
                  <stop offset="1" stop-color="#f49c46"></stop>
                </radialGradient>
                <path
                  fill="url(#oDvWy9qKGfkbPZViUk7TCa_eoxMN35Z6JKg_gr1)"
                  d="M22.882,31.557l-1.757,4.024c-0.675,1.547-2.816,1.547-3.491,0l-1.757-4.024	c-1.564-3.581-4.378-6.432-7.888-7.99l-4.836-2.147c-1.538-0.682-1.538-2.919,0-3.602l4.685-2.08	c3.601-1.598,6.465-4.554,8.002-8.258l1.78-4.288c0.66-1.591,2.859-1.591,3.52,0l1.78,4.288c1.537,3.703,4.402,6.659,8.002,8.258	l4.685,2.08c1.538,0.682,1.538,2.919,0,3.602l-4.836,2.147C27.26,25.126,24.446,27.976,22.882,31.557z"
                ></path>
                <radialGradient
                  id="oDvWy9qKGfkbPZViUk7TCb_eoxMN35Z6JKg_gr2"
                  cx="-670.437"
                  cy="617.13"
                  r=".041"
                  gradientTransform="matrix(128.602 652.9562 653.274 -128.6646 -316906.281 517189.719)"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0" stop-color="#1ba1e3"></stop>
                  <stop offset="0" stop-color="#1ba1e3"></stop>
                  <stop offset=".3" stop-color="#5489d6"></stop>
                  <stop offset=".545" stop-color="#9b72cb"></stop>
                  <stop offset=".825" stop-color="#d96570"></stop>
                  <stop offset="1" stop-color="#f49c46"></stop>
                </radialGradient>
                <path
                  fill="url(#oDvWy9qKGfkbPZViUk7TCb_eoxMN35Z6JKg_gr2)"
                  d="M39.21,44.246l-0.494,1.132	c-0.362,0.829-1.51,0.829-1.871,0l-0.494-1.132c-0.881-2.019-2.467-3.627-4.447-4.506l-1.522-0.676	c-0.823-0.366-0.823-1.562,0-1.928l1.437-0.639c2.03-0.902,3.645-2.569,4.511-4.657l0.507-1.224c0.354-0.853,1.533-0.853,1.886,0	l0.507,1.224c0.866,2.088,2.481,3.755,4.511,4.657l1.437,0.639c0.823,0.366,0.823,1.562,0,1.928l-1.522,0.676	C41.677,40.619,40.091,42.227,39.21,44.246z"
                ></path>
              </svg>
            </div>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white hidden xs:block">
              Safarimind
            </h1>
          </div>
          <button
            onClick={onNewChat}
            className="ml-2 sm:ml-3 p-2 rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white transition-colors focus:outline-none"
            aria-label="New Chat"
            title="New Chat"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </button>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-3">
          {/* Quick theme toggle button */}
          <button
            onClick={toggleDarkMode}
            className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none"
            aria-label={
              isDarkMode ? "Switch to light mode" : "Switch to dark mode"
            }
            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? (
              <Sparkles size={16} className="text-yellow-400 sm:hidden" />
            ) : (
              <Sparkles size={16} className="text-blue-600 sm:hidden" />
            )}
            {isDarkMode ? (
              <Sparkles size={18} className="text-yellow-400 hidden sm:block" />
            ) : (
              <Sparkles size={18} className="text-blue-600 hidden sm:block" />
            )}
          </button>

          <button
            onClick={onToggleHistory}
            className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none"
            aria-label="View chat history"
            aria-controls="history-modal"
            title="View chat history"
          >
            <History
              size={16}
              className="text-gray-600 dark:text-gray-400 sm:hidden"
            />
            <History
              size={18}
              className="text-gray-600 dark:text-gray-400 hidden sm:block"
            />
          </button>

          {/* Profile dropdown button */}
          <div className="relative">
            <button
              ref={profileButtonRef}
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center space-x-0 sm:space-x-1 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none"
              aria-label="Profile menu"
              aria-expanded={isProfileMenuOpen}
              aria-controls="profile-dropdown"
              title="Profile menu"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  width="100%"
                  height="100%"
                  viewBox="0 0 48 48"
                >
                  <radialGradient
                    id="profileButtonGradient1"
                    cx="-670.437"
                    cy="617.13"
                    r=".041"
                    gradientTransform="matrix(128.602 652.9562 653.274 -128.6646 -316906.281 517189.719)"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0" stop-color="#1ba1e3"></stop>
                    <stop offset="0" stop-color="#1ba1e3"></stop>
                    <stop offset=".3" stop-color="#5489d6"></stop>
                    <stop offset=".545" stop-color="#9b72cb"></stop>
                    <stop offset=".825" stop-color="#d96570"></stop>
                    <stop offset="1" stop-color="#f49c46"></stop>
                  </radialGradient>
                  <path
                    fill="url(#profileButtonGradient1)"
                    d="M22.882,31.557l-1.757,4.024c-0.675,1.547-2.816,1.547-3.491,0l-1.757-4.024	c-1.564-3.581-4.378-6.432-7.888-7.99l-4.836-2.147c-1.538-0.682-1.538-2.919,0-3.602l4.685-2.08	c3.601-1.598,6.465-4.554,8.002-8.258l1.78-4.288c0.66-1.591,2.859-1.591,3.52,0l1.78,4.288c1.537,3.703,4.402,6.659,8.002,8.258	l4.685,2.08c1.538,0.682,1.538,2.919,0,3.602l-4.836,2.147C27.26,25.126,24.446,27.976,22.882,31.557z"
                  ></path>
                  <radialGradient
                    id="profileButtonGradient2"
                    cx="-670.437"
                    cy="617.13"
                    r=".041"
                    gradientTransform="matrix(128.602 652.9562 653.274 -128.6646 -316906.281 517189.719)"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0" stop-color="#1ba1e3"></stop>
                    <stop offset="0" stop-color="#1ba1e3"></stop>
                    <stop offset=".3" stop-color="#5489d6"></stop>
                    <stop offset=".545" stop-color="#9b72cb"></stop>
                    <stop offset=".825" stop-color="#d96570"></stop>
                    <stop offset="1" stop-color="#f49c46"></stop>
                  </radialGradient>
                  <path
                    fill="url(#profileButtonGradient2)"
                    d="M39.21,44.246l-0.494,1.132	c-0.362,0.829-1.51,0.829-1.871,0l-0.494-1.132c-0.881-2.019-2.467-3.627-4.447-4.506l-1.522-0.676	c-0.823-0.366-0.823-1.562,0-1.928l1.437-0.639c2.03-0.902,3.645-2.569,4.511-4.657l0.507-1.224c0.354-0.853,1.533-0.853,1.886,0	l0.507,1.224c0.866,2.088,2.481,3.755,4.511,4.657l1.437,0.639c0.823,0.366,0.823,1.562,0,1.928l-1.522,0.676	C41.677,40.619,40.091,42.227,39.21,44.246z"
                  ></path>
                </svg>
              </div>
              <ChevronDown
                size={12}
                className="text-gray-600 dark:text-gray-400 sm:hidden ml-0.5"
              />
              <ChevronDown
                size={14}
                className="text-gray-600 dark:text-gray-400 hidden sm:block"
              />
            </button>

            {/* Profile dropdown menu */}
            {isProfileMenuOpen && (
              <div
                id="profile-dropdown"
                ref={profileMenuRef}
                className="absolute right-0 mt-2 w-56 sm:w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 animate-scaleIn"
                role="menu"
              >
                {/* User info section */}
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        x="0px"
                        y="0px"
                        width="100%"
                        height="100%"
                        viewBox="0 0 48 48"
                      >
                        <radialGradient
                          id="profileDropdownGradient1"
                          cx="-670.437"
                          cy="617.13"
                          r=".041"
                          gradientTransform="matrix(128.602 652.9562 653.274 -128.6646 -316906.281 517189.719)"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop offset="0" stop-color="#1ba1e3"></stop>
                          <stop offset="0" stop-color="#1ba1e3"></stop>
                          <stop offset=".3" stop-color="#5489d6"></stop>
                          <stop offset=".545" stop-color="#9b72cb"></stop>
                          <stop offset=".825" stop-color="#d96570"></stop>
                          <stop offset="1" stop-color="#f49c46"></stop>
                        </radialGradient>
                        <path
                          fill="url(#profileDropdownGradient1)"
                          d="M22.882,31.557l-1.757,4.024c-0.675,1.547-2.816,1.547-3.491,0l-1.757-4.024	c-1.564-3.581-4.378-6.432-7.888-7.99l-4.836-2.147c-1.538-0.682-1.538-2.919,0-3.602l4.685-2.08	c3.601-1.598,6.465-4.554,8.002-8.258l1.78-4.288c0.66-1.591,2.859-1.591,3.52,0l1.78,4.288c1.537,3.703,4.402,6.659,8.002,8.258	l4.685,2.08c1.538,0.682,1.538,2.919,0,3.602l-4.836,2.147C27.26,25.126,24.446,27.976,22.882,31.557z"
                        ></path>
                        <radialGradient
                          id="profileDropdownGradient2"
                          cx="-670.437"
                          cy="617.13"
                          r=".041"
                          gradientTransform="matrix(128.602 652.9562 653.274 -128.6646 -316906.281 517189.719)"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop offset="0" stop-color="#1ba1e3"></stop>
                          <stop offset="0" stop-color="#1ba1e3"></stop>
                          <stop offset=".3" stop-color="#5489d6"></stop>
                          <stop offset=".545" stop-color="#9b72cb"></stop>
                          <stop offset=".825" stop-color="#d96570"></stop>
                          <stop offset="1" stop-color="#f49c46"></stop>
                        </radialGradient>
                        <path
                          fill="url(#profileDropdownGradient2)"
                          d="M39.21,44.246l-0.494,1.132	c-0.362,0.829-1.51,0.829-1.871,0l-0.494-1.132c-0.881-2.019-2.467-3.627-4.447-4.506l-1.522-0.676	c-0.823-0.366-0.823-1.562,0-1.928l1.437-0.639c2.03-0.902,3.645-2.569,4.511-4.657l0.507-1.224c0.354-0.853,1.533-0.853,1.886,0	l0.507,1.224c0.866,2.088,2.481,3.755,4.511,4.657l1.437,0.639c0.823,0.366,0.823,1.562,0,1.928l-1.522,0.676	C41.677,40.619,40.091,42.227,39.21,44.246z"
                        ></path>
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">
                        User Name
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        user@example.com
                      </p>
                    </div>
                  </div>
                </div>

                {/* Account section */}
                <div className="py-1 px-2">
                  <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Account
                  </div>
                  <button
                    onClick={handleOpenProfileModal}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                  >
                    <User
                      size={16}
                      className="mr-3 text-gray-500 dark:text-gray-400"
                    />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={handleOpenSettingsModal}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                  >
                    <SettingsIcon
                      size={16}
                      className="mr-3 text-gray-500 dark:text-gray-400"
                    />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={handleOpenNotificationsModal}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                  >
                    <Bell
                      size={16}
                      className="mr-3 text-gray-500 dark:text-gray-400"
                    />
                    <span>Notifications</span>
                  </button>
                </div>

                {/* Support section */}
                <div className="py-1 px-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Support
                  </div>
                  <button
                    onClick={handleOpenHelpCenterModal}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                  >
                    <HelpCircle
                      size={16}
                      className="mr-3 text-gray-500 dark:text-gray-400"
                    />
                    <span>Help Center</span>
                  </button>
                  <button
                    onClick={handleOpenReportIssueModal}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                  >
                    <Flag
                      size={16}
                      className="mr-3 text-gray-500 dark:text-gray-400"
                    />
                    <span>Report an Issue</span>
                  </button>
                  <button
                    onClick={handleOpenPrivacySecurityModal}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                  >
                    <Shield
                      size={16}
                      className="mr-3 text-gray-500 dark:text-gray-400"
                    />
                    <span>Privacy & Security</span>
                  </button>
                </div>

                {/* Sign out section */}
                <div className="py-1 px-2 border-t border-gray-200 dark:border-gray-700">
                  <button className="flex items-center w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors">
                    <LogOut size={16} className="mr-3" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modals */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />

      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
      />

      <HelpCenterModal
        isOpen={isHelpCenterModalOpen}
        onClose={() => setIsHelpCenterModalOpen(false)}
      />

      <ReportIssueModal
        isOpen={isReportIssueModalOpen}
        onClose={() => setIsReportIssueModalOpen(false)}
      />

      <PrivacySecurityModal
        isOpen={isPrivacySecurityModalOpen}
        onClose={() => setIsPrivacySecurityModalOpen(false)}
      />
    </>
  );
});

// Set display name for better debugging
Header.displayName = "Header";
export default Header;
