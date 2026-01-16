
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DraftManagerProps {
  storageKey: string;
  clearDraft: () => void;
}

const DraftManager = ({ storageKey, clearDraft }: DraftManagerProps) => {
  const handleClearDraft = () => {
    if (confirm("Are you sure you want to clear your draft?")) {
      clearDraft();
      toast.success("Draft cleared successfully");
    }
  };
  
  return (
    <div className="flex justify-end">
      <Button 
        type="button" 
        variant="outline" 
        onClick={handleClearDraft}
        className="text-sm"
      >
        Clear
      </Button>
    </div>
  );
};

export default DraftManager;
