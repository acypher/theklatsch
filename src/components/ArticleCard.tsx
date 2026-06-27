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
import { useArticleOpens } from "@/hooks/useArticleOpens";
import { useArticleListData } from "./article/ArticleListDataContext";
import { getListCardMaxHeight } from "@/hooks/useContentsHeight";

interface ArticleCardProps {
  article: Article;
  onKeywordClick?: (keyword: string) => void;
}

const ArticleCard = ({ article, onKeywordClick }: ArticleCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [currentArticle, setCurrentArticle] = useState(article);
  const { user, isAuthenticated } = useAuth();
  const openerLetters = useArticleOpens(article.id, article.user_id ?? undefined);

  // Comment + viewed counts are batch-fetched once for the whole list and
  // shared via context, so the card issues no per-card comment queries.
  const { commentCounts, cardHeight } = useArticleListData();
  const { commentCount = 0, viewedCommentCount } = commentCounts[article.id] ?? {};

  const isListArticle = currentArticle.keywords.includes('list') || currentArticle.keywords.includes('lists');

  const isGif = currentArticle.imageUrl.toLowerCase().endsWith('.gif');

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
    // Closing the dialog dispatches COMMENTS_UPDATED_EVENT, which refreshes the
    // list-level comment counts (see useArticleCommentCounts / ArticlesGrid).
    setShowComments(false);
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
    <Card
      className={`${isListArticle ? 'h-auto' : 'h-full'} flex flex-col hover:shadow-md transition-shadow article-card relative ${isDraft ? 'draft-border' : ''} ${isListArticle ? 'list-article-card' : ''}`}
      style={isListArticle && cardHeight ? { maxHeight: getListCardMaxHeight(cardHeight) } : undefined}
      data-article-id={currentArticle.id}
    >
      <ReadCheckbox articleId={currentArticle.id} />
      <FavoriteButton articleId={currentArticle.id} />

      <Link 
        to={`/article/${currentArticle.id}`}
        className={`block group ${isListArticle ? 'flex-1 min-h-0 overflow-hidden' : ''}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleArticleClick}
      >
        <div className={`hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors rounded-lg ${isListArticle ? 'h-full overflow-hidden flex flex-col' : ''}`}>
          <CardHeader className="p-0">
            <ArticleCardHeader 
              articleId={currentArticle.id}
              imageUrl={currentArticle.imageUrl}
              title={currentArticle.title}
              isGif={isGif}
              getImageUrl={getImageUrl}
            />
          </CardHeader>
          <CardContent className={`pt-6 pb-0 ${isListArticle ? 'flex-1 min-h-0 overflow-hidden' : ''}`}>
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
            <div className="text-muted-foreground mb-4 line-clamp-3 prose prose-sm max-w-none markdown-wrapper overflow-hidden">
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
          isLoading={false}
          hasError={false}
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
