
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
    const { data, error } = await supabase
      .from('articles')
      .select('month, year')
      .eq('deleted', false)
      .not('month', 'is', null)
      .not('year', 'is', null);

    if (error) {
      throw new Error(error.message);
    }

    // Create a map to avoid duplicates
    const issueMap = new Map<string, Issue>();
    
    // Convert month numbers to names
    const monthNames = [
      'January', 'February', 'March', 'April', 
      'May', 'June', 'July', 'August',
      'September', 'October', 'November', 'December'
    ];

    // Add next month's issue as the first entry
    const today = new Date();
    const nextMonth = addMonths(today, 1);
    const nextMonthNum = nextMonth.getMonth() + 1; // 1-12
    const nextMonthYear = nextMonth.getFullYear();
    const nextMonthName = format(nextMonth, 'MMMM');

    issueMap.set(`${nextMonthNum}-${nextMonthYear}`, {
      month: nextMonthNum,
      year: nextMonthYear,
      text: `${nextMonthName} ${nextMonthYear}`
    });

    // Process and deduplicate the issues
    data.forEach(article => {
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
    const { error } = await supabase
      .from('issue')
      .update({ value: JSON.stringify(issueText) })
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
