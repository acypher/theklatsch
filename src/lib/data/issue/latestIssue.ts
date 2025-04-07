
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Function to get the latest month
export const getLatestMonth = async (): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('issue')
      .select('value')
      .eq('key', 'latest_month')
      .single();
    
    if (error) {
      console.error("Error fetching latest month:", error);
      return 4; // Default fallback to April
    }
    
    // Parse the month value
    try {
      if (typeof data.value === 'string') {
        return parseInt(data.value.replace(/^"|"$/g, ''));
      } else if (typeof data.value === 'object') {
        const stringValue = JSON.stringify(data.value);
        return parseInt(stringValue.replace(/^"|"$/g, '').replace(/\\"/g, ''));
      }
    } catch (e) {
      console.error("Error parsing latest month value:", e);
    }
    
    return 4; // Default fallback
  } catch (error) {
    console.error("Error in getLatestMonth:", error);
    return 4; // Default fallback
  }
};

// Function to get the latest year
export const getLatestYear = async (): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('issue')
      .select('value')
      .eq('key', 'latest_year')
      .single();
    
    if (error) {
      console.error("Error fetching latest year:", error);
      return 2025; // Default fallback
    }
    
    // Parse the year value
    try {
      if (typeof data.value === 'string') {
        return parseInt(data.value.replace(/^"|"$/g, ''));
      } else if (typeof data.value === 'object') {
        const stringValue = JSON.stringify(data.value);
        return parseInt(stringValue.replace(/^"|"$/g, '').replace(/\\"/g, ''));
      }
    } catch (e) {
      console.error("Error parsing latest year value:", e);
    }
    
    return 2025; // Default fallback
  } catch (error) {
    console.error("Error in getLatestYear:", error);
    return 2025; // Default fallback
  }
};

// Function to get the latest issue text
export const getLatestIssue = async (): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('issue')
      .select('value')
      .eq('key', 'latest_issue')
      .single();
    
    if (error) {
      console.error("Error fetching latest issue:", error);
      return "April 2025"; // Default fallback
    }
    
    // Parse the issue value
    try {
      if (typeof data.value === 'string') {
        return data.value.replace(/^"|"$/g, '');
      } else if (typeof data.value === 'object') {
        const stringValue = JSON.stringify(data.value);
        return stringValue.replace(/^"|"$/g, '').replace(/\\"/g, '');
      }
    } catch (e) {
      console.error("Error parsing latest issue value:", e);
    }
    
    return "April 2025"; // Default fallback
  } catch (error) {
    console.error("Error in getLatestIssue:", error);
    return "April 2025"; // Default fallback
  }
};

// Function to update the latest month and year 
// (simplified since the trigger will handle updating latest_issue)
export const updateLatestIssue = async (month: number, year: number): Promise<boolean> => {
  try {
    // Update latest_month
    const { error: monthError } = await supabase
      .from('issue')
      .update({ value: JSON.stringify(month.toString()) })
      .eq('key', 'latest_month');
    
    if (monthError) {
      console.error("Error updating latest month:", monthError);
      return false;
    }
    
    // Update latest_year
    const { error: yearError } = await supabase
      .from('issue')
      .update({ value: JSON.stringify(year.toString()) })
      .eq('key', 'latest_year');
    
    if (yearError) {
      console.error("Error updating latest year:", yearError);
      return false;
    }
    
    // We don't need to update latest_issue manually anymore
    // as the database trigger will handle that automatically
    
    toast.success("Latest issue updated successfully");
    return true;
  } catch (error) {
    console.error("Error updating latest issue values:", error);
    toast.error("Failed to update latest issue");
    return false;
  }
};
