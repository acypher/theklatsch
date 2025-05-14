
import { useState } from 'react';
import { Article } from "@/lib/types";

interface ArticlesListProps {
  articles: Article[];
  readArticles: Set<string>;
  onArticleClick: (articleId: string) => void;
  commentCounts?: {[articleId: string]: {commentCount: number, viewedCommentCount: number}};
  visibleArticles?: Article[]; // Added to track which articles are currently visible
}

const ArticlesList = ({ 
  articles, 
  readArticles, 
  onArticleClick, 
  commentCounts = {},
  visibleArticles = articles // Default to all articles if not provided
}: ArticlesListProps) => {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  
  const handleItemClick = (articleId: string) => {
    setActiveItem(articleId);
    onArticleClick(articleId);
  };

  return (
    <ul className="space-y-2">
      {visibleArticles.map((article) => {
        const isArticleRead = readArticles.has(article.id);
        
        // Get the actual index from the complete articles array
        // This ensures numbering stays consistent even when filtering
        const originalIndex = articles.findIndex((a) => a.id === article.id);
        const displayIndex = originalIndex + 1; // Use 1-based indexing for display

        // Check for unread comments
        const counts = commentCounts[article.id] || { commentCount: 0, viewedCommentCount: 0 };
        const hasUnreadComments = counts.viewedCommentCount < counts.commentCount;

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
                  {displayIndex}.
                </span>
              ) : (
                <span 
                  className={`font-medium min-w-6 flex items-center justify-center ${isArticleRead ? "text-muted-foreground/50" : "text-muted-foreground"}`}
                >
                  {displayIndex}.
                </span>
              )}
              <span className={isArticleRead ? "text-muted-foreground/50" : ""}>{article.title}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
};

export default ArticlesList;
