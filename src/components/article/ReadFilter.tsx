
import { Switch } from "@/components/ui/switch";

interface ReadFilterProps {
  enabled: boolean;
  onToggle: (checked: boolean) => void;
}

const ReadFilter = ({ enabled, onToggle }: ReadFilterProps) => {
  return (
    <div className="flex items-center gap-2">
      <Switch
        id="read-filter"
        checked={enabled}
        onCheckedChange={onToggle}
      />
      <label 
        htmlFor="read-filter" 
        className="text-sm text-muted-foreground cursor-pointer"
      >
        Filter articles already read
      </label>
    </div>
  );
};

export default ReadFilter;
