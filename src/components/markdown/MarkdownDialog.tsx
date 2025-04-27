
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import MarkdownEditor from "@/components/article/MarkdownEditor";

interface MarkdownDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  content: string;
  onSave: () => void;
  onChange: (value: string | undefined) => void;
  isSaving: boolean;
  placeholder?: string;
}

const MarkdownDialog = ({ 
  isOpen, 
  onOpenChange, 
  content, 
  onSave, 
  onChange, 
  isSaving,
  placeholder 
}: MarkdownDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSaving && onOpenChange(open)}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Recommendations</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <MarkdownEditor 
            value={content} 
            onChange={onChange} 
            placeholder={placeholder}
            height={200}
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button 
              onClick={onSave} 
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MarkdownDialog;
