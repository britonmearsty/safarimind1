import React from "react";
import Toast, { ToastProps } from "./Toast";

interface ToastContainerProps {
  toasts: ToastProps[];
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top-center"
    | "bottom-center";
}

const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  position = "top-right",
}) => {
  const getPositionClasses = () => {
    switch (position) {
      case "top-left":
        return "top-0 left-0";
      case "top-center":
        return "top-0 left-1/2 transform -translate-x-1/2";
      case "top-right":
        return "top-0 right-0";
      case "bottom-left":
        return "bottom-0 left-0";
      case "bottom-center":
        return "bottom-0 left-1/2 transform -translate-x-1/2";
      case "bottom-right":
        return "bottom-0 right-0";
      default:
        return "top-0 right-0";
    }
  };

  return (
    <div
      className={`fixed z-50 p-4 max-h-screen overflow-hidden pointer-events-none ${getPositionClasses()}`}
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex flex-col space-y-2 w-full max-w-md">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast {...toast} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;
