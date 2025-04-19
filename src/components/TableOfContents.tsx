
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Article } from "@/lib/types";
import { BookOpen } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import EditableMarkdown from "./EditableMarkdown";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TableOfContentsProps {
  articles: Article[];
  onArticleClick: (articleId: string) => void;
  className?: string;
}

const TableOfContents = ({ articles, onArticleClick, className }: TableOfContentsProps) => {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [maxHeight, setMaxHeight] = useState<number>(400);
  const [recommendations, setRecommendations] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    const calculateMaxHeight = () => {
      const viewportWidth = window.innerWidth;
      const maxAllowedHeight = 600;
      const minHeight = 250;
      
      if (viewportWidth >= 1200) {
        return maxAllowedHeight;
      }
      
      const calculatedHeight = Math.floor(viewportWidth / 2);
      return Math.min(Math.max(calculatedHeight, minHeight), maxAllowedHeight);
    };
    
    setMaxHeight(calculateMaxHeight());
    
    const handleResize = () => {
      setMaxHeight(calculateMaxHeight());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('vars')
          .select('value')
          .eq('key', 'recommendations')
          .single();
        
        if (error) {
          console.error('Error fetching recommendations:', error);
          return;
        }
        
        if (data) {
          setRecommendations(data.value || '');
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendations();
  }, []);
  
  const handleItemClick = (articleId: string) => {
    setActiveItem(articleId);
    onArticleClick(articleId);
  };
  
  const handleSaveRecommendations = async (content: string) => {
    try {
      const { error } = await supabase
        .from('vars')
        .upsert(
          { 
            key: 'recommendations', 
            value: content,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'key' }
        );
      
      if (error) {
        console.error('Error saving recommendations:', error);
        toast.error('Failed to save recommendations');
        throw error;
      }
      
      setRecommendations(content);
      toast.success('Recommendations saved successfully');
    } catch (error) {
      console.error('Error saving recommendations:', error);
      throw error;
    }
  };

  const recommendationsHeight = recommendations ? 120 : 0;
  const articlesListHeight = isMobile ? 250 : Math.min(350, maxHeight - recommendationsHeight);

  return (
    <Card className={`flex flex-col ${className || ""}`} style={{ maxHeight: "600px" }}>
      <CardHeader className="pb-2 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-xl">
          <BookOpen className="h-5 w-5" />
          In This Issue
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col p-6 pt-0 overflow-hidden flex-grow">
        <div className="mb-3 flex-shrink-0 font-medium text-sm text-muted-foreground">
          Articles:
        </div>
        <ScrollArea className="flex-grow pr-3" style={{ height: articlesListHeight }}>
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
                  onClick={() => handleItemClick(article.id)}
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
        
        {!loading && recommendations && (
          <div className="mt-4 flex-shrink-0">
            <div className="text-sm font-medium text-muted-foreground mb-1">Recommendations:</div>
            <ScrollArea className="overflow-y-auto" style={{ maxHeight: '120px' }}>
              <EditableMarkdown 
                content={recommendations} 
                onSave={handleSaveRecommendations} 
                placeholder="Add recommendations here..."
              />
            </ScrollArea>
          </div>
        )}
        
        {!loading && !recommendations && (
          <div className="mt-3 flex-shrink-0">
            <EditableMarkdown 
              content={recommendations} 
              onSave={handleSaveRecommendations} 
              placeholder="Add recommendations here..."
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TableOfContents;
