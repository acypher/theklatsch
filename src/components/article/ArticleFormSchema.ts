
import { z } from "zod";

export const articleFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(5000, "Title must be less than 5000 characters"),
  description: z.string().min(1, "Description is required").max(50000, "Description must be less than 50000 characters"),
  author: z.string().max(2000, "Author must be less than 2000 characters").optional(),
  keywords: z.string().max(5000, "Keywords must be less than 5000 characters").optional().describe("Space-separated keywords"),
  imageUrl: z.string().url("Must be a valid URL").max(2000, "URL must be less than 2000 characters").optional().or(z.literal("")),
  sourceUrl: z.string().url("Must be a valid URL").max(2000, "URL must be less than 2000 characters").optional().or(z.literal("")),
  summary: z.string().max(20000, "Summary must be less than 20000 characters").optional(),
  more_content: z.string().max(1000000, "Content must be less than 1000000 characters").optional(),
  private: z.boolean().optional(),
});

export type ArticleFormValues = z.infer<typeof articleFormSchema>;

export const DRAFT_STORAGE_KEY = "article_draft";

// Default form values
export const defaultFormValues: ArticleFormValues = {
  title: "",
  description: "",
  author: "",
  keywords: "",
  imageUrl: "",
  sourceUrl: "",
  summary: "",
  more_content: "",
  private: false
};
