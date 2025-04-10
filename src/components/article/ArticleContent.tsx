
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ArticleContentProps {
  description: string;
  moreContent?: string | null;
  sourceUrl?: string | null;
}

const ArticleContent = ({ description, moreContent, sourceUrl }: ArticleContentProps) => {
  const navigate = useNavigate();
  
  // Markdown component renderer customization
  const customRenderers = {
    // Customize link rendering to use proper attributes and prevent dropdown issues
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
  
  return (
    <>
      <div className="prose prose-lg max-w-none mb-8">
        <div className="markdown-wrapper text-xl leading-relaxed mb-8">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]} 
            components={customRenderers}
          >
            {description}
          </ReactMarkdown>
        </div>
        
        {moreContent && (
          <div className="mt-8 pt-8 border-t">
            <h2 className="text-2xl font-bold mb-4">More Information</h2>
            <div className="prose prose-lg max-w-none markdown-wrapper">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]} 
                components={customRenderers}
              >
                {moreContent}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-12 space-y-4">
        {sourceUrl && (
          <Button
            variant="outline"
            className="w-full sm:w-auto flex items-center justify-center gap-2"
            onClick={() => window.open(sourceUrl, '_blank', 'noopener,noreferrer')}
          >
            <ExternalLink size={16} />
            Go to the article
          </Button>
        )}
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/")}
          className="w-full sm:w-auto flex items-center justify-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to articles
        </Button>
      </div>
    </>
  );
};

export default ArticleContent;
