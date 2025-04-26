
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ReadFilterProps {
  enabled: boolean;
  onToggle: (checked: boolean) => void;
}

const ReadFilter = ({ enabled, onToggle }: ReadFilterProps) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="read-filter"
          checked={enabled}
          onCheckedChange={(checked) => {
            if (typeof checked === 'boolean') {
              console.log('Toggling read filter to:', checked);
              onToggle(checked);
            }
          }}
        />
        <Label 
          htmlFor="read-filter" 
          className="text-sm text-muted-foreground cursor-pointer"
        >
          Filter articles already read
        </Label>
      </div>
    </div>
  );
};

export default ReadFilter;
