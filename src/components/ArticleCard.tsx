
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Article } from "@/lib/types";
import KeywordBadge from "./KeywordBadge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState, useEffect } from "react";
import { MessageSquare, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import CommentDialog from "./CommentDialog";
import { supabase } from "@/integrations/supabase/client";

interface ArticleCardProps {
  article: Article;
}

const ArticleCard = ({ article }: ArticleCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchCommentCount = async () => {
      try {
        const { count, error } = await supabase
          .from("comments")
          .select("*", { count: 'exact', head: true })
          .eq("article_id", article.id);
        
        if (error) {
          console.error("Error fetching comment count:", error);
          return;
        }
        
        setCommentCount(count || 0);
      } catch (error) {
        console.error("Error in fetchCommentCount:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCommentCount();
  }, [article.id]);
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getImageUrl = (url: string) => {
    // Check if it's a Google Drive URL
    if (url.includes('drive.google.com/file/d/')) {
      // Extract the file ID from the URL
      const fileIdMatch = url.match(/\/d\/([^/]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
        const fileId = fileIdMatch[1];
        // Return the direct image URL format for Google Drive
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
      }
    }
    // Return the original URL for non-Google Drive images
    return url;
  };

  // Custom renderers for ReactMarkdown to handle links properly
  const customRenderers = {
    // Customize link rendering to use proper attributes and prevent dropdown issues
    a: ({ node, ...props }: any) => (
      <a 
        {...props} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-primary hover:underline"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          window.open(props.href, '_blank', 'noopener,noreferrer');
        }}
      />
    ),
    // Keep paragraphs contained
    p: ({ node, ...props }: any) => <p className="markdown-paragraph" {...props} />,
    // Remove margins from headings in card titles
    h1: ({ node, ...props }: any) => <h1 className="m-0 p-0 text-xl font-semibold" {...props} />,
    h2: ({ node, ...props }: any) => <h2 className="m-0 p-0 text-xl font-semibold" {...props} />,
    h3: ({ node, ...props }: any) => <h3 className="m-0 p-0 text-xl font-semibold" {...props} />,
    h4: ({ node, ...props }: any) => <h4 className="m-0 p-0 text-xl font-semibold" {...props} />,
    h5: ({ node, ...props }: any) => <h5 className="m-0 p-0 text-xl font-semibold" {...props} />,
    h6: ({ node, ...props }: any) => <h6 className="m-0 p-0 text-xl font-semibold" {...props} />,
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="p-0">
        <Link to={`/article/${article.id}`}>
          <AspectRatio ratio={16 / 9} className="overflow-hidden bg-muted/20">
            <img 
              src={getImageUrl(article.imageUrl)} 
              alt={article.title} 
              className="w-full h-full object-contain"
              loading="lazy"
            />
          </AspectRatio>
        </Link>
      </CardHeader>
      <CardContent className="flex-grow pt-6">
        <Link to={`/article/${article.id}`}>
          <div className="line-clamp-2 hover:text-primary transition-colors mb-2 prose-sm prose">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={customRenderers}
            >
              {article.title}
            </ReactMarkdown>
          </div>
        </Link>
        <p className="text-muted-foreground text-sm mb-2">By {article.author} • {formatDate(article.createdAt)}</p>
        <div className="text-muted-foreground mb-4 line-clamp-3 prose prose-sm max-w-none markdown-wrapper">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={customRenderers}
          >
            {article.description}
          </ReactMarkdown>
        </div>
        
        <div className="mt-4 mb-3 flex justify-between items-center">
          {article.sourceUrl && (
            <a 
              href={article.sourceUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 flex items-center gap-1 text-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-4 w-4" />
              Go to the article
            </a>
          )}
          <div className="flex-grow"></div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex flex-wrap gap-2">
            {article.keywords.map((keyword, index) => (
              <KeywordBadge key={index} keyword={keyword} />
            ))}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowComments(true);
            }}
            className="flex items-center gap-1 text-xs"
          >
            <MessageSquare className="h-4 w-4" />
            {commentCount > 0 ? (
              <>Comments {commentCount}</>
            ) : (
              <>Comments</>
            )}
          </Button>
        </div>
        
        {showComments && (
          <CommentDialog 
            articleId={article.id} 
            articleTitle={article.title}
            isOpen={showComments}
            onClose={() => setShowComments(false)}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ArticleCard;

