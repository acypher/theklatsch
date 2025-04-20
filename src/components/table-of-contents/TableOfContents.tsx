import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Article } from "@/lib/types";
import { BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArticlesList } from "./ArticlesList";
import { Recommendations } from "./Recommendations";
import {
  RECOMMENDATIONS_TITLE_HEIGHT,
  RECOMMENDATION_SECTION_HEIGHT,
  CARD_HEADER_HEIGHT,
  ARTICLES_TITLE_HEIGHT,
  PADDING_BOTTOM,
  MAX_TOC_HEIGHT,
} from "./constants";

interface TableOfContentsProps {
  articles: Article[];
  onArticleClick: (articleId: string) => void;
  className?: string;
}

const TableOfContents = ({ articles, onArticleClick, className }: TableOfContentsProps) => {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<string>("");
  const [loading, setLoading] = useState(true);

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

  // Calculate available height for the articles list
  const actualRecommendationHeight = recommendations ? RECOMMENDATION_SECTION_HEIGHT : 0;
  
  const articlesListMaxHeight = Math.max(
    250, // Minimum height for articles list
    MAX_TOC_HEIGHT - CARD_HEADER_HEIGHT - ARTICLES_TITLE_HEIGHT - 
    actualRecommendationHeight - PADDING_BOTTOM
  );

  return (
    <Card className={`flex flex-col ${className || ""}`} style={{ maxHeight: `${MAX_TOC_HEIGHT}px` }}>
      <CardHeader className="pb-2 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-xl">
          <BookOpen className="h-5 w-5" />
          In This Issue
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col p-6 pt-0 overflow-hidden">
        <ArticlesList
          articles={articles}
          activeItem={activeItem}
          onArticleClick={handleItemClick}
          maxHeight={articlesListMaxHeight}
        />
        
        {!loading && (
          <Recommendations
            content={recommendations}
            onSave={handleSaveRecommendations}
            sectionHeight={RECOMMENDATION_SECTION_HEIGHT}
            titleHeight={RECOMMENDATIONS_TITLE_HEIGHT}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default TableOfContents;
