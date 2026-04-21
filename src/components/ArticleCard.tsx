import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Article } from "@/lib/types";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState, useEffect } from "react";
import CommentDialog from "./comments/CommentDialog";
import { supabase } from "@/integrations/supabase/client";
import ArticleCardHeader from "./article/ArticleCardHeader";
import ArticleCardMeta from "./article/ArticleCardMeta";
import ArticleCardFooter from "./article/ArticleCardFooter";
import ReadCheckbox from './article/ReadCheckbox';
import FavoriteButton from './article/FavoriteButton';
import { useAuth } from "@/contexts/AuthContext";
import { isVideoUrl } from "@/lib/search";
import { useArticleReads } from "@/hooks/useArticleReads";
import { useArticleOpens } from "@/hooks/useArticleOpens";

interface ArticleCardProps {
  article: Article;
  onKeywordClick?: (keyword: string) => void;
}

const ArticleCard = ({ article, onKeywordClick }: ArticleCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [currentArticle, setCurrentArticle] = useState(article);
  const [commentCount, setCommentCount] = useState(0);
  const [viewedCommentCount, setViewedCommentCount] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { isRead, toggleReadState } = useArticleReads(article.id);
  const openerLetters = useArticleOpens(article.id, article.user_id ?? undefined);

  const isGif = currentArticle.imageUrl.toLowerCase().endsWith('.gif');

  const fetchCommentData = async () => {
    try {
      setIsLoading(true);
      setHasError(false);

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timed out')), 8000)
      );

      const fetchPromise = supabase
        .from("comments")
        .select("id", { count: 'exact' })
        .eq("article_id", article.id);

      const { count, error } = await Promise.race([
        fetchPromise,
        timeoutPromise.then(() => { throw new Error('Request timed out'); })
      ]) as any;

      if (error) {
        throw error;
      }

      setCommentCount(count || 0);

      if (isAuthenticated && user) {
        try {
          const { data, error: viewError } = await supabase
            .from("comment_views")
            .select("comment_id", { count: 'exact' })
            .eq("article_id", article.id)
            .eq("user_id", user.id);

          if (!viewError) {
            setViewedCommentCount(data?.length || 0);
          }
        } catch (viewError) {
          console.error("Error fetching viewed comments:", viewError);
        }
      }
    } catch (error) {
      console.error("Error fetching comment count:", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommentData();
  }, [article.id, isAuthenticated, user]);

  useEffect(() => {
    setCurrentArticle(article);
  }, [article]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getImageUrl = (url: string) => {
    if (!url || url.includes('images.unsplash.com') || url.trim() === '') {
      return "https://kjfwyaniengzduyeeufq.supabase.co/storage/v1/object/public/logos/defaultImage.png";
    }
    
    if (url.includes('drive.google.com/file/d/')) {
      const fileIdMatch = url.match(/\/d\/([^/]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
        const fileId = fileIdMatch[1];
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
      }
    }
    return url;
  };

  const handleCommentsClose = () => {
    setShowComments(false);
    fetchCommentData();
  };

  const handleArticleClick = async () => {
    sessionStorage.setItem('indexScrollY', window.scrollY.toString());
    
    // Track the open for the current user
    if (isAuthenticated && user) {
      supabase
        .from('article_opens')
        .upsert(
          { article_id: currentArticle.id, user_id: user.id, opened_at: new Date().toISOString() },
          { onConflict: 'article_id,user_id' }
        )
        .then(({ error }) => {
          if (error) console.error('Error tracking article open:', error);
        });
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
    p: ({ node, ...props }: any) => <p className="markdown-paragraph" {...props} />,
    h1: ({ node, ...props }: any) => <h1 className="m-0 p-0 text-xl font-semibold" {...props} />,
    h2: ({ node, ...props }: any) => <h2 className="m-0 p-0 text-xl font-semibold" {...props} />,
    h3: ({ node, ...props }: any) => <h3 className="m-0 p-0 text-xl font-semibold" {...props} />,
    h4: ({ node, ...props }: any) => <h4 className="m-0 p-0 text-xl font-semibold" {...props} />,
    h5: ({ node, ...props }: any) => <h5 className="m-0 p-0 text-xl font-semibold" {...props} />,
    h6: ({ node, ...props }: any) => <h6 className="m-0 p-0 text-xl font-semibold" {...props} />,
  };

  const isDraft = currentArticle.draft;

  return (
    <Card className={`h-full flex flex-col hover:shadow-md transition-shadow article-card relative ${isDraft ? 'draft-border' : ''}`} data-article-id={currentArticle.id}>
      <ReadCheckbox articleId={currentArticle.id} />
      <FavoriteButton articleId={currentArticle.id} />

      <Link 
        to={`/article/${currentArticle.id}`}
        className="block group"
        onClick={handleArticleClick}
      >
        <div className="hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors rounded-lg">
          <CardHeader className="p-0">
            <ArticleCardHeader 
              articleId={currentArticle.id}
              imageUrl={currentArticle.imageUrl}
              title={currentArticle.title}
              isGif={isGif}
              getImageUrl={getImageUrl}
            />
          </CardHeader>
          <CardContent className="pt-6 pb-0">
            <div className={`line-clamp-2 mb-2 prose-sm prose ${currentArticle.private ? 'border-b-2 border-b-red-600 pb-1' : ''}`}>
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={customRenderers}
              >
                {currentArticle.title}
              </ReactMarkdown>
            </div>
            <ArticleCardMeta 
              author={currentArticle.author}
              createdAt={currentArticle.createdAt}
              formatDate={formatDate}
            />
            <div className="text-muted-foreground mb-4 line-clamp-3 prose prose-sm max-w-none markdown-wrapper">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={customRenderers}
              >
                {currentArticle.description}
              </ReactMarkdown>
            </div>
          </CardContent>
        </div>
      </Link>
      
      <CardContent className="pt-0">
        <ArticleCardFooter 
          keywords={currentArticle.keywords}
          onCommentsClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowComments(true);
          }}
          isLoading={isLoading}
          hasError={hasError}
          commentCount={commentCount}
          viewedCommentCount={isAuthenticated ? viewedCommentCount : undefined}
          sourceUrl={currentArticle.sourceUrl}
          onKeywordClick={onKeywordClick}
          openerLetters={openerLetters}
        />
        {showComments && (
          <CommentDialog 
            articleId={currentArticle.id} 
            articleTitle={currentArticle.title}
            isOpen={showComments}
            onClose={handleCommentsClose}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ArticleCard;
