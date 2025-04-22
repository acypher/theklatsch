
import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface ReadCheckboxProps {
  articleId: string;
  initialState?: boolean;
  className?: string;
  onCheckedChange?: (checked: boolean) => void;
}

const ReadCheckbox = ({ 
  articleId, 
  initialState = false, 
  className = "",
  onCheckedChange 
}: ReadCheckboxProps) => {
  const [isChecked, setIsChecked] = useState(initialState);

  useEffect(() => {
    setIsChecked(initialState);
  }, [initialState]);

  const handleChange = (checked: boolean) => {
    setIsChecked(checked);
    if (onCheckedChange) {
      onCheckedChange(checked);
    }
  };

  return (
    <div className={`absolute top-2 right-2 z-10 bg-background/90 rounded-md p-1 ${className}`}>
      <Checkbox
        id={`read-checkbox-${articleId}`}
        checked={isChecked}
        onCheckedChange={(checked) => handleChange(checked as boolean)}
        aria-label="Mark as read"
      />
    </div>
  );
};

export default ReadCheckbox;
