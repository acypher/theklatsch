import { useState } from "react";
import { Article } from "@/lib/types";
import { MessageCircle } from "lucide-react";

interface ArticlesListProps {
  articles: Article[];
  readArticles: Set<string>;
  onArticleClick: (articleId: string) => void;
  commentCounts?: { [articleId: string]: { commentCount: number; viewedCommentCount: number } };
  onOpenComments?: (articleId: string) => void; // ADDED
}

const ArticlesList = ({
  articles,
  readArticles,
  onArticleClick,
  commentCounts = {},
  onOpenComments, // ADDED
}: ArticlesListProps) => {
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
            <div className="flex items-center gap-2">
              <button
                className="text-left w-full text-sm flex items-start gap-2"
                onClick={() => handleItemClick(article.id)}
                aria-current={activeItem === article.id ? "true" : undefined}
              >
                <span
                  className={`font-medium min-w-6 flex items-center justify-center relative
                  ${hasUnreadComments ? "bg-yellow-300 text-black rounded-full px-2" : isArticleRead ? "text-muted-foreground/50" : "text-muted-foreground"}
                `}
                  style={hasUnreadComments ? { boxShadow: "0 0 0 2px #FFD600" } : {}}
                  title={hasUnreadComments ? "You have unread comments!" : undefined}
                >
                  {index + 1}.
                </span>
                <span className={isArticleRead ? "text-muted-foreground/50" : ""}>{article.title}</span>
              </button>
              {onOpenComments && (
                <button
                  className="ml-1 p-1 rounded hover:bg-accent focus:outline-none"
                  title="Open Comments"
                  onClick={() => onOpenComments(article.id)}
                  tabIndex={0}
                  type="button"
                >
                  <MessageCircle
                    className={hasUnreadComments ? "text-yellow-500" : "text-muted-foreground"}
                    size={18}
                    aria-label="Comments"
                  />
                  <span className="sr-only">Open comments</span>
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default ArticlesList;
