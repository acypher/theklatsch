import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const getDefaultIssue = async (): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('issue')
      .select('value')
      .eq('key', 'default_issue')
      .single();
    
    if (error) {
      console.error("Error getting default issue:", error);
      return "April 2025";  // Fallback value
    }
    
    // Clean up the value for consistent format
    const cleanValue = typeof data?.value === 'string' 
      ? data.value.replace(/^"|"$/g, '')
      : "April 2025";
    
    return cleanValue || "April 2025";
  } catch (error) {
    console.error("Unexpected error retrieving default issue:", error);
    return "April 2025";
  }
};

export const checkAndFixDisplayIssue = async (): Promise<{ text: string, wasFixed: boolean }> => {
  try {
    const { data, error } = await supabase
      .from('issue')
      .select('value')
      .eq('key', 'display_issue')
      .single();
    
    if (error) {
      console.error("Error fetching display issue:", error);
      toast.error("Failed to fetch display issue");
      return { text: await getDefaultIssue(), wasFixed: false };
    }
    
    console.log("Current display issue value:", data?.value);
    
    let needsFix = false;
    let currentText = "April 2025"; // Default fallback
    
    if (data?.value) {
      try {
        if (typeof data.value === 'string') {
          currentText = data.value.replace(/^"|"$/g, '');
        } else if (typeof data.value === 'object') {
          const stringValue = JSON.stringify(data.value);
          currentText = stringValue.replace(/^"|"$/g, '').replace(/\\"/g, '');
        }
        
        if (currentText.includes("Unknown") || currentText.includes('\\"') || 
            currentText === "null" || currentText === "undefined") {
          needsFix = true;
        }
      } catch (e) {
        console.error("Error parsing issue value:", e);
        needsFix = true;
      }
    } else {
      needsFix = true;
    }
    
    if (needsFix) {
      const defaultIssue = await getDefaultIssue();
      console.log("Fixing display issue value...");
      
      const { error: updateError } = await supabase
        .from('issue')
        .update({ value: JSON.stringify(defaultIssue) })
        .eq('key', 'display_issue');
      
      if (updateError) {
        console.error("Error updating display issue value:", updateError);
        toast.error("Failed to fix display issue value");
        return { text: defaultIssue, wasFixed: false };
      }
      
      toast.success("Display issue value has been fixed");
      return { text: defaultIssue, wasFixed: true };
    }
    
    return { text: currentText, wasFixed: false };
  } catch (error) {
    console.error("Unexpected error checking/fixing display issue:", error);
    return { text: await getDefaultIssue(), wasFixed: false };
  }
};

export const getCurrentIssue = async (): Promise<{ text: string } | null> => {
  try {
    const { text } = await checkAndFixDisplayIssue();
    return { text };
  } catch (error) {
    console.error("Error in getCurrentIssue:", error);
    return { text: "April 2025" }; // Default fallback
  }
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
      .single();
    
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
