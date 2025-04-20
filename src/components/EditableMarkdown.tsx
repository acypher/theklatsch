
import { useState } from 'react';
import { Pencil } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MarkdownEditor from './article/MarkdownEditor';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface EditableMarkdownProps {
  content: string;
  onSave: (content: string) => Promise<void>;
  placeholder?: string;
}

const EditableMarkdown = ({ content, onSave, placeholder = 'Add recommendations here...' }: EditableMarkdownProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [isSaving, setIsSaving] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(editContent);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving content:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!content && !isAuthenticated) {
    return null;
  }

  return (
    <div className="relative pt-4 border-t border-border">
      {isAuthenticated && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-4 right-0 h-6 w-6" 
                onClick={() => {
                  setEditContent(content);
                  setIsEditing(true);
                }}
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit recommendations</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit recommendations</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {content ? (
        <div className="prose prose-sm max-w-none pr-8">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>
      ) : isAuthenticated ? (
        <p className="text-sm text-muted-foreground italic">
          {placeholder}
        </p>
      ) : null}

      <Dialog open={isEditing} onOpenChange={(open) => !isSaving && setIsEditing(open)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Recommendations</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <MarkdownEditor 
              value={editContent} 
              onChange={setEditContent} 
              placeholder={placeholder}
              height={200}
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)} 
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditableMarkdown;
