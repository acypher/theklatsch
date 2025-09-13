import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getLatestIssue } from "./latestIssue";

export const getDefaultIssue = async (): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('issue')
      .select('value')
      .eq('key', 'default_issue')
      .maybeSingle();
    
    if (error) {
      console.error("Error getting default issue:", error);
      return await getLatestIssue();  // Use latest issue as fallback
    }
    
    // Clean up the value for consistent format
    const cleanValue = typeof data?.value === 'string' 
      ? data.value.replace(/^"|"$/g, '')
      : await getLatestIssue();
    
    return cleanValue || await getLatestIssue();
  } catch (error) {
    console.error("Unexpected error retrieving default issue:", error);
    return await getLatestIssue();
  }
};

export const getCurrentIssue = async (): Promise<{ text: string }> => {
  try {
    const { data, error } = await supabase
      .from('issue')
      .select('value, updated_at, created_at')
      .eq('key', 'display_issue')
      .order('updated_at', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching display issue:", error);
      return { text: await getLatestIssue() };
    }
    
    // If no data exists, set it to latest issue
    if (!data?.value) {
      const latestIssue = await getLatestIssue();
      await supabase
        .from('issue')
        .update({ value: latestIssue, updated_at: new Date().toISOString() })
        .eq('key', 'display_issue');
      return { text: latestIssue };
    }
    
    // Parse the stored value
    let currentText: string;
    try {
      if (typeof data.value === 'string') {
        currentText = data.value.replace(/^"|"$/g, '');
      } else {
        currentText = JSON.stringify(data.value).replace(/^"|"$/g, '').replace(/\\"/g, '');
      }
      
       // Only return latest issue if the stored value is clearly corrupted
       if (
         currentText.includes("Unknown") ||
         currentText === "null" ||
         currentText === "undefined" ||
         currentText.trim() === "" ||
         currentText === '""'
       ) {
         const latestIssue = await getLatestIssue();
         await supabase
           .from('issue')
           .update({ value: latestIssue, updated_at: new Date().toISOString() })
           .eq('key', 'display_issue');
         return { text: latestIssue };
       }
      
      return { text: currentText };
    } catch (e) {
      console.error("Error parsing issue value:", e);
      const latestIssue = await getLatestIssue();
      return { text: latestIssue };
    }
  } catch (error) {
    console.error("Error in getCurrentIssue:", error);
    return { text: await getLatestIssue() };
  }
};

// Legacy function for backward compatibility - now just calls getCurrentIssue
export const checkAndFixDisplayIssue = async (): Promise<{ text: string, wasFixed: boolean }> => {
  const result = await getCurrentIssue();
  return { text: result.text, wasFixed: false };
};

export const updateCurrentMonthYear = async (month: number, year: number): Promise<boolean> => {
  try {
    const { error: monthError } = await supabase
      .from('issue')
      .update({ value: month.toString(), updated_at: new Date().toISOString() })
      .eq('key', 'display_month');
    
    if (monthError) {
      console.error("Error updating current month:", monthError);
      return false;
    }
    
    const { error: yearError } = await supabase
      .from('issue')
      .update({ value: year.toString(), updated_at: new Date().toISOString() })
      .eq('key', 'display_year');
    
    if (yearError) {
      console.error("Error updating current year:", yearError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error updating current month/year:", error);
    return false;
  }
};

export const checkDisplayIssueValue = async () => {
  try {
    const { data, error } = await supabase
      .from('issue')
      .select('value')
      .eq('key', 'display_issue')
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching display issue:", error);
      toast.error("Failed to fetch display issue");
      return null;
    }
    
    console.log("Current display issue value:", data?.value);
    return data?.value;
  } catch (error) {
    console.error("Unexpected error checking display issue:", error);
    toast.error("Unexpected error checking display issue");
    return null;
  }
};
