import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Article } from "@/lib/types";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState, useEffect } from "react";
import CommentDialog from "./CommentDialog";
import { supabase } from "@/integrations/supabase/client";
import ArticleCardHeader from "./article/ArticleCardHeader";
import ArticleCardMeta from "./article/ArticleCardMeta";
import ArticleCardFooter from "./article/ArticleCardFooter";
import ReadCheckbox from './article/ReadCheckbox';

interface ArticleCardProps {
  article: Article;
  onReadStateChange?: (isRead: boolean) => void;
}

const ArticleCard = ({ article, onReadStateChange }: ArticleCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const isGif = article.imageUrl.toLowerCase().endsWith('.gif');
  
  useEffect(() => {
    const fetchCommentCount = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timed out')), 8000)
        );
        
        const fetchPromise = supabase
          .from("comments")
          .select("*", { count: 'exact', head: true })
          .eq("article_id", article.id);
        
        const { count, error } = await Promise.race([
          fetchPromise,
          timeoutPromise.then(() => { throw new Error('Request timed out'); })
        ]) as any;
        
        if (error) {
          throw error;
        }
        
        setCommentCount(count || 0);
      } catch (error) {
        console.error("Error fetching comment count:", error);
        setHasError(true);
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
    if (url.includes('drive.google.com/file/d/')) {
      const fileIdMatch = url.match(/\/d\/([^/]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
        const fileId = fileIdMatch[1];
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
      }
    }
    return url;
  };

  const customRenderers = {
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
    p: ({ node, ...props }: any) => <p className="markdown-paragraph" {...props} />,
    h1: ({ node, ...props }: any) => <h1 className="m-0 p-0 text-xl font-semibold" {...props} />,
    h2: ({ node, ...props }: any) => <h2 className="m-0 p-0 text-xl font-semibold" {...props} />,
    h3: ({ node, ...props }: any) => <h3 className="m-0 p-0 text-xl font-semibold" {...props} />,
    h4: ({ node, ...props }: any) => <h4 className="m-0 p-0 text-xl font-semibold" {...props} />,
    h5: ({ node, ...props }: any) => <h5 className="m-0 p-0 text-xl font-semibold" {...props} />,
    h6: ({ node, ...props }: any) => <h6 className="m-0 p-0 text-xl font-semibold" {...props} />,
  };

  const handleReadStateChange = (isRead: boolean) => {
    if (onReadStateChange) {
      onReadStateChange(isRead);
    }
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow article-card relative" data-article-id={article.id}>
      <ReadCheckbox articleId={article.id} onReadStateChange={handleReadStateChange} />
      
      <CardHeader className="p-0">
        <ArticleCardHeader 
          articleId={article.id}
          imageUrl={article.imageUrl}
          title={article.title}
          isGif={isGif}
          getImageUrl={getImageUrl}
        />
      </CardHeader>
      <CardContent className="flex-grow pt-6">
        <Link to={`/article/${article.id}`} className="block">
          <div className="line-clamp-2 hover:text-primary transition-colors mb-2 prose-sm prose">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={customRenderers}
            >
              {article.title}
            </ReactMarkdown>
          </div>
        </Link>
        <ArticleCardMeta 
          author={article.author}
          createdAt={article.createdAt}
          sourceUrl={article.sourceUrl}
          isGif={isGif}
          formatDate={formatDate}
        />
        <Link to={`/article/${article.id}`} className="block">
          <div className="text-muted-foreground mb-4 line-clamp-3 prose prose-sm max-w-none markdown-wrapper hover:text-primary/80 transition-colors cursor-pointer">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={customRenderers}
            >
              {article.description}
            </ReactMarkdown>
          </div>
        </Link>
        <ArticleCardFooter 
          keywords={article.keywords}
          onCommentsClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowComments(true);
          }}
          isLoading={isLoading}
          hasError={hasError}
          commentCount={commentCount}
        />
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
