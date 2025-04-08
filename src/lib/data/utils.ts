
import { toast } from "sonner";
import { Article } from "@/lib/types";

// Function to handle API errors
export const handleApiError = (error: unknown) => {
  console.error("API Error:", error);
  toast.error("Failed to connect to the articles database.");
  return []; // Return empty array instead of default articles
};

// Function to map database fields to our Article type
export const mapArticleFromDb = (dbArticle: any): Article => {
  return {
    id: dbArticle.id,
    title: dbArticle.title,
    description: dbArticle.description,
    author: dbArticle.author,
    keywords: dbArticle.keywords || [],
    imageUrl: dbArticle.imageurl,
    sourceUrl: dbArticle.sourceurl,
    createdAt: dbArticle.created_at,
    more_content: dbArticle.more_content,
    deleted: dbArticle.deleted,
    deletedAt: dbArticle.deleted_at
  };
};
