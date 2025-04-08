import { supabase } from "@/integrations/supabase/client";
import { Article } from "@/lib/types";
import { toast } from "sonner";
import { handleApiError, mapArticleFromDb } from "./utils";
import { getCurrentIssue } from "./issue/currentIssue";
import { getLatestMonth, getLatestYear } from "./issue/latestIssue";

// Function to get the month and year from an issue string (e.g., "May 2025" -> { month: 5, year: 2025 })
const parseIssueString = (issueString: string): { month: number | null, year: number | null } => {
  const months = {
    "January": 1, "February": 2, "March": 3, "April": 4, "May": 5, "June": 6, 
    "July": 7, "August": 8, "September": 9, "October": 10, "November": 11, "December": 12
  };
  
  try {
    const parts = issueString.trim().split(' ');
    if (parts.length !== 2) return { month: null, year: null };
    
    const monthName = parts[0];
    const year = parseInt(parts[1]);
    
    const month = months[monthName as keyof typeof months];
    
    if (!month || isNaN(year)) return { month: null, year: null };
    
    return { month, year };
  } catch (error) {
    console.error("Error parsing issue string:", error);
    return { month: null, year: null };
  }
};

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
    
    // Apply month/year filter if available
    if (month !== null && year !== null) {
      query = query.eq('month', month).eq('year', year);
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
    const newArticle = {
      title: article.title,
      description: article.description,
      author: article.author,
      keywords: article.keywords,
      imageurl: article.imageUrl,
      sourceurl: article.sourceUrl,
      more_content: article.more_content,
      user_id: (await supabase.auth.getUser()).data.user?.id
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
    const updatedArticle = {
      title: article.title,
      description: article.description,
      author: article.author,
      keywords: article.keywords,
      imageurl: article.imageUrl,
      sourceurl: article.sourceUrl,
      more_content: article.more_content
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

// Function to get articles by keyword
export const getArticlesByKeyword = async (keyword: string): Promise<Article[]> => {
  try {
    const { data: articles, error } = await supabase
      .from('articles')
      .select('*')
      .contains('keywords', [keyword])
      .eq('deleted', false)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return articles.map(mapArticleFromDb);
  } catch (error) {
    return handleApiError(error);
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

// Function to update article display order
export const updateArticlesOrder = async (articlesOrder: { id: string, position: number }[]): Promise<boolean> => {
  try {
    // Log what we're updating for debugging
    console.log("Updating article order with:", articlesOrder);
    
    // Track if all updates are successful
    let allSuccessful = true;
    
    // Perform updates one by one
    for (const item of articlesOrder) {
      console.log(`Updating article ${item.id} to position ${item.position}`);
      
      const { error } = await supabase
        .from('articles')
        .update({ display_position: item.position })
        .eq('id', item.id);
      
      if (error) {
        console.error(`Error updating article ${item.id} position:`, error);
        allSuccessful = false;
      }
    }
    
    if (allSuccessful) {
      console.log("All articles positions updated successfully");
      return true;
    } else {
      console.error("Some article position updates failed");
      return false;
    }
  } catch (error) {
    console.error("Error updating articles order:", error);
    toast.error("Failed to update article order");
    return false;
  }
};

// Function to update an article with the latest issue data and set its position to 1
export const updateArticleWithLatestIssue = async (articleId: string): Promise<boolean> => {
  try {
    // Get the latest month and year from the issue table
    const latestMonth = await getLatestMonth();
    const latestYear = await getLatestYear();
    
    console.log(`Updating article ${articleId} to latest issue: Month ${latestMonth}, Year ${latestYear}`);
    
    // Update the article with the latest issue data and set display_position to 1
    const { error } = await supabase
      .from('articles')
      .update({ 
        month: latestMonth,
        year: latestYear,
        display_position: 1 
      })
      .eq('id', articleId);
    
    if (error) {
      console.error("Error updating article with latest issue:", error);
      toast.error("Failed to update article with latest issue");
      return false;
    }
    
    toast.success("Article updated with latest issue data");
    return true;
  } catch (error) {
    console.error("Error updating article with latest issue:", error);
    toast.error("Failed to update article with latest issue");
    return false;
  }
};
