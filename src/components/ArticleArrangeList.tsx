
import React from "react";
import { Article } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ArticleArrangeListProps {
  articles: Article[];
  setArticles: React.Dispatch<React.SetStateAction<Article[]>>;
}

const ArticleArrangeList = ({ articles, setArticles }: ArticleArrangeListProps) => {
  const moveArticle = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= articles.length) return;
    
    const newArticles = [...articles];
    const temp = newArticles[index];
    newArticles[index] = newArticles[newIndex];
    newArticles[newIndex] = temp;
    setArticles(newArticles);
  };

  return (
    <div className="space-y-4">
      {articles.map((article, index) => (
        <Card key={article.id} className="flex items-center border border-gray-200">
          <div className="flex flex-col items-center p-2 border-r">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => moveArticle(index, 'up')} 
              disabled={index === 0}
              className="h-8 w-8"
            >
              <ArrowUp size={16} />
            </Button>
            <span className="text-sm font-mono my-1">{index + 1}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => moveArticle(index, 'down')} 
              disabled={index === articles.length - 1}
              className="h-8 w-8"
            >
              <ArrowDown size={16} />
            </Button>
          </div>
          <div className="flex flex-1 items-center p-2">
            <CardHeader className="p-0 w-32 flex-shrink-0 mr-4">
              <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-md">
                <img 
                  src={article.imageUrl} 
                  alt={article.title} 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </AspectRatio>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <h3 className="font-semibold line-clamp-2">{article.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-1">{article.author}</p>
            </CardContent>
          </div>
        </Card>
      ))}
      
      {articles.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No articles to arrange
        </div>
      )}
    </div>
  );
};

export default ArticleArrangeList;
