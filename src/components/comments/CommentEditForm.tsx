
import React, { useState } from "react";
import MarkdownEditor from "../article/MarkdownEditor";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CommentEditFormProps {
  initialContent: string;
  onCancel: () => void;
  onUpdate: (content: string) => void;
  onDelete: () => void;
}

const CommentEditForm = ({ initialContent, onCancel, onUpdate, onDelete }: CommentEditFormProps) => {
  const [content, setContent] = useState(initialContent);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(content);
  };
  
  const handleDelete = () => {
    setShowDeleteDialog(false);
    onDelete();
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <MarkdownEditor
            value={content}
            onChange={(val) => setContent(val || "")}
            height={150}
            placeholder="Edit your comment..."
            showPreview={false}
          />
        </div>
        
        <div className="flex justify-between gap-2">
          <Button 
            type="button" 
            variant="destructive" 
            onClick={() => setShowDeleteDialog(true)}
          >
            Delete
          </Button>
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button type="submit">
              Update
            </Button>
          </div>
        </div>
      </form>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your comment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CommentEditForm;
