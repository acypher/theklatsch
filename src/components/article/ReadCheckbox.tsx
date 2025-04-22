
import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface ReadCheckboxProps {
  articleId: string;
  initialState?: boolean;
  className?: string;
}

const ReadCheckbox = ({ articleId, initialState = false, className = "" }: ReadCheckboxProps) => {
  const [isChecked, setIsChecked] = useState(() => {
    const savedState = localStorage.getItem(`article-${articleId}-read`);
    return savedState ? JSON.parse(savedState) : initialState;
  });

  useEffect(() => {
    localStorage.setItem(`article-${articleId}-read`, JSON.stringify(isChecked));
  }, [isChecked, articleId]);

  return (
    <div className={`absolute top-2 right-2 z-10 bg-background/90 rounded-md p-1 ${className}`}>
      <Checkbox
        id={`read-checkbox-${articleId}`}
        checked={isChecked}
        onCheckedChange={(checked) => setIsChecked(checked)}
        aria-label="Mark as read"
      />
    </div>
  );
};

export default ReadCheckbox;

