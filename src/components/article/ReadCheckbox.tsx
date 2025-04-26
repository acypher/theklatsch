
import { Checkbox } from "@/components/ui/checkbox";
import { useArticleReads } from "@/hooks/useArticleReads";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useRef } from "react";

interface ReadCheckboxProps {
  articleId: string;
  onReadStateChange?: (isRead: boolean) => void;
}

const ReadCheckbox = ({ articleId, onReadStateChange }: ReadCheckboxProps) => {
  const { isAuthenticated } = useAuth();
  const { isRead, loading, toggleReadState } = useArticleReads(articleId);
  const prevIsRead = useRef<boolean | null>(null);
  const initialRender = useRef(true);
  
  useEffect(() => {
    // Skip the initial render to avoid unnecessary notifications
    if (initialRender.current) {
      prevIsRead.current = isRead;
      initialRender.current = false;
      return;
    }

    // When the read state changes and it's different from previous, notify the parent component
    if (onReadStateChange && prevIsRead.current !== isRead) {
      onReadStateChange(isRead);
      prevIsRead.current = isRead;
    }
  }, [isRead, onReadStateChange]);

  if (!isAuthenticated) return null;

  return (
    <div className="absolute top-2 right-2 z-10 w-4 h-4 flex items-center justify-center">
      <Checkbox 
        checked={isRead}
        disabled={loading}
        onCheckedChange={() => toggleReadState()}
      />
    </div>
  );
};

export default ReadCheckbox;
