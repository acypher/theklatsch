import { Article } from "@/lib/types";
import { toast } from "sonner";

export const handleApiError = (error: any): never => {
  console.error("API Error:", error);
  toast.error("An unexpected error occurred. Please try again.");
  throw error;
};

// Make sure mapArticleFromDb includes the displayPosition mapping
export const mapArticleFromDb = (article: any): Article => {
  return {
    id: article.id,
    title: article.title,
    description: article.description,
    author: article.author || "Anonymous",
    keywords: article.keywords || [],
    // Handle imageurl as an array
    imageUrl: article.imageurl || [],
    sourceUrl: article.sourceurl || null,
    createdAt: article.created_at,
    more_content: article.more_content,
    deleted: article.deleted,
    deletedAt: article.deleted_at,
    displayPosition: article.display_position
  };
};
