
import { useState } from 'react';
import { Article } from "@/lib/types";

interface ArticlesListProps {
  articles: Article[];
  readArticles: Set<string>;
  onArticleClick: (articleId: string) => void;
  commentCounts?: {[articleId: string]: {commentCount: number, viewedCommentCount: number}};
}

const ArticlesList = ({ articles, readArticles, onArticleClick, commentCounts = {} }: ArticlesListProps) => {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  
  const handleItemClick = (articleId: string) => {
    setActiveItem(articleId);
    onArticleClick(articleId);
  };

  return (
    <ul className="space-y-2">
      {articles.map((article, index) => {
        const isArticleRead = readArticles.has(article.id);

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
              <span 
                className={`
                  font-medium min-w-6 flex items-center justify-center relative
                  ${hasUnreadComments ? "" : isArticleRead ? "text-muted-foreground/50" : "text-muted-foreground"}
                `}
                style={
                  hasUnreadComments
                    ? {
                        backgroundColor: "#FEF7CD",
                        color: "#333",
                        borderRadius: "9999px",
                        paddingLeft: "0.5rem",
                        paddingRight: "0.5rem",
                        boxShadow: "0 0 0 2px #FEF7CD"
                      }
                    : {}
                }
                title={hasUnreadComments ? "You have unread comments!" : undefined}
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
