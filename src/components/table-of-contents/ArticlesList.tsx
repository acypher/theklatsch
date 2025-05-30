
import { useState, useEffect } from 'react';
import { Article } from "@/lib/types";

interface ArticlesListProps {
  articles: Article[];
  allArticles: Article[]; // Need this to know the original position of each article
  readArticles: Set<string>;
  onArticleClick: (articleId: string) => void;
  commentCounts?: {[articleId: string]: {commentCount: number, viewedCommentCount: number}};
  onCommentsStateChanged?: () => void; // New callback for comment state changes
  maxHeight?: string; // Allow configurable max height
  updatedArticles?: {[key: string]: string}; // New prop for updated articles
  onClearUpdated?: (articleId: string) => void; // New prop for clearing updated state
}

const ArticlesList = ({ 
  articles, 
  allArticles, 
  readArticles, 
  onArticleClick, 
  commentCounts = {},
  onCommentsStateChanged,
  maxHeight = "250px", // Default height if not specified
  updatedArticles = {},
  onClearUpdated
}: ArticlesListProps) => {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  
  useEffect(() => {
    console.log("ArticlesList - Filtered articles:", articles.map(a => a.id));
    console.log("ArticlesList - All articles:", allArticles.map(a => a.id));
    
    // Call onCommentsStateChanged whenever commentCounts changes
    if (onCommentsStateChanged) {
      onCommentsStateChanged();
    }
  }, [articles, allArticles, commentCounts, onCommentsStateChanged]);
  
  const handleItemClick = (articleId: string) => {
    setActiveItem(articleId);
    onArticleClick(articleId);
    
    // Clear the updated state when the article is clicked
    if (updatedArticles[articleId] && onClearUpdated) {
      onClearUpdated(articleId);
    }
  };

  return (
    <div style={{ height: maxHeight }} className="overflow-auto h-full">
      <ul className="space-y-2">
        {articles.map((article) => {
          const isArticleRead = readArticles.has(article.id);
          
          // Find the actual position in the full list of articles (not just the filtered ones)
          const originalPosition = allArticles.findIndex(a => a.id === article.id);
          // Display the position + 1 (for 1-based numbering)
          const displayNumber = originalPosition !== -1 ? originalPosition + 1 : 0;
          
          // Check for unread comments
          const counts = commentCounts[article.id] || { commentCount: 0, viewedCommentCount: 0 };
          const hasUnreadComments = counts.viewedCommentCount < counts.commentCount;

          // Check if article was recently updated
          const isRecentlyUpdated = updatedArticles[article.id] !== undefined;

          return (
            <li 
              key={article.id}
              className={`cursor-pointer transition-colors ${
                activeItem === article.id
                  ? "text-primary font-medium"
                  : isArticleRead 
                  ? "text-muted-foreground/50 hover:text-muted-foreground"
                  : "text-foreground hover:text-primary"
              }`}
            >
              <button
                className="text-left w-full text-sm flex items-start gap-2"
                onClick={() => handleItemClick(article.id)}
                aria-current={activeItem === article.id ? "true" : undefined}
              >
                {hasUnreadComments ? (
                  <span 
                    className="bg-yellow-300 text-black rounded-full px-2 font-medium min-w-6 flex items-center justify-center"
                    title="You have unread comments!"
                  >
                    {displayNumber}.
                  </span>
                ) : (
                  <span 
                    className={`font-medium min-w-6 flex items-center justify-center ${isArticleRead ? "text-muted-foreground/50" : "text-muted-foreground"}`}
                  >
                    {displayNumber}.
                  </span>
                )}
                <span 
                  className={`${isArticleRead ? "text-muted-foreground/50" : ""} ${
                    isRecentlyUpdated ? "bg-yellow-200 px-1 rounded" : ""
                  }`}
                  title={isRecentlyUpdated ? "Recently updated" : undefined}
                >
                  {article.title}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ArticlesList;
