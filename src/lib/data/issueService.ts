
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Function to check and fix the current issue data
export const checkAndFixDisplayIssue = async (): Promise<{ text: string, wasFixed: boolean }> => {
  try {
    // First check the current value
    const { data, error } = await supabase
      .from('issue')
      .select('value')
      .eq('key', 'display_issue')
      .single();
    
    if (error) {
      console.error("Error fetching display issue:", error);
      toast.error("Failed to fetch display issue");
      return { text: "April 2025", wasFixed: false };
    }
    
    console.log("Current display issue value:", data?.value);
    
    // Check if the value is in the expected format
    let needsFix = false;
    let currentText = "April 2025"; // Default fallback
    
    if (data?.value) {
      try {
        // Handle different possible formats
        if (typeof data.value === 'string') {
          // If it's a plain string, check if it has quotes that need to be removed
          currentText = data.value.replace(/^"|"$/g, '');
        } else if (typeof data.value === 'object') {
          // If it's already an object (JSON), convert to string
          const stringValue = JSON.stringify(data.value);
          // Remove extra quotes that might be causing the issue
          currentText = stringValue.replace(/^"|"$/g, '').replace(/\\"/g, '');
        }
        
        // Check if the value contains "Unknown" or has JSON formatting issues
        if (currentText.includes("Unknown") || currentText.includes('\\"') || 
            currentText === "null" || currentText === "undefined") {
          needsFix = true;
        }
      } catch (e) {
        console.error("Error parsing issue value:", e);
        needsFix = true;
      }
    } else {
      // If no data or empty value, it needs to be fixed
      needsFix = true;
    }
    
    // Fix the value if needed
    if (needsFix) {
      console.log("Fixing display issue value...");
      const correctValue = "April 2025";
      
      // Update the value in the database with proper JSON format
      const { error: updateError } = await supabase
        .from('issue')
        .update({ value: JSON.stringify(correctValue) })
        .eq('key', 'display_issue');
      
      if (updateError) {
        console.error("Error updating display issue value:", updateError);
        toast.error("Failed to fix display issue value");
        return { text: correctValue, wasFixed: false };
      }
      
      toast.success("Display issue value has been fixed");
      return { text: correctValue, wasFixed: true };
    }
    
    return { text: currentText, wasFixed: false };
  } catch (error) {
    console.error("Unexpected error checking/fixing display issue:", error);
    toast.error("Unexpected error with display issue");
    return { text: "April 2025", wasFixed: false };
  }
};

// Function to get current issue data
export const getCurrentIssue = async (): Promise<{ text: string } | null> => {
  try {
    // Use the check and fix function to ensure we have a valid value
    const { text } = await checkAndFixDisplayIssue();
    return { text };
  } catch (error) {
    console.error("Error in getCurrentIssue:", error);
    return { text: "April 2025" }; // Default fallback
  }
};

// Function to update the current month and year in the issue table
export const updateCurrentMonthYear = async (month: number, year: number): Promise<boolean> => {
  try {
    // Update display_month - convert to string and store as JSON string
    const { error: monthError } = await supabase
      .from('issue')
      .update({ value: JSON.stringify(month.toString()) })
      .eq('key', 'display_month');
    
    if (monthError) {
      console.error("Error updating current month:", monthError);
      return false;
    }
    
    // Update display_year - convert to string and store as JSON string
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

// Function to check the current display issue value (kept for backward compatibility)
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
