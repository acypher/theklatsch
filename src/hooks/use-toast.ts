
import { toast as sonnerToast, useToast as useSonnerToast } from "sonner";

export const useToast = useSonnerToast;
export const toast = sonnerToast;

export type ToastProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
};
