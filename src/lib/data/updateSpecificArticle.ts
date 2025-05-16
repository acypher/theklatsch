
import { Article } from "@/lib/types";
import { updateArticle } from "./article/crudOperations";
import { supabase } from "@/integrations/supabase/client";

/**
 * Function to update a specific article with display position
 * or other specific fields without requiring the full article object
 */
export const updateSpecificArticle = async (
  articleId: string, 
  updateData: Partial<Pick<Article, "displayPosition">> & { [key: string]: any }
): Promise<boolean> => {
  try {
    console.log(`Updating article ${articleId} with data:`, updateData);
    
    // First, fetch the current article data
    const { data: currentArticle, error: fetchError } = await supabase
      .from('articles')
      .select('*')
      .eq('id', articleId)
      .single();
    
    if (fetchError) {
      console.error(`Error fetching article ${articleId}:`, fetchError);
      return false;
    }
    
    // Map the database fields to our Article type
    const mappedArticle: Omit<Article, "id" | "createdAt"> = {
      title: currentArticle.title,
      description: currentArticle.description,
      author: currentArticle.author,
      keywords: currentArticle.keywords || [],
      imageUrl: currentArticle.imageurl || [],
      sourceUrl: currentArticle.sourceurl || "",
      more_content: currentArticle.more_content || "",
      deleted: currentArticle.deleted,
      deletedAt: currentArticle.deleted_at,
      displayPosition: updateData.displayPosition !== undefined 
        ? updateData.displayPosition 
        : currentArticle.display_position
    };
    
    // Apply any other updates
    if (updateData.title) mappedArticle.title = updateData.title;
    if (updateData.description) mappedArticle.description = updateData.description;
    if (updateData.author) mappedArticle.author = updateData.author;
    if (updateData.keywords) mappedArticle.keywords = updateData.keywords;
    if (updateData.imageUrl) mappedArticle.imageUrl = updateData.imageUrl;
    if (updateData.sourceUrl) mappedArticle.sourceUrl = updateData.sourceUrl;
    if (updateData.more_content) mappedArticle.more_content = updateData.more_content;
    
    await updateArticle(articleId, mappedArticle);
    return true;
  } catch (error) {
    console.error(`Error updating article ${articleId}:`, error);
    return false;
  }
};
