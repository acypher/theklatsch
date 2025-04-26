
import { Checkbox } from "@/components/ui/checkbox";

interface ReadFilterProps {
  enabled: boolean;
  onToggle: (checked: boolean) => void;
}

const ReadFilter = ({ enabled, onToggle }: ReadFilterProps) => {
  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id="read-filter"
        checked={enabled}
        onCheckedChange={(checked) => {
          if (typeof checked === 'boolean') {
            onToggle(checked);
          }
        }}
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
