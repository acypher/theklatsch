
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Article } from "@/lib/types";
import { BookOpen } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface TableOfContentsProps {
  articles: Article[];
  onArticleClick: (articleId: string) => void;
  className?: string;
}

const TableOfContents = ({ articles, onArticleClick, className }: TableOfContentsProps) => {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [maxHeight, setMaxHeight] = useState<number>(400);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Function to calculate the max height based on viewport width
    const calculateMaxHeight = () => {
      const viewportWidth = window.innerWidth;
      // Using approximately 2:1 ratio (1050:550)
      // But clamping between reasonable min/max values
      const calculatedHeight = Math.floor(viewportWidth / 2);
      
      // Set reasonable limits
      const minHeight = 300;
      const maxHeight = 650;
      
      return Math.min(Math.max(calculatedHeight, minHeight), maxHeight);
    };
    
    // Set initial height
    setMaxHeight(calculateMaxHeight());
    
    // Update on resize
    const handleResize = () => {
      setMaxHeight(calculateMaxHeight());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
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
      <CardContent className="flex-grow p-6 pt-0">
        <ScrollArea className={`h-[${isMobile ? '300px' : maxHeight + 'px'}]`} style={{ height: isMobile ? 300 : maxHeight }}>
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
