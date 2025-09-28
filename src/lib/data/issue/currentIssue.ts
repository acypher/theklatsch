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
      .select('value')
      .eq('key', 'display_issue')
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
        .update({ value: JSON.stringify(latestIssue) })
        .eq('key', 'display_issue');
      return { text: latestIssue };
    }
    
    // Parse and normalize the stored JSONB string value reliably
    try {
      const raw = data.value as any;
      let currentText: string | null = null;

      if (typeof raw === 'string') {
        // Try to JSON.parse if it's a JSON-string like "\"October 2025\""
        try {
          const parsed = JSON.parse(raw);
          if (typeof parsed === 'string') currentText = parsed;
        } catch {
          currentText = raw;
        }
      }

      if (currentText == null && raw != null) {
        // Fallback: coerce to string (handles cases where value is returned as JSON already)
        currentText = String(raw);
      }

      // Final cleanup: strip wrapping quotes and unescape any \" remnants
      currentText = (currentText || '')
        .replace(/^"+|"+$/g, '')
        .replace(/\\"/g, '"')
        .trim();

      // Only fallback if clearly invalid after normalization
      if (!currentText || currentText === 'null' || currentText === 'undefined' || currentText.includes('Unknown')) {
        const latestIssue = await getLatestIssue();
        await supabase
          .from('issue')
          .update({ value: JSON.stringify(latestIssue) })
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
      .update({ value: JSON.stringify(month.toString()) })
      .eq('key', 'display_month');
    
    if (monthError) {
      console.error("Error updating current month:", monthError);
      return false;
    }
    
    const { error: yearError } = await supabase
      .from('issue')
      .update({ value: JSON.stringify(year.toString()) })
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
