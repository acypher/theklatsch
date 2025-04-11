
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Article } from "@/lib/types";
import { BookOpen } from "lucide-react";

interface TableOfContentsProps {
  articles: Article[];
  onArticleClick: (articleId: string) => void;
  className?: string;
}

const TableOfContents = ({ articles, onArticleClick, className }: TableOfContentsProps) => {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  
  const handleItemClick = (articleId: string) => {
    setActiveItem(articleId);
    onArticleClick(articleId);
  };

  return (
    <Card className={`h-full flex flex-col ${className || ""}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xl">
          <BookOpen className="h-5 w-5" />
          In This Issue
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-[400px] pr-4">
          <ul className="space-y-3">
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
                  onClick={() => handleItemClick(article.id)}
                  aria-current={activeItem === article.id ? "true" : undefined}
                >
                  <span className="font-medium text-muted-foreground min-w-8">
                    {index + 1}.
                  </span>
                  <span>{article.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default TableOfContents;
