
import { updateArticleWithLatestIssue } from "./article/specialOperations";

// Function to update a specific article with the latest issue data
export const updateSpecificArticle = async (): Promise<void> => {
  const articleId = "d28f0fee-8b42-47bd-b576-838bb3397ba8";
  
  try {
    const success = await updateArticleWithLatestIssue(articleId);
    
    if (success) {
      console.log(`Successfully updated article ${articleId} with latest issue data`);
    } else {
      console.error(`Failed to update article ${articleId} with latest issue data`);
    }
  } catch (error) {
    console.error(`Error updating article ${articleId}:`, error);
  }
};

// Note: This function is now called only when explicitly needed, not automatically
