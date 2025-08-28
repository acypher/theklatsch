
import { supabase } from "@/integrations/supabase/client";
import { Article } from "@/lib/types";
import { mapArticleFromDb } from "../utils";
import { parseIssueString } from "./issueHelper";
import { getCurrentIssue } from "../issue/currentIssue";

// Function to fetch all articles from Supabase
export const getAllArticles = async (): Promise<Article[]> => {
  try {
    // Get current issue to filter articles
    const currentIssueData = await getCurrentIssue();
    const currentIssue = currentIssueData?.text || "April 2025";
    
    console.log("Current issue for filtering articles:", currentIssue);
    
    // Parse the issue to get month and year
    const { month, year } = parseIssueString(currentIssue);
    
    console.log(`Filtering articles by month: ${month}, year: ${year}`);
    
    let query = supabase
      .from('articles')
      .select('*')
      .eq('deleted', false)
      .order('display_position', { ascending: true })
      .order('created_at', { ascending: false });
    
    // Apply month/year filter if available, but also include articles with "list" keyword
    if (month !== null && year !== null) {
      const filterString = `and(month.eq.${month},year.eq.${year}),keywords.cs.{"list"}`;
      console.log("DEBUG: Filter string:", filterString);
      query = query.or(filterString);
    }
    
    console.log("DEBUG: About to execute query...");
    const { data: articles, error } = await query;
    
    console.log("DEBUG: Query result:", { articles: articles?.length || 0, error });

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
