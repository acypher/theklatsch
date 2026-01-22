import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useExistingKeywords = () => {
  return useQuery({
    queryKey: ["existing-keywords"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("keywords")
        .not("keywords", "eq", "{}");

      if (error) throw error;

      // Flatten and deduplicate all keywords
      const allKeywords = data
        ?.flatMap((article) => article.keywords || [])
        .filter((keyword): keyword is string => Boolean(keyword));

      const uniqueKeywords = [...new Set(allKeywords)].sort((a, b) =>
        a.toLowerCase().localeCompare(b.toLowerCase())
      );

      return uniqueKeywords;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
