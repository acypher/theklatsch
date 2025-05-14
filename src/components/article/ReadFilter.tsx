
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
      className="flex items-center gap-2 text-xs"
    >
      <Filter size={16} />
      {enabled ? "Showing unread" : "Show all"}
    </Button>
  );
};

export default ReadFilter;
