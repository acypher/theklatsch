
import { Checkbox } from "@/components/ui/checkbox";
import { useArticleReads } from "@/hooks/useArticleReads";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

interface ReadCheckboxProps {
  articleId: string;
  onReadStateChange?: (isRead: boolean) => void;
}

const ReadCheckbox = ({ articleId, onReadStateChange }: ReadCheckboxProps) => {
  const { isAuthenticated } = useAuth();
  const { isRead, loading, toggleReadState } = useArticleReads(articleId);
  
  useEffect(() => {
    // When the read state changes, notify the parent component
    if (onReadStateChange) {
      onReadStateChange(isRead);
    }
  }, [isRead, onReadStateChange]);

  if (!isAuthenticated) return null;

  return (
    <div className="absolute top-2 right-2 z-10 w-4 h-4 flex items-center justify-center">
      <Checkbox 
        checked={isRead}
        disabled={loading}
        onCheckedChange={(checked) => {
          if (typeof checked === 'boolean') {
            toggleReadState();
          }
        }}
      />
    </div>
  );
};

export default ReadCheckbox;
