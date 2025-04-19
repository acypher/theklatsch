import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Article } from "@/lib/types";
import KeywordBadge from "./KeywordBadge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState, useEffect, useRef } from "react";
import { MessageSquare, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import CommentDialog from "./CommentDialog";
import { supabase } from "@/integrations/supabase/client";
import { initGifController } from '@/utils/gifController';

interface ArticleCardProps {
  article: Article;
}

const ArticleCard = ({ article }: ArticleCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const gifControllerRef = useRef<{ dispose: () => void } | null>(null);
  const isGif = article.imageUrl.toLowerCase().endsWith('.gif');
  
  useEffect(() => {
    if (isGif) {
      let isMounted = true;
      const timer = setTimeout(async () => {
        try {
          const controller = await initGifController();
          if (isMounted && controller) {
            gifControllerRef.current = controller;
          }
        } catch (error) {
          console.error("Error initializing GIF controller:", error);
        }
      }, 100);
      
      return () => {
        isMounted = false;
        clearTimeout(timer);
        if (gifControllerRef.current) {
          gifControllerRef.current.dispose();
        }
      };
    }
  }, [isGif, article.imageUrl]);
  
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

  const handleImageClick = (e: React.MouseEvent) => {
    if (isGif) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow article-card" data-article-id={article.id}>
      <CardHeader className="p-0">
        <Link 
          to={`/article/${article.id}`}
          onClick={isGif ? handleImageClick : undefined}
        >
          <AspectRatio ratio={16 / 9} className="overflow-hidden bg-muted/20">
            <img 
              src={getImageUrl(article.imageUrl)} 
              alt={article.title} 
              className="w-full h-full object-contain"
              loading="lazy"
              id={isGif ? "animated-gif" : undefined}
            />
          </AspectRatio>
        </Link>
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
          <p className="text-muted-foreground text-sm mb-2 hover:text-primary transition-colors cursor-pointer">By {article.author} • {formatDate(article.createdAt)}</p>
          <div className="text-muted-foreground mb-4 line-clamp-3 prose prose-sm max-w-none markdown-wrapper hover:text-primary/80 transition-colors cursor-pointer">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={customRenderers}
            >
              {article.description}
            </ReactMarkdown>
          </div>
        </Link>
        
        <div className="mt-4 mb-3 flex justify-between items-center">
          {article.sourceUrl && !isGif && (
            <a 
              href={article.sourceUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 flex items-center gap-1 text-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-4 w-4" />
              Go to the Source article
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
            title={hasError ? "Error loading comment count" : ""}
          >
            <MessageSquare className="h-4 w-4" />
            {!isLoading && !hasError && commentCount > 0 ? (
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
