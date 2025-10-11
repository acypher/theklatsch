
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import KeywordBadge from "../KeywordBadge";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Article } from "@/lib/types";

interface ArticleHeaderProps {
  article: Article;
  isAuthenticated: boolean;
  onDeleteClick: () => void;
  formatDate: (dateString: string) => string;
}

const ArticleHeader = ({ 
  article, 
  isAuthenticated, 
  onDeleteClick,
  formatDate
}: ArticleHeaderProps) => {
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
    <div className="mb-8">
      <div className="flex justify-between items-start mb-4">
        <h1 className={`text-3xl md:text-4xl font-bold prose prose-headings ${article.private ? 'border border-red-600 p-2 rounded' : ''}`}>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={customRenderers}>
            {article.title}
          </ReactMarkdown>
        </h1>
        
        {isAuthenticated && (
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(`/article/${article.id}/edit`)}
            >
              <Pencil size={16} className="mr-2" />
              Edit
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="text-destructive border-destructive hover:bg-destructive/10"
              onClick={onDeleteClick}
            >
              <Trash2 size={16} className="mr-2" />
              Delete
            </Button>
          </div>
        )}
      </div>
      
      <div className="flex flex-wrap items-center text-muted-foreground mb-6">
        <span className="font-medium text-foreground">{article.author}</span>
        <span className="mx-2">•</span>
        <span>{formatDate(article.createdAt)}</span>
      </div>
      
      <div className="mb-6 flex flex-wrap gap-2">
        {article.keywords.map((keyword, index) => (
          <KeywordBadge 
            key={index} 
            keyword={keyword} 
            onClick={() => navigate(`/?keyword=${encodeURIComponent(keyword)}`)} 
          />
        ))}
      </div>
    </div>
  );
};

export default ArticleHeader;
