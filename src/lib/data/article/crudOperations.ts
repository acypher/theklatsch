import { supabase } from "@/integrations/supabase/client";
import { Article } from "@/lib/types";
import { toast } from "sonner";
import { mapArticleFromDb, handleApiError } from "../utils";
import { determineDisplayPosition } from "./displayPosition";
import { getLatestMonth, getLatestYear } from "../issue/latestIssue";
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
      query = query.or(`and(month.eq.${month},year.eq.${year}),keywords.cs.{"list"}`);
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

// Function to add a new article to Supabase
export const addArticle = async (article: Omit<Article, 'id' | 'createdAt'>): Promise<Article> => {
  try {
    // Get the latest month and year from the issue table
    const latestMonth = await getLatestMonth();
    const latestYear = await getLatestYear();
    
    console.log(`Creating new article with latest issue: Month ${latestMonth}, Year ${latestYear}`);
    
    // Determine the display position based on tags/keywords
    const position = await determineDisplayPosition(article.keywords, latestMonth, latestYear);
    console.log(`Using display position ${position} for new article with keywords: ${article.keywords.join(', ')}`);
    
    const newArticle = {
      title: article.title,
      description: article.description,
      author: article.author,
      keywords: article.keywords,
      imageurl: article.imageUrl,
      sourceurl: article.sourceUrl,
      more_content: article.more_content,
      user_id: (await supabase.auth.getUser()).data.user?.id,
      month: latestMonth,
      year: latestYear,
      display_position: position
    };
    
    const { data, error } = await supabase
      .from('articles')
      .insert(newArticle)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapArticleFromDb(data);
  } catch (error) {
    console.error("Error adding article:", error);
    throw new Error("Failed to add article to the database");
  }
};

// Function to update an existing article in Supabase
export const updateArticle = async (id: string, article: Omit<Article, 'id' | 'createdAt'>): Promise<Article> => {
  try {
    // Get the current article to preserve its display position
    const { data: currentArticle, error: fetchError } = await supabase
      .from('articles')
      .select('display_position')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw new Error(fetchError.message);
    }

    console.log(`Updating article ${id} while preserving display position: ${currentArticle.display_position}`);

    const updatedArticle = {
      title: article.title,
      description: article.description,
      author: article.author,
      keywords: article.keywords,
      imageurl: article.imageUrl,
      sourceurl: article.sourceUrl,
      more_content: article.more_content,
      display_position: currentArticle.display_position // Preserve the original position
    };
    
    const { data, error } = await supabase
      .from('articles')
      .update(updatedArticle)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapArticleFromDb(data);
  } catch (error) {
    console.error("Error updating article:", error);
    throw new Error("Failed to update article in the database");
  }
};

// Function to delete an article from Supabase
export const deleteArticle = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('articles')
      .update({ 
        deleted: true, 
        deleted_at: new Date().toISOString() 
      })
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
    
    toast.success("Article marked as deleted");
    return true;
  } catch (error) {
    console.error("Error deleting article:", error);
    toast.error("Failed to delete article");
    return false;
  }
};
