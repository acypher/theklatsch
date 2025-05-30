
import { supabase } from "@/integrations/supabase/client";
import { Article } from "@/lib/types";
import { toast } from "sonner";
import { mapArticleFromDb } from "../utils";
import { determineDisplayPosition } from "./displayPosition";
import { getLatestMonth, getLatestYear } from "../issue/latestIssue";

interface UpdateOptions {
  preservePosition?: boolean;
  originalPosition?: number | null;
}

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
export const updateArticle = async (
  id: string, 
  article: Omit<Article, 'id' | 'createdAt'>, 
  options: UpdateOptions = {}
): Promise<Article> => {
  try {
    // First, get the current article to determine its month and year
    const { data: currentArticle, error: fetchError } = await supabase
      .from('articles')
      .select('month, year, display_position')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw new Error(fetchError.message);
    }

    let position: number;

    if (options.preservePosition && options.originalPosition !== null && options.originalPosition !== undefined) {
      // Preserve the original position
      position = options.originalPosition;
      console.log(`Preserving original position: ${position}`);
    } else {
      // Recalculate display position based on keywords
      position = await determineDisplayPosition(
        article.keywords, 
        currentArticle.month, 
        currentArticle.year
      );
      console.log(`Recalculating position for updated article ${id} with keywords: ${article.keywords.join(', ')}`);
      console.log(`New position: ${position}`);
    }

    const updatedArticle = {
      title: article.title,
      description: article.description,
      author: article.author,
      keywords: article.keywords,
      imageurl: article.imageUrl,
      sourceurl: article.sourceUrl,
      more_content: article.more_content,
      display_position: position
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
