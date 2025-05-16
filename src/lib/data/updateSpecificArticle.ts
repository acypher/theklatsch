
import { updateArticle } from "./article/crudOperations";

/**
 * Function to update a specific article with display position
 * or other specific fields without requiring the full article object
 */
export const updateSpecificArticle = async (
  articleId: string, 
  updateData: {
    display_position?: number;
    [key: string]: any;
  }
): Promise<boolean> => {
  try {
    console.log(`Updating article ${articleId} with data:`, updateData);
    await updateArticle(articleId, updateData);
    return true;
  } catch (error) {
    console.error(`Error updating article ${articleId}:`, error);
    return false;
  }
};
