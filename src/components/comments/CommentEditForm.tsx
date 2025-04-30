
import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CommentEditFormProps {
  commentId: string;
  initialContent: string;
  onSave: (commentId: string, content: string) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
}

const CommentEditForm: React.FC<CommentEditFormProps> = ({ 
  commentId, 
  initialContent, 
  onSave, 
  onCancel 
}) => {
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (content.trim() === '') {
      setError("Comment cannot be empty");
      return;
    }
    
    if (content === initialContent) {
      onCancel(); // No changes made, just cancel
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await onSave(commentId, content);
      
      if (!result.success) {
        setError(result.error || "Failed to save comment");
        toast.error(result.error || "Failed to save comment");
      } else {
        toast.success("Comment updated successfully");
        onCancel(); // Close edit mode on success
      }
    } catch (err) {
      console.error("Error saving comment:", err);
      setError("An unexpected error occurred");
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Edit your comment..."
        className="min-h-[100px]"
        disabled={isSubmitting}
      />
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      
      <div className="flex justify-end gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          disabled={isSubmitting || content.trim() === ''}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
};

export default CommentEditForm;
