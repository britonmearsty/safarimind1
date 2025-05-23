import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { v4 as uuidv4 } from "uuid";
import ToastContainer from "../components/ToastContainer";
import { ToastProps, ToastType } from "../components/Toast";

interface ToastContextType {
  showToast: (message: string, type: ToastType, duration?: number) => string;
  hideToast: (id: string) => void;
  hideAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top-center"
    | "bottom-center";
  maxToasts?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = "top-right",
  maxToasts = 5,
}) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const showToast = useCallback(
    (message: string, type: ToastType, duration = 5000) => {
      const id = uuidv4();

      setToasts((prevToasts) => {
        // If we have more than maxToasts, remove the oldest ones
        const updatedToasts = [...prevToasts];
        if (updatedToasts.length >= maxToasts) {
          updatedToasts.splice(0, updatedToasts.length - maxToasts + 1);
        }

        return [
          ...updatedToasts,
          { id, message, type, duration, onClose: hideToast },
        ];
      });

      return id;
    },
    [maxToasts]
  );

  const hideToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const hideAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast, hideAllToasts }}>
      {children}
      <ToastContainer toasts={toasts} position={position} />
    </ToastContext.Provider>
  );
};

export default ToastContext;
