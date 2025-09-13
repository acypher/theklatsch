import { Article } from "@/lib/types";
import { toast } from "sonner";

export const handleApiError = (error: any): never => {
  console.error("API Error:", error);
  toast.error("An unexpected error occurred. Please try again.");
  throw error;
};

// Make sure mapArticleFromDb includes the displayPosition mapping
export const mapArticleFromDb = (article: any): Article => ({
  id: article.id,
  title: article.title,
  description: article.description,
  author: article.author,
  keywords: article.keywords || [],
  imageUrl: article.imageurl,
  sourceUrl: article.sourceurl,
  createdAt: article.created_at,
  more_content: article.more_content,
  deleted: article.deleted,
  deletedAt: article.deleted_at,
  displayPosition: article.display_position
});
