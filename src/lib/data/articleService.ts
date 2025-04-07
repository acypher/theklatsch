
import { supabase } from "@/integrations/supabase/client";
import { Article } from "@/lib/types";
import { toast } from "sonner";
import { DEFAULT_ARTICLES, handleApiError, mapArticleFromDb } from "./utils";

// Function to fetch all articles from Supabase
export const getAllArticles = async (): Promise<Article[]> => {
  try {
    const { data: articles, error } = await supabase
      .from('articles')
      .select('*')
      .eq('deleted', false)
      .order('display_position', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    if (articles && articles.length > 0) {
      return articles.map(mapArticleFromDb);
    } else {
      console.log("No articles found in database, using default articles");
      return DEFAULT_ARTICLES;
    }
  } catch (error) {
    return handleApiError(error);
  }
};

// Function to get article by ID
export const getArticleById = async (id: string): Promise<Article | undefined> => {
  try {
    const { data: article, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .eq('deleted', false)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapArticleFromDb(article);
  } catch (error) {
    console.error(`Error fetching article ${id}:`, error);
    return DEFAULT_ARTICLES.find(article => article.id === id);
  }
};

// Function to add a new article to Supabase
export const addArticle = async (article: Omit<Article, 'id' | 'createdAt'>): Promise<Article> => {
  try {
    const newArticle = {
      title: article.title,
      description: article.description,
      author: article.author,
      keywords: article.keywords,
      imageurl: article.imageUrl,
      sourceurl: article.sourceUrl,
      more_content: article.more_content,
      user_id: (await supabase.auth.getUser()).data.user?.id
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
export const updateArticle = async (id: string, article: Omit<Article, 'id' | 'createdAt'>): Promise<Article> => {
  try {
    const updatedArticle = {
      title: article.title,
      description: article.description,
      author: article.author,
      keywords: article.keywords,
      imageurl: article.imageUrl,
      sourceurl: article.sourceUrl,
      more_content: article.more_content
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

// Function to get articles by keyword
export const getArticlesByKeyword = async (keyword: string): Promise<Article[]> => {
  try {
    const { data: articles, error } = await supabase
      .from('articles')
      .select('*')
      .contains('keywords', [keyword])
      .eq('deleted', false)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return articles.map(mapArticleFromDb);
  } catch (error) {
    return handleApiError(error);
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

// Function to update article display order
export const updateArticlesOrder = async (articlesOrder: { id: string, position: number }[]): Promise<boolean> => {
  try {
    // Log what we're updating for debugging
    console.log("Updating article order with:", articlesOrder);
    
    // Track if all updates are successful
    let allSuccessful = true;
    
    // Perform updates one by one
    for (const item of articlesOrder) {
      console.log(`Updating article ${item.id} to position ${item.position}`);
      
      const { error } = await supabase
        .from('articles')
        .update({ display_position: item.position })
        .eq('id', item.id);
      
      if (error) {
        console.error(`Error updating article ${item.id} position:`, error);
        allSuccessful = false;
      }
    }
    
    if (allSuccessful) {
      console.log("All articles positions updated successfully");
      return true;
    } else {
      console.error("Some article position updates failed");
      return false;
    }
  } catch (error) {
    console.error("Error updating articles order:", error);
    toast.error("Failed to update article order");
    return false;
  }
};
