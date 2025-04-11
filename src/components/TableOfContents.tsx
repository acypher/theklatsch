
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
  
  useEffect(() => {
    // Fetch recommendations
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('issue_content')
          .select('recommendations')
          .eq('key', 'current_issue')
          .single();
        
        if (error) {
          console.error('Error fetching recommendations:', error);
          return;
        }
        
        if (data) {
          setRecommendations(data.recommendations || '');
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
        .from('issue_content')
        .upsert(
          { 
            key: 'current_issue', 
            recommendations: content,
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

  // Calculate remaining height for article list
  const recommendationsHeight = recommendations ? 150 : 0;
  const articlesListHeight = isMobile ? 300 : (maxHeight - recommendationsHeight);

  return (
    <Card className={`h-full flex flex-col ${className || ""}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xl">
          <BookOpen className="h-5 w-5" />
          In This Issue
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-6 pt-0 flex flex-col">
        <ScrollArea 
          className={`h-[${articlesListHeight}px]`} 
          style={{ height: articlesListHeight }}
        >
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
        
        {!loading && (
          <EditableMarkdown 
            content={recommendations} 
            onSave={handleSaveRecommendations} 
            placeholder="Add recommendations here..."
          />
        )}
      </CardContent>
    </Card>
  );
};

export default TableOfContents;
