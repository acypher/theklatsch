
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export const useRecommendations = () => {
  const [recommendations, setRecommendations] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('vars')
          .select('value')
          .eq('key', 'recommendations')
          .maybeSingle();
        
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

  const handleSaveRecommendations = async (content: string) => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to edit recommendations");
      return;
    }
    
    try {
      setIsSaving(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      
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
