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
  readArticles?: Set<string>;
  hideRead?: boolean;
}

const TableOfContents = ({ 
  articles, 
  onArticleClick, 
  className,
  readArticles = new Set(),
  hideRead = false
}: TableOfContentsProps) => {
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
  const articlesListHeight = isMobile ? 250 : (maxHeight - recommendationsHeight - 60);

  return (
    <Card className={`h-full max-h-[600px] flex flex-col ${className || ""}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xl">
          <BookOpen className="h-5 w-5" />
          In This Issue
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-6 pt-0 flex flex-col">
        <ScrollArea 
          className="pr-4"
          style={{ height: articlesListHeight }}
        >
          <ul className="space-y-2">
            {articles.map((article, index) => (
              <li 
                key={article.id}
                className={`cursor-pointer transition-colors ${
                  activeItem === article.id
                    ? "text-primary font-medium"
                    : readArticles.has(article.id) && !hideRead
                    ? "text-muted-foreground/50 hover:text-muted-foreground"
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
        
        {!loading && (
          <div className="mt-3 max-h-[120px] overflow-hidden">
            <ScrollArea className="h-[120px]">
              <EditableMarkdown 
                content={recommendations} 
                onSave={handleSaveRecommendations} 
                placeholder="Add recommendations here..."
              />
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TableOfContents;
