
import { useState, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

  // Custom renderers for ReactMarkdown to handle links properly
  const customRenderers = {
    // Customize link rendering to use proper attributes
    a: ({ node, ...props }: any) => (
      <a 
        {...props} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-primary hover:underline"
        onClick={(e) => e.stopPropagation()}
      />
    ),
    // Ensure paragraphs don't interfere with other UI components
    p: ({ node, ...props }: any) => <p className="markdown-paragraph" {...props} />,
  };

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
      {value && (
        <div className="mt-4 prose prose-lg max-w-none markdown-preview">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]} 
            components={customRenderers}
          >
            {value}
          </ReactMarkdown>
        </div>
      )}
      <style>{`
        .w-md-editor {
          --md-editor-box-shadow: none !important;
          border: 1px solid var(--md-border-color) !important;
          border-radius: 0.375rem !important;
        }
        .w-md-editor-toolbar {
          border-bottom: 1px solid var(--md-border-color) !important;
        }
        .markdown-preview a {
          color: var(--primary);
          text-decoration: none;
          word-break: break-word;
        }
        .markdown-preview a:hover {
          text-decoration: underline;
        }
        .markdown-paragraph {
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
};

export default MarkdownEditor;
