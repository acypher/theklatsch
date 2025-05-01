
import { useState } from 'react';
import { Article } from "@/lib/types";

interface ArticlesListProps {
  articles: Article[];
  readArticles: Set<string>;
  onArticleClick: (articleId: string) => void;
  articlesWithUnreadComments?: Set<string>;
  onCommentsViewed?: (articleId: string) => void;
}

const ArticlesList = ({ 
  articles, 
  readArticles, 
  onArticleClick,
  articlesWithUnreadComments = new Set(),
  onCommentsViewed
}: ArticlesListProps) => {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  
  const handleItemClick = (articleId: string) => {
    setActiveItem(articleId);
    onArticleClick(articleId);
  };

  const handleArticleNumberClick = (e: React.MouseEvent, articleId: string) => {
    e.stopPropagation();
    if (onCommentsViewed) {
      onCommentsViewed(articleId);
    }
  };

  return (
    <ul className="space-y-2">
      {articles.map((article, index) => {
        const isArticleRead = readArticles.has(article.id);
        const hasUnreadComments = articlesWithUnreadComments.has(article.id);
        
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
              <span 
                className={`font-medium min-w-6 px-1.5 rounded-sm ${
                  hasUnreadComments 
                    ? "bg-[#FEF7CD]" 
                    : isArticleRead 
                    ? "text-muted-foreground/50" 
                    : "text-muted-foreground"
                }`}
                onClick={(e) => handleArticleNumberClick(e, article.id)}
              >
                {index + 1}.
              </span>
              <span className={isArticleRead ? "text-muted-foreground/50" : ""}>{article.title}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
};

export default ArticlesList;
