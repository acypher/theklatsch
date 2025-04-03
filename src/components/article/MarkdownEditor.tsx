
import { useState, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';

interface MarkdownEditorProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
}

const MarkdownEditor = ({ value, onChange, placeholder }: MarkdownEditorProps) => {
  // Need to prevent hydration issues with SSR
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="border rounded-md h-64 p-4 bg-background">
        Loading editor...
      </div>
    );
  }

  return (
    <div data-color-mode="light" className="markdown-editor">
      <MDEditor
        value={value || ''}
        onChange={onChange}
        height={400}
        preview="edit"
        textareaProps={{
          placeholder: placeholder || 'Write your content here...'
        }}
      />
      <style>{`
        .w-md-editor {
          --md-editor-box-shadow: none !important;
          border: 1px solid var(--md-border-color) !important;
          border-radius: 0.375rem !important;
        }
        .w-md-editor-toolbar {
          border-bottom: 1px solid var(--md-border-color) !important;
        }
      `}</style>
    </div>
  );
};

export default MarkdownEditor;
