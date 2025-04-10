
import { supabase } from "@/integrations/supabase/client";
import { Article } from "@/lib/types";
import { toast } from "sonner";
import { handleApiError, mapArticleFromDb } from "../utils";
import { getLatestMonth, getLatestYear } from "../issue/latestIssue";

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
