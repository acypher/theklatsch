import { supabase } from "@/integrations/supabase/client";
import { getLatestIssue } from "./latestIssue";

export interface Issue {
  month: number;
  year: number;
  text: string;
}

export const getAvailableIssues = async (): Promise<Issue[]> => {
  try {
    // Get back issues from the database
    const { data: backIssues, error } = await supabase
      .from('back_issues')
      .select('display_issue')
      .order('id', { ascending: false });

    if (error) {
      console.error("Error fetching back issues:", error);
      return [];
    }

    const issues: Issue[] = [];
    
    // Add back issues
    if (backIssues) {
      for (const backIssue of backIssues) {
        if (backIssue.display_issue) {
          const parts = backIssue.display_issue.trim().split(' ');
          if (parts.length === 2) {
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            const monthIndex = monthNames.indexOf(parts[0]);
            const year = parseInt(parts[1]);
            
            if (monthIndex !== -1 && !isNaN(year)) {
              issues.push({
                month: monthIndex + 1,
                year: year,
                text: backIssue.display_issue
              });
            }
          }
        }
      }
    }

    // Remove duplicates and sort by year/month descending
    const uniqueIssues = issues.filter((issue, index, self) => 
      index === self.findIndex(i => i.text === issue.text)
    );
    
    return uniqueIssues.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
  } catch (error) {
    console.error("Error in getAvailableIssues:", error);
    return [];
  }
};

export const setCurrentIssue = async (issueText: string): Promise<boolean> => {
  try {
    const parts = issueText.trim().split(' ');
    if (parts.length !== 2) return false;
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthIndex = monthNames.indexOf(parts[0]);
    const year = parseInt(parts[1]);
    
    if (monthIndex === -1 || isNaN(year)) return false;
    
    const month = monthIndex + 1;
    
    // Update all three values in parallel
    const [issueResult, monthResult, yearResult] = await Promise.all([
      supabase
        .from('issue')
        .update({ value: issueText })
        .eq('key', 'display_issue'),
      supabase
        .from('issue') 
        .update({ value: month.toString() })
        .eq('key', 'display_month'),
      supabase
        .from('issue')
        .update({ value: year.toString() })
        .eq('key', 'display_year')
    ]);
    
    if (issueResult.error || monthResult.error || yearResult.error) {
      console.error("Error updating issue values:", {
        issue: issueResult.error,
        month: monthResult.error, 
        year: yearResult.error
      });
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in setCurrentIssue:", error);
    return false;
  }
};