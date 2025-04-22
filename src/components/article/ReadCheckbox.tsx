
import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface ReadCheckboxProps {
  articleId: string;
  initialState?: boolean;
  className?: string;
}

const ReadCheckbox = ({ articleId, initialState = false, className = "" }: ReadCheckboxProps) => {
  const [isChecked, setIsChecked] = useState(initialState);

  useEffect(() => {
    setIsChecked(initialState);
  }, [initialState]);

  return (
    <div className={`absolute top-2 right-2 z-10 bg-background/90 rounded-md p-1 ${className}`}>
      <Checkbox
        id={`read-checkbox-${articleId}`}
        checked={isChecked}
        onCheckedChange={(checked) => setIsChecked(checked as boolean)}
        aria-label="Mark as read"
      />
    </div>
  );
};

export default ReadCheckbox;
