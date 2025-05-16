
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export const useRecommendations = (key?: string) => {
  const [recommendations, setRecommendations] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!key) return;
      
      setLoading(true);
      try {
        // Using the vars table with the provided key
        const { data, error } = await supabase
          .from("vars")
          .select("value")
          .eq("key", key)
          .maybeSingle();
        
        if (error) {
          console.error(`Error fetching recommendations for key ${key}:`, error);
          return;
        }
        
        setRecommendations(data?.value || "");
      } catch (error) {
        console.error(`Failed to fetch recommendations for key ${key}:`, error);
      } finally {
        setLoading(false);
      }
    };
    
    if (key) {
      fetchRecommendations();
    } else {
      setLoading(false);
    }
  }, [key]);
  
  const handleSaveRecommendations = async (content: string) => {
    if (!key || !isAuthenticated) return;
    
    setIsSaving(true);
    
    try {
      // Store in vars table with the provided key
      const { error } = await supabase
        .from("vars")
        .upsert(
          { 
            key,
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
      console.error(`Failed to save recommendations for key ${key}:`, error);
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
