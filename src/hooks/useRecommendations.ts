
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export const useRecommendations = (currentIssue?: string) => {
  const [recommendations, setRecommendations] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!currentIssue) return;
      
      setLoading(true);
      try {
        // Use the vars table instead which exists in the TypeScript types
        // We'll use a key pattern like `recommendations_${currentIssue}` 
        const { data, error } = await supabase
          .from("vars")
          .select("value")
          .eq("key", `recommendations_${currentIssue}`)
          .maybeSingle();
        
        if (error) {
          console.error("Error fetching recommendations:", error);
          return;
        }
        
        setRecommendations(data?.value || "");
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (currentIssue) {
      fetchRecommendations();
    }
  }, [currentIssue]);
  
  const handleSaveRecommendations = async (content: string) => {
    if (!currentIssue || !isAuthenticated) return;
    
    setIsSaving(true);
    
    try {
      // Store in vars table with key pattern
      const key = `recommendations_${currentIssue}`;
      const { error } = await supabase
        .from("vars")
        .upsert(
          { 
            key: key,
            value: content 
          },
          { onConflict: "key" }
        );
      
      if (error) {
        throw error;
      }
      
      setRecommendations(content);
      toast.success("Editor's comments saved successfully!");
    } catch (error) {
      console.error("Failed to save recommendations:", error);
      toast.error("Failed to save editor's comments");
    } finally {
      setIsSaving(false);
    }
  };
  
  return {
    recommendations,
    loading,
    isSaving,
    handleSaveRecommendations
  };
};
