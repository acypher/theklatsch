
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BackIssue {
  id: number;
  url: string;
  display_issue: string;
}

export const getBackIssues = async (): Promise<BackIssue[]> => {
  try {
    const { data, error } = await supabase
      .from('back_issues')
      .select('id, url, display_issue')
      .order('id', { ascending: false });
    
    if (error) {
      console.error("Error fetching back issues:", error);
      toast.error("Failed to load back issues");
      return [];
    }
    
    console.log("Back issues from database:", data);
    return data.filter(issue => issue.display_issue && issue.url) || [];
  } catch (error) {
    console.error("Unexpected error fetching back issues:", error);
    toast.error("Failed to load back issues");
    return [];
  }
};

export const getLatestIssue = async (): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('issue')
      .select('value')
      .eq('key', 'latest_issue')
      .single();
    
    if (error) {
      console.error("Error getting latest issue:", error);
      return "Latest Issue";
    }
    
    // Clean up the value for consistent format
    const cleanValue = typeof data?.value === 'string' 
      ? data.value.replace(/^"|"$/g, '')
      : data?.value?.toString() || "Latest Issue";
    
    return cleanValue || "Latest Issue";
  } catch (error) {
    console.error("Unexpected error retrieving latest issue:", error);
    return "Latest Issue";
  }
};
