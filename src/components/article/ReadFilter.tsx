
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

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
      {enabled && <Filter size={16} className="mr-1" />}
      {enabled ? "Showing unread" : "Showing all"}
    </Button>
  );
};

export default ReadFilter;
