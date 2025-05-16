
import { updateArticle } from "./article/crudOperations";

// Function to update a specific article with display position
export const updateSpecificArticle = async (
  articleId: string, 
  updateData: any
): Promise<boolean> => {
  try {
    await updateArticle(articleId, updateData);
    return true;
  } catch (error) {
    console.error(`Error updating article ${articleId}:`, error);
    return false;
  }
};
