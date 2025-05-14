
import { Button } from "@/components/ui/button";

interface ReadFilterProps {
  enabled: boolean;
  onToggle: (checked: boolean) => void;
}

const ReadFilter = ({ enabled, onToggle }: ReadFilterProps) => {
  return (
    <Button
      variant={enabled ? "default" : "outline"}
      size="sm"
      onClick={() => onToggle(!enabled)}
      className="text-xs"
    >
      {enabled ? "Showing unread" : "Showing all"}
    </Button>
  );
};

export default ReadFilter;
