
import { Article } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ArticlesListProps {
  articles: Article[];
  activeItem: string | null;
  onArticleClick: (articleId: string) => void;
  maxHeight: number;
}

export const ArticlesList = ({ 
  articles, 
  activeItem, 
  onArticleClick,
  maxHeight 
}: ArticlesListProps) => {
  return (
    <>
      <div className="mb-3 flex-shrink-0 font-medium text-sm text-muted-foreground">
        Articles:
      </div>
      <ScrollArea className="flex-grow pr-3" style={{ height: `${maxHeight}px` }}>
        <ul className="space-y-2">
          {articles.map((article, index) => (
            <li 
              key={article.id}
              className={`cursor-pointer transition-colors ${
                activeItem === article.id
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <button
                className="text-left w-full text-sm flex items-start gap-2"
                onClick={() => onArticleClick(article.id)}
                aria-current={activeItem === article.id ? "true" : undefined}
              >
                <span className="font-medium text-muted-foreground min-w-6">
                  {index + 1}.
                </span>
                <span>{article.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </>
  );
};
