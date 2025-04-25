
import { toast as sonnerToast } from "sonner";

// Since sonner doesn't export useToast, we'll create our own implementation
// that's compatible with our existing code
export const toast = sonnerToast;

export type ToastProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
};

// Create a simple hook that returns the toast function for compatibility
export const useToast = () => {
  return {
    toast: sonnerToast
  };
};
