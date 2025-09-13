import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Article } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MarkdownEditor from "./MarkdownEditor";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface SummaryDialogProps {
  article: Article;
  isOpen: boolean;
  onClose: () => void;
  onSummaryUpdate?: (updatedSummary: string) => void;
}

const SummaryDialog = ({ article, isOpen, onClose, onSummaryUpdate }: SummaryDialogProps) => {
  const { isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedSummary, setEditedSummary] = useState(article.summary || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = () => {
    setEditedSummary(article.summary || "");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedSummary(article.summary || "");
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('articles')
        .update({ summary: editedSummary })
        .eq('id', article.id);

      if (error) {
        throw error;
      }

      onSummaryUpdate?.(editedSummary);
      setIsEditing(false);
      toast.success("Summary updated successfully");
    } catch (error) {
      console.error("Error updating summary:", error);
      toast.error("Failed to update summary");
    } finally {
      setIsSaving(false);
    }
  };

  const customRenderers = {
    a: ({ node, ...props }: any) => (
      <span 
        className="text-primary hover:underline cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          window.open(props.href, '_blank', 'noopener,noreferrer');
        }}
      >
        {props.children}
      </span>
    ),
    p: ({ node, ...props }: any) => <p className="mb-2" {...props} />,
    h1: ({ node, ...props }: any) => <h1 className="text-xl font-semibold mb-2" {...props} />,
    h2: ({ node, ...props }: any) => <h2 className="text-lg font-semibold mb-2" {...props} />,
    h3: ({ node, ...props }: any) => <h3 className="text-base font-semibold mb-2" {...props} />,
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Article Summary</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground font-medium">
            {article.title}
          </div>
          
          {isEditing ? (
            <div className="space-y-4">
              <MarkdownEditor
                value={editedSummary}
                onChange={(value) => setEditedSummary(value || "")}
                placeholder="Enter article summary..."
                height={300}
              />
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
                <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {article.summary ? (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={customRenderers}
                  >
                    {article.summary}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="text-muted-foreground italic">
                  No summary available for this article.
                </div>
              )}
              
              {isAuthenticated && (
                <Button onClick={handleEdit} variant="outline" size="sm">
                  {article.summary ? "Edit Summary" : "Add Summary"}
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SummaryDialog;