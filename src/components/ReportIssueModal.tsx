import Modal from "./Modal";
import { Check, ChevronDown, Paperclip, X } from "lucide-react";
import { useState, useRef } from "react";

type ReportIssueModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type IssueCategory = {
  id: string;
  label: string;
};

const ReportIssueModal = ({ isOpen, onClose }: ReportIssueModalProps) => {
  const [issueTitle, setIssueTitle] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState({
    title: "",
    description: "",
    category: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Issue categories
  const categories: IssueCategory[] = [
    { id: "bug", label: "Bug or Error" },
    { id: "feature", label: "Feature Request" },
    { id: "performance", label: "Performance Issue" },
    { id: "ui", label: "UI/UX Problem" },
    { id: "account", label: "Account Issue" },
    { id: "other", label: "Other" },
  ];

  // Get category label by id
  const getCategoryLabel = (id: string): string => {
    const category = categories.find((cat) => cat.id === id);
    return category ? category.label : "Select a category";
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments((prev) => [...prev, ...newFiles]);
    }
  };

  // Handle file removal
  const handleRemoveFile = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = () => {
    // Validate form
    const errors = {
      title: !issueTitle ? "Please enter a title" : "",
      description: !issueDescription ? "Please describe the issue" : "",
      category: !selectedCategory ? "Please select a category" : "",
    };

    setFormErrors(errors);

    // Check if there are any errors
    if (Object.values(errors).some((error) => error)) {
      return;
    }

    // Simulate form submission
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);

      // Reset form after 3 seconds
      setTimeout(() => {
        setIssueTitle("");
        setIssueDescription("");
        setSelectedCategory("");
        setAttachments([]);
        setIsSubmitted(false);
        onClose();
      }, 3000);
    }, 1500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Report an Issue"
      size="lg"
      hideFooter={true}
    >
      {!isSubmitted ? (
        <div className="space-y-6">
          <p className="text-gray-600 dark:text-gray-300">
            Please provide details about the issue you're experiencing. Our team
            will review your report and respond as soon as possible.
          </p>

          {/* Issue title */}
          <div>
            <label
              htmlFor="issue-title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Issue Title <span className="text-red-500">*</span>
            </label>
            <input
              id="issue-title"
              type="text"
              className={`w-full px-3 py-2 border ${
                formErrors.title
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Brief summary of the issue"
              value={issueTitle}
              onChange={(e) => setIssueTitle(e.target.value)}
            />
            {formErrors.title && (
              <p className="mt-1 text-sm text-red-500">{formErrors.title}</p>
            )}
          </div>

          {/* Issue category */}
          <div>
            <label
              htmlFor="issue-category"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Category <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <button
                type="button"
                className={`w-full flex items-center justify-between px-3 py-2 border ${
                  formErrors.category
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                } rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                onClick={() =>
                  setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                }
              >
                <span>
                  {selectedCategory
                    ? getCategoryLabel(selectedCategory)
                    : "Select a category"}
                </span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    isCategoryDropdownOpen ? "transform rotate-180" : ""
                  }`}
                />
              </button>

              {isCategoryDropdownOpen && (
                <div
                  ref={dropdownRef}
                  className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto"
                >
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white"
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setIsCategoryDropdownOpen(false);
                      }}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {formErrors.category && (
              <p className="mt-1 text-sm text-red-500">{formErrors.category}</p>
            )}
          </div>

          {/* Issue description */}
          <div>
            <label
              htmlFor="issue-description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="issue-description"
              className={`w-full px-3 py-2 border ${
                formErrors.description
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px]`}
              placeholder="Please provide detailed information about the issue, including steps to reproduce it if applicable."
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
            />
            {formErrors.description && (
              <p className="mt-1 text-sm text-red-500">
                {formErrors.description}
              </p>
            )}
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Attachments (Optional)
            </label>
            <div className="mt-1 flex items-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 flex items-center"
              >
                <Paperclip size={16} className="mr-2" />
                Add Files
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                Max 5 files (10MB each)
              </span>
            </div>

            {/* Attachment list */}
            {attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-750 rounded-md"
                  >
                    <div className="flex items-center">
                      <Paperclip
                        size={14}
                        className="text-gray-500 dark:text-gray-400 mr-2"
                      />
                      <span className="text-sm text-gray-800 dark:text-white truncate max-w-xs">
                        {file.name}
                      </span>
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Privacy notice */}
          <div className="p-3 bg-gray-100 dark:bg-gray-750 rounded-md">
            <p className="text-xs text-gray-600 dark:text-gray-300">
              By submitting this form, you agree that the information provided
              will be used to address your issue. We may collect system
              information to help diagnose the problem. See our{" "}
              <a
                href="#"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Privacy Policy
              </a>{" "}
              for more details.
            </p>
          </div>

          {/* Submit button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-4 py-2 ${
                isSubmitting
                  ? "bg-blue-400 dark:bg-blue-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
              } text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center`}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                "Submit Report"
              )}
            </button>
          </div>
        </div>
      ) : (
        // Success message
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
            <Check size={32} className="text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            Report Submitted Successfully
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Thank you for your report. Our team will review it and respond as
            soon as possible.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Reference ID: #REF-
            {Math.floor(Math.random() * 10000)
              .toString()
              .padStart(4, "0")}
          </p>
        </div>
      )}
    </Modal>
  );
};

export default ReportIssueModal;
