
import { useState } from 'react';
import { Article } from "@/lib/types";

interface ArticlesListProps {
  articles: Article[];
  allArticles: Article[]; // Need this to know the original position of each article
  readArticles: Set<string>;
  onArticleClick: (articleId: string) => void;
  commentCounts?: {[articleId: string]: {commentCount: number, viewedCommentCount: number}};
}

const ArticlesList = ({ 
  articles, 
  allArticles, 
  readArticles, 
  onArticleClick, 
  commentCounts = {} 
}: ArticlesListProps) => {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  
  const handleItemClick = (articleId: string) => {
    setActiveItem(articleId);
    onArticleClick(articleId);
  };

  return (
    <ul className="space-y-2">
      {articles.map((article) => {
        const isArticleRead = readArticles.has(article.id);
        
        // Find the original position of the article in the full list
        const originalIndex = allArticles.findIndex(a => a.id === article.id);
        const displayNumber = originalIndex + 1; // 1-based numbering

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
                  {displayNumber}.
                </span>
              ) : (
                <span 
                  className={`font-medium min-w-6 flex items-center justify-center ${isArticleRead ? "text-muted-foreground/50" : "text-muted-foreground"}`}
                >
                  {displayNumber}.
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
