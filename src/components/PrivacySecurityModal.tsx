import Modal from "./Modal";
import {
  Shield,
  Lock,
  Eye,
  Database,
  Key,
  AlertTriangle,
  Check,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";

type PrivacySecurityModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const PrivacySecurityModal = ({
  isOpen,
  onClose,
}: PrivacySecurityModalProps) => {
  const [activeTab, setActiveTab] = useState("privacy");
  const [dataSharing, setDataSharing] = useState({
    usageData: true,
    conversationHistory: true,
    locationData: false,
  });
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: "30",
  });
  const [showPasswordResetSuccess, setShowPasswordResetSuccess] =
    useState(false);
  //use toast

  // Handle data sharing toggle
  const handleDataSharingToggle = (setting: keyof typeof dataSharing) => {
    setDataSharing((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  // Handle security settings toggle
  const handleSecurityToggle = (setting: keyof typeof securitySettings) => {
    if (setting === "twoFactorAuth") {
      setSecuritySettings((prev) => ({
        ...prev,
        [setting]: !prev[setting],
      }));
    }
  };

  // Handle session timeout change
  const handleSessionTimeoutChange = (value: string) => {
    setSecuritySettings((prev) => ({
      ...prev,
      sessionTimeout: value,
    }));
  };

  // Simulate password reset
  const handlePasswordReset = () => {
    setShowPasswordResetSuccess(true);
    setTimeout(() => {
      setShowPasswordResetSuccess(false);
    }, 3000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Privacy & Security"
      size="lg"
    >
      <div className="flex flex-col md:flex-row md:space-x-6">
        {/* Tabs navigation */}
        <div className="w-full md:w-1/4 mb-6 md:mb-0">
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab("privacy")}
              className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                activeTab === "privacy"
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              }`}
            >
              <div className="flex items-center">
                <Shield size={18} className="mr-3" />
                <span>Privacy</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                activeTab === "security"
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              }`}
            >
              <div className="flex items-center">
                <Lock size={18} className="mr-3" />
                <span>Security</span>
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
                <Database size={18} className="mr-3" />
                <span>Your Data</span>
              </div>
            </button>
          </div>
        </div>

        {/* Tab content */}
        <div className="w-full md:w-3/4 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg">
          {/* Privacy Tab */}
          {activeTab === "privacy" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Privacy Settings
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Database
                        size={18}
                        className="text-gray-700 dark:text-gray-300"
                      />
                      <label
                        htmlFor="usageData"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Share Usage Data
                      </label>
                    </div>
                    <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full">
                      <input
                        type="checkbox"
                        id="usageData"
                        className="absolute w-6 h-6 opacity-0 z-10 cursor-pointer"
                        checked={dataSharing.usageData}
                        onChange={() => handleDataSharingToggle("usageData")}
                      />
                      <label
                        htmlFor="usageData"
                        className={`block w-full h-full rounded-full ${
                          dataSharing.usageData
                            ? "bg-blue-600"
                            : "bg-gray-300 dark:bg-gray-600"
                        } cursor-pointer transition-colors duration-300 ease-in-out`}
                      >
                        <span
                          className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ease-in-out ${
                            dataSharing.usageData
                              ? "transform translate-x-6"
                              : ""
                          }`}
                        />
                      </label>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 ml-6">
                    Allow us to collect anonymous usage data to improve our
                    services
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Eye
                        size={18}
                        className="text-gray-700 dark:text-gray-300"
                      />
                      <label
                        htmlFor="conversationHistory"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Save Conversation History
                      </label>
                    </div>
                    <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full">
                      <input
                        type="checkbox"
                        id="conversationHistory"
                        className="absolute w-6 h-6 opacity-0 z-10 cursor-pointer"
                        checked={dataSharing.conversationHistory}
                        onChange={() =>
                          handleDataSharingToggle("conversationHistory")
                        }
                      />
                      <label
                        htmlFor="conversationHistory"
                        className={`block w-full h-full rounded-full ${
                          dataSharing.conversationHistory
                            ? "bg-blue-600"
                            : "bg-gray-300 dark:bg-gray-600"
                        } cursor-pointer transition-colors duration-300 ease-in-out`}
                      >
                        <span
                          className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ease-in-out ${
                            dataSharing.conversationHistory
                              ? "transform translate-x-6"
                              : ""
                          }`}
                        />
                      </label>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 ml-6">
                    Store your chat history for future reference
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Lock
                        size={18}
                        className="text-gray-700 dark:text-gray-300"
                      />
                      <label
                        htmlFor="locationData"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Share Location Data
                      </label>
                    </div>
                    <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full">
                      <input
                        type="checkbox"
                        id="locationData"
                        className="absolute w-6 h-6 opacity-0 z-10 cursor-pointer"
                        checked={dataSharing.locationData}
                        onChange={() => handleDataSharingToggle("locationData")}
                      />
                      <label
                        htmlFor="locationData"
                        className={`block w-full h-full rounded-full ${
                          dataSharing.locationData
                            ? "bg-blue-600"
                            : "bg-gray-300 dark:bg-gray-600"
                        } cursor-pointer transition-colors duration-300 ease-in-out`}
                      >
                        <span
                          className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ease-in-out ${
                            dataSharing.locationData
                              ? "transform translate-x-6"
                              : ""
                          }`}
                        />
                      </label>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 ml-6">
                    Allow access to your location for personalized services
                  </p>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-900/30">
                <div className="flex items-start">
                  <AlertTriangle
                    size={20}
                    className="text-yellow-600 dark:text-yellow-400 mr-3 flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-white">
                      Privacy Notice
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      We take your privacy seriously. Your data is encrypted and
                      stored securely. You can request a copy of your data or
                      delete it at any time from the "Your Data" tab.
                    </p>
                    <a
                      href="#"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block"
                    >
                      Read our full Privacy Policy
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Security Settings
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Key
                        size={18}
                        className="text-gray-700 dark:text-gray-300"
                      />
                      <label
                        htmlFor="twoFactorAuth"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Two-Factor Authentication
                      </label>
                    </div>
                    <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full">
                      <input
                        type="checkbox"
                        id="twoFactorAuth"
                        className="absolute w-6 h-6 opacity-0 z-10 cursor-pointer"
                        checked={securitySettings.twoFactorAuth}
                        onChange={() => handleSecurityToggle("twoFactorAuth")}
                      />
                      <label
                        htmlFor="twoFactorAuth"
                        className={`block w-full h-full rounded-full ${
                          securitySettings.twoFactorAuth
                            ? "bg-blue-600"
                            : "bg-gray-300 dark:bg-gray-600"
                        } cursor-pointer transition-colors duration-300 ease-in-out`}
                      >
                        <span
                          className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ease-in-out ${
                            securitySettings.twoFactorAuth
                              ? "transform translate-x-6"
                              : ""
                          }`}
                        />
                      </label>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 ml-6">
                    Add an extra layer of security to your account
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="sessionTimeout"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Session Timeout
                  </label>
                  <select
                    id="sessionTimeout"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => handleSessionTimeoutChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                    <option value="never">Never</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Automatically log out after a period of inactivity
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-md font-medium text-gray-800 dark:text-white mb-3">
                    Password Management
                  </h4>

                  <div className="space-y-3">
                    <button
                      onClick={handlePasswordReset}
                      className="w-full flex items-center justify-between px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-750 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                      <div className="flex items-center">
                        <RefreshCw
                          size={16}
                          className="text-gray-700 dark:text-gray-300 mr-2"
                        />
                        <span className="text-sm text-gray-800 dark:text-white">
                          Reset Password
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Last changed: 45 days ago
                      </span>
                    </button>

                    {showPasswordResetSuccess && (
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-md text-sm flex items-center">
                        <Check size={16} className="mr-2" />
                        Password reset email sent!
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-900/30">
                <div className="flex items-start">
                  <Shield
                    size={20}
                    className="text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-white">
                      Security Tip
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      Use a strong, unique password and enable two-factor
                      authentication for the best protection. We recommend
                      changing your password every 90 days.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Your Data Tab */}
          {activeTab === "data" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Your Data
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-800 dark:text-white flex items-center">
                    <Database size={16} className="mr-2 text-blue-500" />
                    Data Storage
                  </h4>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    Your data is stored securely on our servers. We use
                    industry-standard encryption to protect your information.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <div className="px-3 py-1 bg-gray-100 dark:bg-gray-750 rounded-full text-xs text-gray-700 dark:text-gray-300">
                      Chat History: 24 MB
                    </div>
                    <div className="px-3 py-1 bg-gray-100 dark:bg-gray-750 rounded-full text-xs text-gray-700 dark:text-gray-300">
                      Profile Data: 2 MB
                    </div>
                    <div className="px-3 py-1 bg-gray-100 dark:bg-gray-750 rounded-full text-xs text-gray-700 dark:text-gray-300">
                      Settings: 1 MB
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors text-left">
                    <h4 className="font-medium text-gray-800 dark:text-white flex items-center">
                      <Database size={16} className="mr-2 text-green-500" />
                      Download Your Data
                    </h4>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      Get a copy of all your personal data in a machine-readable
                      format
                    </p>
                  </button>

                  <button className="p-4 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-900/30 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left">
                    <h4 className="font-medium text-gray-800 dark:text-white flex items-center">
                      <AlertTriangle size={16} className="mr-2 text-red-500" />
                      Delete Your Data
                    </h4>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      Permanently remove all your data from our servers
                    </p>
                  </button>
                </div>

                <div className="p-4 bg-gray-100 dark:bg-gray-750 rounded-lg">
                  <h4 className="font-medium text-gray-800 dark:text-white">
                    Data Retention
                  </h4>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    We retain your data for as long as your account is active or
                    as needed to provide you services. If you delete your
                    account, we will delete your data within 30 days.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-900/30">
                <div className="flex items-start">
                  <Shield
                    size={20}
                    className="text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-white">
                      Data Protection
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      We are committed to protecting your data and privacy. If
                      you have any questions about how we handle your data,
                      please contact our Data Protection Officer.
                    </p>
                    <a
                      href="#"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block"
                    >
                      Contact Data Protection Officer
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default PrivacySecurityModal;
