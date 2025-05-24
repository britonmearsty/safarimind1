import { useState } from "react";
import Modal from "./Modal";
import { useToast } from "../contexts/ToastContext";
import { ThumbsDown, Check } from "lucide-react";

type FeedbackDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  messageId: string | null;
};

const FeedbackDialog = ({
  isOpen,
  onClose,
  messageId,
}: FeedbackDialogProps) => {
  const { showToast } = useToast();
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>("");

  const feedbackReasons = [
    "Incorrect information",
    "Unhelpful response",
    "Inappropriate content",
    "Confusing or unclear",
    "Too verbose",
    "Other issue",
  ];

  const handleSubmit = () => {
    if (!selectedReason) {
      showToast("Please select a reason for your feedback", "error");
      return;
    }

    setIsSubmitting(true);

    // Simulate sending feedback to a server
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);

      // Show success message and close after delay
      setTimeout(() => {
        showToast("Thank you for your feedback!", "success");
        setFeedbackText("");
        setSelectedReason("");
        setIsSubmitted(false);
        onClose();
      }, 2000);
    }, 1000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Provide Feedback"
      size="md"
      hideFooter={true}
    >
      {!isSubmitted ? (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            We're sorry that response wasn't helpful. Please let us know why so
            we can improve.
          </p>

          {/* Feedback reason selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              What was the issue with this response?{" "}
              <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {feedbackReasons.map((reason) => (
                <div key={reason} className="flex items-center">
                  <input
                    type="radio"
                    id={`reason-${reason}`}
                    name="feedback-reason"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                  />
                  <label
                    htmlFor={`reason-${reason}`}
                    className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                  >
                    {reason}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Additional comments */}
          <div>
            <label
              htmlFor="feedback-text"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Additional comments (optional)
            </label>
            <textarea
              id="feedback-text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              placeholder="Please provide any additional details about the issue..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
            />
          </div>

          {/* Submit button */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
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
                "Submit Feedback"
              )}
            </button>
          </div>
        </div>
      ) : (
        // Success message
        <div className="text-center py-6">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
            <Check size={32} className="text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            Feedback Submitted
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Thank you for helping us improve our responses.
          </p>
        </div>
      )}
    </Modal>
  );
};

export default FeedbackDialog;
