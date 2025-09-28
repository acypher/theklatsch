import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, addMonths } from "date-fns";

export interface Issue {
  month: number;
  year: number;
  text: string;
}

export const getAvailableIssues = async (): Promise<Issue[]> => {
  try {
    // Get distinct month/year combinations from non-deleted articles
    const { data: articlesData, error: articlesError } = await supabase
      .from('articles')
      .select('month, year')
      .eq('deleted', false)
      .not('month', 'is', null)
      .not('year', 'is', null);

    if (articlesError) {
      throw new Error(articlesError.message);
    }

    // Create a map to avoid duplicates
    const issueMap = new Map<string, Issue>();
    
    // Convert month numbers to names
    const monthNames = [
      'January', 'February', 'March', 'April', 
      'May', 'June', 'July', 'August',
      'September', 'October', 'November', 'December'
    ];

    // Process articles data only (current format issues from April 2025+)
    articlesData?.forEach(article => {
      if (article.month && article.year) {
        // Only include issues from April 2025 onwards (current format)
        if (article.year > 2025 || (article.year === 2025 && article.month >= 4)) {
          const key = `${article.month}-${article.year}`;
          if (!issueMap.has(key)) {
            const monthName = monthNames[article.month - 1] || 'Unknown';
            issueMap.set(key, {
              month: article.month,
              year: article.year,
              text: `${monthName} ${article.year}`
            });
          }
        }
      }
    });

    // Convert map to array and sort by year (descending) and month (descending)
    return Array.from(issueMap.values()).sort((a, b) => {
      if (a.year !== b.year) {
        return b.year - a.year; // Most recent year first
      }
      return b.month - a.month; // Most recent month first
    });
  } catch (error) {
    console.error("Error fetching available issues:", error);
    toast.error("Failed to load available issues");
    return [];
  }
};

export const setCurrentIssue = async (issueText: string): Promise<boolean> => {
  try {
    // Parse the issueText to extract month and year
    const parts = issueText.trim().split(' ');
    if (parts.length !== 2) {
      throw new Error(`Invalid issue format: ${issueText}`);
    }
    
    const monthName = parts[0];
    const year = parseInt(parts[1]);
    
    const monthNames = [
      'January', 'February', 'March', 'April', 
      'May', 'June', 'July', 'August',
      'September', 'October', 'November', 'December'
    ];
    
    const month = monthNames.indexOf(monthName) + 1;
    
    if (month === 0 || isNaN(year)) {
      throw new Error(`Invalid month or year in: ${issueText}`);
    }
    
    // Update all three fields - store as raw JSONB (no double-stringify)
    const updates = [
      { key: 'display_issue', value: issueText },
      { key: 'display_month', value: month },
      { key: 'display_year', value: year }
    ];
    
    for (const update of updates) {
      const { error } = await supabase
        .from('issue')
        .update({ value: update.value })
        .eq('key', update.key);
      
      if (error) {
        throw new Error(`Error updating ${update.key}: ${error.message}`);
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error updating current issue:", error);
    toast.error("Failed to update current issue");
    return false;
  }
};