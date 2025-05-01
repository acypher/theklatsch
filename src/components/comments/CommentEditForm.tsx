
import React, { useState } from "react";
import MarkdownEditor from "../article/MarkdownEditor";
import { Button } from "@/components/ui/button";

interface CommentEditFormProps {
  initialContent: string;
  onCancel: () => void;
  onUpdate: (content: string) => void;
}

const CommentEditForm = ({ initialContent, onCancel, onUpdate }: CommentEditFormProps) => {
  const [content, setContent] = useState(initialContent);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(content);
  };

  return (
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
      
      <div className="flex justify-end gap-2">
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
    </form>
  );
};

export default CommentEditForm;
