
import { Checkbox } from "@/components/ui/checkbox";

interface ReadCheckboxProps {
  isRead: boolean;
  onChange: () => void;
  className?: string;
}

const ReadCheckbox = ({ isRead, onChange, className = "" }: ReadCheckboxProps) => {
  return (
    <div className={`absolute top-2 right-2 z-10 bg-background/90 rounded-md p-1 ${className}`}>
      <Checkbox
        id={`read-checkbox-${Math.random().toString(36).substr(2, 9)}`}
        checked={isRead}
        onCheckedChange={onChange}
        aria-label="Mark as read"
      />
    </div>
  );
};

export default ReadCheckbox;
