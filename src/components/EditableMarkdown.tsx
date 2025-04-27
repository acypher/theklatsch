
import { useState } from 'react';
import { Pencil } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { useAuth } from '@/contexts/AuthContext';
import MarkdownDialog from './markdown/MarkdownDialog';

interface EditableMarkdownProps {
  content: string;
  onSave: (content: string) => Promise<void>;
  placeholder?: string;
  disabled?: boolean;
}

const EditableMarkdown = ({ 
  content, 
  onSave, 
  placeholder = 'Add recommendations here...', 
  disabled = false 
}: EditableMarkdownProps) => {
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
      {isAuthenticated && !disabled && (
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

      <MarkdownDialog 
        isOpen={isEditing}
        onOpenChange={setIsEditing}
        content={editContent}
        onSave={handleSave}
        onChange={setEditContent}
        isSaving={isSaving}
        placeholder={placeholder}
      />
    </div>
  );
};

export default EditableMarkdown;
