
import { z } from "zod";

export const articleFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  author: z.string().optional(),
  keywords: z.string().optional().describe("Space-separated keywords"),
  imageUrl: z.string().optional(),
  sourceUrl: z.string().optional(),
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
  sourceUrl: ""
};
