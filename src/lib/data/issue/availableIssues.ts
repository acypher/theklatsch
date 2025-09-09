
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

    // Get back issues to include historical archives
    const { data: backIssues, error: backIssuesError } = await supabase
      .from('back_issues')
      .select('display_issue');

    if (backIssuesError) {
      console.error("Error fetching back issues:", backIssuesError);
    }

    // Create a map to avoid duplicates
    const issueMap = new Map<string, Issue>();
    
    // Convert month numbers to names
    const monthNames = [
      'January', 'February', 'March', 'April', 
      'May', 'June', 'July', 'August',
      'September', 'October', 'November', 'December'
    ];

    // Process articles data
    articlesData?.forEach(article => {
      if (article.month && article.year) {
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
    });

    // Process back issues data
    backIssues?.forEach(backIssue => {
      if (backIssue.display_issue) {
        const parts = backIssue.display_issue.trim().split(' ');
        if (parts.length === 2) {
          const monthName = parts[0];
          const year = parseInt(parts[1]);
          const month = monthNames.indexOf(monthName) + 1;
          
          if (month > 0 && !isNaN(year)) {
            const key = `${month}-${year}`;
            if (!issueMap.has(key)) {
              issueMap.set(key, {
                month,
                year,
                text: backIssue.display_issue
              });
            }
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
    // Don't use JSON.stringify - store the string directly
    const { error } = await supabase
      .from('issue')
      .update({ value: issueText })  // Changed from JSON.stringify(issueText)
      .eq('key', 'display_issue');
    
    if (error) {
      throw new Error(error.message);
    }
    
    return true;
  } catch (error) {
    console.error("Error updating current issue:", error);
    toast.error("Failed to update current issue");
    return false;
  }
};
