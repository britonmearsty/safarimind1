import Modal from "./Modal";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Camera,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useToast } from "../contexts/ToastContext";

type ProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const { showToast } = useToast();
  // State for profile data
  const [profileData, setProfileData] = useState({
    fullName: "User Name",
    email: "user@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    occupation: "Software Developer",
    dob: "1990-01-01",
    bio: "I'm a software developer passionate about creating intuitive user experiences and solving complex problems with elegant solutions.",
  });

  // State for profile picture
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle profile picture change
  const handleProfilePictureChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePicture(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Save profile data
  const saveProfile = () => {
    // In a real app, you would send this data to a server
    localStorage.setItem("profileData", JSON.stringify(profileData));
    localStorage.setItem("profilePicture", profilePicture || "");
    showToast(
      "Your profile has been successfully updated! You can now chat with AI.",
      "success"
    );
    onClose();
  };

  // Load profile data from localStorage on component mount
  useEffect(() => {
    const savedProfileData = localStorage.getItem("profileData");
    if (savedProfileData) {
      setProfileData(JSON.parse(savedProfileData));
    }

    const savedProfilePicture = localStorage.getItem("profilePicture");
    if (savedProfilePicture) {
      setProfilePicture(savedProfilePicture);
    }
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Profile"
      size="lg"
      onSave={saveProfile}
    >
      <div className="space-y-6">
        {/* Profile header with avatar */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center relative overflow-hidden group profile-picture">
            {profilePicture ? (
              <img
                src={profilePicture}
                alt="Profile"
                className="w-full h-full object-cover profile-exempt"
              />
            ) : (
              <User size={40} className="text-white profile-exempt" />
            )}
            <div
              className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 cursor-pointer"
              onClick={triggerFileInput}
            >
              <Camera size={24} className="text-white" />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleProfilePictureChange}
            />
          </div>
          <div className="text-center sm:text-left profile-exempt">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white profile-exempt">
              {profileData.fullName}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 profile-exempt">
              AI Chat User
            </p>
            <button
              className="mt-2 px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-900 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-md transition-colors"
              onClick={triggerFileInput}
            >
              Change Profile Picture
            </button>
          </div>
        </div>

        {/* Personal Information */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Personal Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden dark:bg-gray-800">
                  <span className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-r-lg ">
                    <User
                      size={16}
                      className="text-gray-500 dark:text-gray-400 rounded-r-xl"
                    />
                  </span>
                  <input
                    type="text"
                    name="fullName"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={profileData.fullName}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden dark:bg-gray-800">
                  <span className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-r-lg">
                    <Mail
                      size={16}
                      className="text-gray-500 dark:text-gray-400"
                    />
                  </span>
                  <input
                    type="email"
                    name="email"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={profileData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden dark:bg-gray-800">
                  <span className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-r-lg">
                    <Phone
                      size={16}
                      className="text-gray-500 dark:text-gray-400"
                    />
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={profileData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location
                </label>
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden dark:bg-gray-800">
                  <span className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-r-lg">
                    <MapPin
                      size={16}
                      className="text-gray-500 dark:text-gray-400"
                    />
                  </span>
                  <input
                    type="text"
                    name="location"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={profileData.location}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Occupation
                </label>
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden dark:bg-gray-800">
                  <span className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-r-lg">
                    <Briefcase
                      size={16}
                      className="text-gray-500 dark:text-gray-400"
                    />
                  </span>
                  <input
                    type="text"
                    name="occupation"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={profileData.occupation}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date of Birth
                </label>
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden dark:bg-gray-800">
                  <span className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-r-lg">
                    <Calendar
                      size={16}
                      className="text-gray-500 dark:text-gray-400"
                    />
                  </span>
                  <input
                    type="date"
                    name="dob"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={profileData.dob}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Bio
          </label>
          <textarea
            name="bio"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            value={profileData.bio}
            onChange={handleInputChange}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ProfileModal;
