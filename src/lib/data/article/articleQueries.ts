
import { supabase } from "@/integrations/supabase/client";
import { Article } from "@/lib/types";
import { mapArticleFromDb } from "../utils";
import { parseIssueString } from "./issueHelper";
import { getCurrentIssue } from "../issue/currentIssue";

// Function to fetch all articles from Supabase
export const getAllArticles = async (issueText?: string): Promise<Article[]> => {
  try {
    // Issue selection is a *viewer preference*.
    // Only trust localStorage if it was explicitly set by the user (v2).
    const rawV2 = typeof window !== "undefined" ? localStorage.getItem("selected_issue_v2") : null;
    let userSelectedIssue: string | null = null;

    if (rawV2) {
      try {
        const parsed = JSON.parse(rawV2) as { issue?: unknown; source?: unknown };
        if (
          parsed?.source === "user" &&
          typeof parsed.issue === "string" &&
          parsed.issue.trim()
        ) {
          userSelectedIssue = parsed.issue.trim();
        }
      } catch {
        // ignore malformed v2
      }
    }

    // If there is no explicit v2 selection, clear legacy key to prevent stale cross-browser behavior.
    if (typeof window !== "undefined" && !userSelectedIssue) {
      localStorage.removeItem("selected_issue");
    }

    const currentIssue = issueText || userSelectedIssue || (await getCurrentIssue()).text || "April 2025";

    console.log("Current issue for filtering articles:", currentIssue);
    
    // Parse the issue to get month and year
    const { month, year } = parseIssueString(currentIssue);
    
    console.log(`Filtering articles by month: ${month}, year: ${year}`);
    console.log(`Current issue used for filtering: ${currentIssue}`);
    
    let query = supabase
      .from('articles')
      .select('*')
      .eq('deleted', false)
      .order('display_position', { ascending: true })
      .order('created_at', { ascending: false });
    
    // Apply month/year filter if available, and always include articles with "list" keyword
    if (month !== null && year !== null) {
      // Show articles from the specific month/year OR articles with "list" keyword (which should always appear)
      query = query.or(`and(month.eq.${month},year.eq.${year}),keywords.cs.{"list"}`);
    } else {
      // If no specific month/year, show articles with "list" keyword only
      query = query.contains('keywords', ['list']);
    }
    
    const { data: articles, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    if (articles && articles.length > 0) {
      return articles.map(mapArticleFromDb);
    } else {
      console.log("No articles found for the current issue");
      return [];
    }
  } catch (error) {
    console.error("Error fetching articles:", error);
    return [];
  }
};

// Function to get article by ID
export const getArticleById = async (id: string): Promise<Article | undefined> => {
  try {
    const { data: article, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .eq('deleted', false)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapArticleFromDb(article);
  } catch (error) {
    console.error(`Error fetching article ${id}:`, error);
    return undefined;
  }
};
