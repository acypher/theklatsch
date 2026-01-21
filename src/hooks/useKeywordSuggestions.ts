
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useKeywordSuggestions = () => {
  const [allKeywords, setAllKeywords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchKeywords = async () => {
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('keywords')
          .eq('deleted', false)
          .not('keywords', 'is', null);

        if (error) throw error;

        // Extract unique keywords from all articles
        const keywordSet = new Set<string>();
        data?.forEach(article => {
          article.keywords?.forEach((keyword: string) => {
            keywordSet.add(keyword.toLowerCase());
          });
        });

        setAllKeywords(Array.from(keywordSet).sort());
      } catch (error) {
        console.error("Failed to fetch keywords:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKeywords();
  }, []);

  const getSuggestions = (input: string, existingKeywords: string[]): string[] => {
    if (!input.trim()) return [];
    
    const inputLower = input.toLowerCase();
    const existingLower = existingKeywords.map(k => k.toLowerCase());
    
    return allKeywords
      .filter(keyword => 
        keyword.startsWith(inputLower) && 
        !existingLower.includes(keyword)
      )
      .slice(0, 8); // Limit to 8 suggestions
  };

  return { allKeywords, getSuggestions, isLoading };
};
